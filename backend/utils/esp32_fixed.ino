
/*
  Fixed ESP32 sketch for Sentry backend
  - Posts to /api/devices/data with espId and ssid
  - Better error logging and retry
  - Uses backend IP 10.16.83.20 (set `backendHost` below to your LAN IP)
*/

#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>

// === Pin Definitions ===
#define CURRENT_SENSOR_PIN 34
#define VOLTAGE_SENSOR_PIN 35
#define RELAY_PIN_1 21
#define RELAY_PIN_2 22

// === Backend Host ===
// Set this to your machine running the backend (use IP on LAN)
const char* backendHost = "http://10.180.50.20:3001"; // e.g. "http://10.180.50.20:3001"
String postUrl = String(backendHost) + "/api/devices/data"; // POST endpoint for ESP data
String credentialsUrl = String(backendHost) + "/api/wifi/credentials";

// === Fallback WiFi (optional) ===
// If you want the ESP to connect immediately after flashing, set these
// to your network's SSID and password before uploading the sketch.
const char* DEFAULT_SSID = "Galaxy A13 AF52"; // e.g. "MyHomeWiFi"
const char* DEFAULT_PASS = "12345678"; // e.g. "supersecret"

// === Sensor Settings ===
const float currentSensitivity = 0.185; // adjust to your sensor
const float voltageReference = 3.3;
const int adcResolution = 4095;
const int samples = 200;
const float voltageDividerRatio = 2.0;
const float noiseThreshold = 0.01;

String espId;
float zeroCurrentVoltage = 0;
String registeredDeviceName = "";
String registeredDeviceRoom = "";

// Relay wiring config: set to true if your relay module is active-low (common for many modules)
#define RELAY_ACTIVE_LOW true

// Relay state cache so we can report or check state locally
bool relayState1 = false;
bool relayState2 = false;
// Keep previous state to detect transitions
bool prevRelayState1 = false;
bool prevRelayState2 = false;

// Minimum voltage to consider the load actually powered and worth reporting
// Increase this if you see small floating voltages while device is off.
// Thresholds: lower defaults so small measured DC voltages or small currents
// register as a powered load. Tune if you see false positives.
const float MIN_REPORT_VOLTAGE = 1.5; // volts (tune for your hardware)
// Minimum current (A) to consider the load drawing power and worth reporting
const float MIN_REPORT_CURRENT = 0.02; // amps (tune for your sensor/noise)

// Posting/rate-limit control
// Use a conservative default (60s) to avoid server rate limits. Adjust as needed.
const unsigned long BASE_POST_INTERVAL_MS = 60000; // 60s between normal posts
const unsigned long MAX_POST_INTERVAL_MS = 120000; // 2 minutes max backoff
unsigned long currentPostIntervalMs = BASE_POST_INTERVAL_MS;
unsigned long lastPostMillis = 0;
int backoffAttempts = 0;
int lastHttpCode = 0;
// Minimum gap to allow an immediate post following a relay transition (ms)
const unsigned long MIN_IMMEDIATE_POST_GAP_MS = 5000;
// Transition sampling: try several samples after relay-on to capture rising voltage/current
const int TRANSITION_MAX_SAMPLES = 10;
const unsigned long TRANSITION_SAMPLE_DELAY_MS = 200; // ms between samples

// Reporting interval when relay is ON (send readings every second)
const unsigned long REPORTING_INTERVAL_MS = 1000;

// Runtime helpers for printing/reporting
unsigned long lastRelayPrintMillis = 0;
bool deviceOffPrinted = false;

// Attempt to connect to a WiFi network (returns true if connected)
bool connectToWiFiOnce(const char* ssid, const char* password, int maxAttempts = 40) {
  if (!ssid || strlen(ssid) == 0) return false;
  Serial.printf("Connecting to WiFi '%s'...\n", ssid);
  // Do not clear stored credentials on the ESP (WiFi.disconnect(true)) as that will
  // remove persisted WiFi and cause the device to forget the network on power cycles.
  // Ensure station mode and auto-reconnect so stored credentials are used across reboots
  WiFi.mode(WIFI_STA);
  WiFi.setAutoReconnect(true);
  // Disconnect first (without erasing saved credentials) so WiFi.begin will attempt
  // to connect to the provided SSID even if we're currently associated with another AP.
  WiFi.disconnect();
  WiFi.begin(ssid, password);
  int attempts = 0;
  while (WiFi.status() != WL_CONNECTED && attempts < maxAttempts) {
    delay(500);
    Serial.print('.');
    attempts++;
  }
  if (WiFi.status() == WL_CONNECTED) {
    Serial.println("\nWiFi connected!");
    Serial.print("IP: "); Serial.println(WiFi.localIP());
    return true;
  }
  Serial.println("\nWiFi connection failed");
  return false;
}

// Poll backend /api/wifi/credentials for saved credentials
bool pollCredentialsAndConnect() {
  // If already connected, still poll the backend to see if there are stored credentials
  // that differ from the current SSID. This allows the device to switch to the
  // user's configured WiFi after initial provisioning on DEFAULT_SSID or another network.

  HTTPClient http;
  // Use c_str() to ensure compatibility with different HTTPClient overloads
  http.begin(credentialsUrl.c_str());
  int code = http.GET();
  Serial.printf("Current SSID: %s\n", WiFi.SSID().c_str());
  if (code == 200) {
    String payload = http.getString();
    // credentials payload is small, but allow some headroom
    DynamicJsonDocument doc(1024);
    auto err = deserializeJson(doc, payload);
    if (!err && doc.containsKey("ssid") && doc.containsKey("password")) {
      const char* ssid = doc["ssid"];
      const char* pass = doc["password"];
      Serial.printf("Got credentials from backend: %s\n", ssid);
      // If we're already connected to the same SSID, nothing to do
      String current = WiFi.SSID();
      if (WiFi.status() == WL_CONNECTED && current == String(ssid)) {
        Serial.println("Already connected to backend SSID");
        http.end();
        return true;
      }
      // Attempt to connect to backend-provided credentials
      http.end();
      bool ok = connectToWiFiOnce(ssid, pass, 60);
      if (ok) {
        Serial.println("Switched to backend-provided WiFi");
        return true;
      } else {
        Serial.println("Failed to connect to backend-provided WiFi");
        return false;
      }
    } else {
      Serial.println("Credentials JSON invalid or missing fields");
    }
  } else if (code == 404) {
    Serial.println("No credentials available on backend (404)");
  } else {
    Serial.printf("GET credentials returned %d\n", code);
  }
  http.end();
  return false;
}

// Periodically poll backend for credentials even when connected to a fallback SSID
const unsigned long CREDENTIAL_POLL_INTERVAL_MS = 60000; // 60s
unsigned long lastCredentialPollMillis = 0;

// Post sensor data to backend
// socketMask: bit1 -> relay1, bit2 -> relay2. Optional, used for debugging/metadata.
int sendSensorData(float current, float voltage, int socketMask = 0) {
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("Not connected - skipping POST");
    return -1;
  }

  HTTPClient http;
  String url = postUrl; // already contains /api/devices/data
  http.begin(url.c_str());
  http.addHeader("Content-Type", "application/json");

  DynamicJsonDocument doc(512);
  doc["espId"] = espId;
  doc["current"] = current;
  doc["voltage"] = voltage;
  doc["ssid"] = WiFi.SSID();
  if (socketMask > 0) doc["activeSockets"] = socketMask;
  String body;
  serializeJson(doc, body);

  Serial.println("POST payload: " + body);
  Serial.print("WiFi status: "); Serial.println(WiFi.status());
  Serial.print("Local IP before POST: "); Serial.println(WiFi.localIP());
  int code = http.POST(body);
  Serial.printf("POST result code: %d\n", code);
  if (code > 0) {
    String resp = http.getString();
    Serial.println("POST response: " + resp);
    // Try to parse JSON response to extract device metadata if present
    DynamicJsonDocument respDoc(1024);
    auto err = deserializeJson(respDoc, resp);
    if (!err && respDoc.containsKey("device")) {
      JsonObject dev = respDoc["device"].as<JsonObject>();
      const char* dname = dev["name"] | "(unknown)";
      const char* droom = dev["room"] | "(unknown)";
      Serial.printf("Registered Device: %s (Room: %s)\n", dname, droom);
      registeredDeviceName = String(dname);
      registeredDeviceRoom = String(droom);
    }
    // Centralized post-result handling: update backoff and lastPostMillis so
    // callers don't immediately retry after a 429.
    lastHttpCode = code;
    if (code == 429) {
      backoffAttempts++;
      currentPostIntervalMs = MAX_POST_INTERVAL_MS;
      lastPostMillis = millis();
      Serial.printf("Server returned 429, applying backoff %lu ms (attempt %d)\n", currentPostIntervalMs, backoffAttempts);
    } else if (code >= 200 && code < 300) {
      backoffAttempts = 0;
      currentPostIntervalMs = BASE_POST_INTERVAL_MS;
      lastPostMillis = millis();
    }
    http.end();
    return code;
  } else {
    Serial.printf("POST failed, error=%d\n", code);
    String errStr = http.errorToString(code);
    Serial.print("HTTP error string: "); Serial.println(errStr);
    http.end();
    lastHttpCode = code;
    // treat as immediate failure; update lastPostMillis to avoid tight loops
    lastPostMillis = millis();
    return code;
  }
}

void setup() {
  Serial.begin(115200);
  analogReadResolution(12);

  pinMode(RELAY_PIN_1, OUTPUT);
  pinMode(RELAY_PIN_2, OUTPUT);
  // Set relays to OFF by default. For active-low modules, OFF = HIGH.
  if (RELAY_ACTIVE_LOW) {
    digitalWrite(RELAY_PIN_1, HIGH);
    digitalWrite(RELAY_PIN_2, HIGH);
    relayState1 = false;
    relayState2 = false;
  } else {
    digitalWrite(RELAY_PIN_1, LOW);
    digitalWrite(RELAY_PIN_2, LOW);
    relayState1 = false;
    relayState2 = false;
  }

  espId = WiFi.macAddress();
  Serial.print("espId: "); Serial.println(espId);

  // Set a hostname for the device (useful for router/MDNS visibility)
  WiFi.setHostname(espId.c_str());

  // Calibrate zero current
  long sum = 0;
  for (int i = 0; i < samples; i++) {
    sum += analogRead(CURRENT_SENSOR_PIN);
    delay(1);
  }
  float avgADC = sum / (float)samples;
  zeroCurrentVoltage = (avgADC / (float)adcResolution) * voltageReference - 0.003;
  Serial.print("Zero Current Voltage: "); Serial.println(zeroCurrentVoltage);

  // If DEFAULT_SSID provided, try to connect immediately
  if (strlen(DEFAULT_SSID) > 0) {
    bool ok = connectToWiFiOnce(DEFAULT_SSID, DEFAULT_PASS, 60);
    if (ok) {
      // send quick registration so backend knows about us
      // update espId after connection
      espId = WiFi.macAddress();
      Serial.print("MAC after connect: "); Serial.println(espId);
      sendSensorData(0.0, 0.0);
    }
  }
}

void loop() {
  // Periodically poll credentials even when connected. This helps devices
  // that were provisioned on a fallback/default network to switch to the
  // user-provided WiFi once backend credentials are available.
  if (millis() - lastCredentialPollMillis >= CREDENTIAL_POLL_INTERVAL_MS) {
    lastCredentialPollMillis = millis();
    bool got = pollCredentialsAndConnect();
    if (got) {
      // If we switched networks, update espId and register
      espId = WiFi.macAddress();
      Serial.print("MAC after connect: "); Serial.println(espId);
      Serial.print("Local IP: "); Serial.println(WiFi.localIP());
      sendSensorData(0.0, 0.0);
    }
  }

  // Ensure we are connected - if not, try a few times to fetch credentials and connect
  if (WiFi.status() != WL_CONNECTED) {
    bool ok = false;
    int attempts = 0;
    while (!ok && attempts < 6) {
      ok = pollCredentialsAndConnect();
      if (!ok) {
        attempts++;
        Serial.printf("Polling credentials attempt %d failed, retrying...\n", attempts);
        delay(2000 * attempts);
      }
    }
    if (!ok) {
      // Could not connect right now - wait and try again later
      delay(5000);
      return;
    }
    // After connecting, send a registration POST to trigger discovery
    espId = WiFi.macAddress();
    Serial.print("MAC after connect: "); Serial.println(espId);
    Serial.print("Local IP: "); Serial.println(WiFi.localIP());
    sendSensorData(0.0, 0.0);
  }

  // Poll backend for relay states every cycle (or rate-limit if needed)
  if (WiFi.status() == WL_CONNECTED) {
    HTTPClient http;
    String relayUrl = String(backendHost) + "/api/devices/" + espId + "/relay";
    http.begin(relayUrl.c_str());
    int code = http.GET();
    if (code == 200) {
      String payload = http.getString();
      DynamicJsonDocument doc(512);
      auto err = deserializeJson(doc, payload);
      if (!err && doc["success"]) {
        bool main = doc["relays"]["mainSocket"] | false;
        bool backup = doc["relays"]["backupSocket"] | false;
        // Only change outputs when state differs to avoid unnecessary writes
        if (main != relayState1) {
          if (RELAY_ACTIVE_LOW) digitalWrite(RELAY_PIN_1, main ? LOW : HIGH);
          else digitalWrite(RELAY_PIN_1, main ? HIGH : LOW);
          // If relay just turned ON, give time for voltage to stabilize
          if (main && !relayState1) {
            Serial.println("Relay1 transition detected, waiting for voltage stabilization...");
            delay(500); // small stabilization delay, tune as necessary
          }
          relayState1 = main;
        }
        if (backup != relayState2) {
          if (RELAY_ACTIVE_LOW) digitalWrite(RELAY_PIN_2, backup ? LOW : HIGH);
          else digitalWrite(RELAY_PIN_2, backup ? HIGH : LOW);
          relayState2 = backup;
        }
      }
    }
    http.end();
  }

  // Read sensors after relay polling and after any short stabilization delay
  int rawVoltage = analogRead(VOLTAGE_SENSOR_PIN);
  float dcVoltage = (rawVoltage / (float)adcResolution) * voltageReference * voltageDividerRatio;

  long currentSum = 0;
  for (int i = 0; i < samples; i++) currentSum += analogRead(CURRENT_SENSOR_PIN);
  float avgADC2 = currentSum / (float)samples;
  float sensorVoltage = (avgADC2 / adcResolution) * voltageReference;
  float current = (sensorVoltage - zeroCurrentVoltage) / currentSensitivity;
  if (abs(current) < noiseThreshold) current = 0.0;
  if (current < 0) current = 0.0;

  // NOTE: we intentionally avoid printing raw sensor values every loop here.
  // Logging below will only print meaningful readings when the device is
  // actually powered (relay ON and voltage above threshold).

  // Decide what to send: only report real values when main relay is ON and voltage looks valid
  float reportCurrent = 0.0;
  float reportVoltage = 0.0;
  // If main relay is ON and measured DC voltage is above threshold, report actual readings
  // Report if relay is ON and either voltage OR current indicate a powered load.
  if (relayState1 && (dcVoltage >= MIN_REPORT_VOLTAGE || current >= MIN_REPORT_CURRENT)) {
    reportCurrent = current;
    reportVoltage = dcVoltage;
  } else {
    // If either relay just turned ON, print info and sample a few times to capture rising measurements
    bool relay1JustOn = relayState1 && !prevRelayState1;
    bool relay2JustOn = relayState2 && !prevRelayState2;
    if (relay1JustOn || relay2JustOn) {
      if (registeredDeviceName.length() > 0) {
        Serial.printf("Relay transition for device '%s' (Room: %s) - relay1:%s relay2:%s\n",
                      registeredDeviceName.c_str(), registeredDeviceRoom.c_str(), relay1JustOn ? "ON" : "-", relay2JustOn ? "ON" : "-");
      } else {
        Serial.printf("Relay transition for ESP %s - relay1:%s relay2:%s\n", espId.c_str(), relay1JustOn ? "ON" : "-", relay2JustOn ? "ON" : "-");
      }

      // Try multiple samples after relay-on to capture rising voltage/current
      float newDcVoltage = 0.0;
      float newCurrent = 0.0;
      for (int attempt = 0; attempt < TRANSITION_MAX_SAMPLES; attempt++) {
        int rawV = analogRead(VOLTAGE_SENSOR_PIN);
        newDcVoltage = (rawV / (float)adcResolution) * voltageReference * voltageDividerRatio;
        long newCurrentSum = 0;
        for (int i = 0; i < samples; i++) newCurrentSum += analogRead(CURRENT_SENSOR_PIN);
        float newAvg = newCurrentSum / (float)samples;
        float newSensorVoltage = (newAvg / adcResolution) * voltageReference;
        newCurrent = (newSensorVoltage - zeroCurrentVoltage) / currentSensitivity;
        if (abs(newCurrent) < noiseThreshold) newCurrent = 0.0;
        if (newCurrent < 0) newCurrent = 0.0;

        if (newDcVoltage >= MIN_REPORT_VOLTAGE || newCurrent >= MIN_REPORT_CURRENT) {
          reportCurrent = newCurrent;
          reportVoltage = newDcVoltage;
          break; // we have valid readings
        }
        delay(TRANSITION_SAMPLE_DELAY_MS);
      }

      // Only do an immediate POST if it's been at least MIN_IMMEDIATE_POST_GAP_MS since last post
      if (millis() - lastPostMillis >= MIN_IMMEDIATE_POST_GAP_MS) {
        int socketMask = (relayState1 ? 1 : 0) | (relayState2 ? 2 : 0);
        int initialPost = sendSensorData(reportCurrent, reportVoltage, socketMask);
        (void)initialPost; // sendSensorData handles backoff and lastPostMillis
      } else {
        Serial.println("Skipping immediate POST to respect rate limit gap");
      }
    }
    // ensure prevRelayStateX updated below
  }

  unsigned long now = millis();

  // If either relay is ON we consider the device 'powered' and report regularly.
  if (relayState1 || relayState2) {
    // Device is ON: report every REPORTING_INTERVAL_MS
    if (now - lastPostMillis >= REPORTING_INTERVAL_MS) {
      // Sample sensors fresh
      int rawV = analogRead(VOLTAGE_SENSOR_PIN);
      float freshDcVoltage = (rawV / (float)adcResolution) * voltageReference * voltageDividerRatio;
      long newCurrentSum = 0;
      for (int i = 0; i < samples; i++) newCurrentSum += analogRead(CURRENT_SENSOR_PIN);
      float freshAvg = newCurrentSum / (float)samples;
      float freshSensorVoltage = (freshAvg / adcResolution) * voltageReference;
      float freshCurrent = (freshSensorVoltage - zeroCurrentVoltage) / currentSensitivity;
      if (abs(freshCurrent) < noiseThreshold) freshCurrent = 0.0;
      if (freshCurrent < 0) freshCurrent = 0.0;

      // Decide whether to report real values or zeros (if below thresholds)
      float sendCurrent = 0.0;
      float sendVoltage = 0.0;
      if (freshDcVoltage >= MIN_REPORT_VOLTAGE || freshCurrent >= MIN_REPORT_CURRENT) {
        sendCurrent = freshCurrent;
        sendVoltage = freshDcVoltage;
      }

  int socketMask = (relayState1 ? 1 : 0) | (relayState2 ? 2 : 0);
  int httpCode = sendSensorData(sendCurrent, sendVoltage, socketMask);
      // Reset flags
      deviceOffPrinted = false;

      // Print the reading for debug/UI
      if (sendVoltage >= MIN_REPORT_VOLTAGE || sendCurrent >= MIN_REPORT_CURRENT) {
        if (registeredDeviceName.length() > 0) {
          Serial.printf("Device: %s | Room: %s | Current: %.3f A | Voltage: %.2f V\n", registeredDeviceName.c_str(), registeredDeviceRoom.c_str(), sendCurrent, sendVoltage);
        } else {
          Serial.printf("ESP: %s | Current: %.3f A | Voltage: %.2f V\n", espId.c_str(), sendCurrent, sendVoltage);
        }
      }

      // Backoff handling
      if (httpCode == 429) {
        backoffAttempts++;
        currentPostIntervalMs = MAX_POST_INTERVAL_MS;
        Serial.printf("Server returned 429, setting post interval to %lu ms (attempt %d)\n", currentPostIntervalMs, backoffAttempts);
      } else if (httpCode >= 200 && httpCode < 300) {
        backoffAttempts = 0;
        currentPostIntervalMs = BASE_POST_INTERVAL_MS;
      } else {
        backoffAttempts++;
        currentPostIntervalMs = min<unsigned long>(BASE_POST_INTERVAL_MS * (1UL << min(backoffAttempts, 4)), MAX_POST_INTERVAL_MS);
        Serial.printf("POST returned %d, applying backoff interval %lu ms\n", httpCode, currentPostIntervalMs);
      }

    } else {
      // small delay to yield
      delay(10);
    }
  } else {
    // Device is OFF: send a single zero post once and print device OFF
    if (!deviceOffPrinted) {
      int socketMask = (relayState1 ? 1 : 0) | (relayState2 ? 2 : 0);
      int httpCode = sendSensorData(0.0, 0.0, socketMask);
      // Only print device OFF after we've posted zeros to backend
      if (registeredDeviceName.length() > 0) Serial.printf("Device OFF: %s | Room: %s\n", registeredDeviceName.c_str(), registeredDeviceRoom.c_str());
      else Serial.printf("Device OFF: %s\n", espId.c_str());
  deviceOffPrinted = true;
    }
    // sleep briefly to avoid busy loop when off
    delay(100);
  }

  // track previous relay state for transition detection
  prevRelayState1 = relayState1;
  prevRelayState2 = relayState2;

}
