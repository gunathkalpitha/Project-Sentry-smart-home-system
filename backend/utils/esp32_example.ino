/*
  ESP32 sketch (Arduino) - polls backend for WiFi credentials and posts sensor data
  - Uses HTTP polling to GET /api/wifi/credentials
  - Posts sensor data to /api/devices/data with { espId, current, voltage }
  - Replace DEFAULT_SSID / DEFAULT_PASS fallback if needed
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
const char* backendHost = "http://10.249.22.20:3001"; // your backend
String credentialsUrl = String(backendHost) + "/api/wifi/credentials";
String postUrl = String(backendHost) + "/api/devices/data"; // POST endpoint for ESP data

// Fallback WiFi (optional)
const char* DEFAULT_SSID = "";
const char* DEFAULT_PASS = "";

// === Sensor Settings ===
const float currentSensitivity = 0.185;
const float voltageReference = 3.3;
const int adcResolution = 4095;
const int samples = 200;
const float voltageDividerRatio = 2.0;
const float noiseThreshold = 0.01;

String espId;
float zeroCurrentVoltage = 0;

void connectToWiFi(const char* ssid, const char* password) {
  if (!ssid || strlen(ssid) == 0) return;
  // Do not call WiFi.disconnect(true) here; that clears stored credentials on the ESP.
  // Use autoReconnect so the ESP persists and reconnects automatically.
  WiFi.setAutoReconnect(true);
  WiFi.begin(ssid, password);
  Serial.printf("Connecting to WiFi: %s\n", ssid);
  int tries = 0;
  while (WiFi.status() != WL_CONNECTED && tries < 60) {
    delay(500);
    Serial.print('.');
    tries++;
  }
  if (WiFi.status() == WL_CONNECTED) {
    Serial.println("\nWiFi connected!");
  } else {
    Serial.println("\nWiFi connection failed.");
  }
}

void setup() {
  Serial.begin(115200);
  analogReadResolution(12);

  pinMode(RELAY_PIN_1, OUTPUT);
  pinMode(RELAY_PIN_2, OUTPUT);
  digitalWrite(RELAY_PIN_1, LOW);
  digitalWrite(RELAY_PIN_2, LOW);

  espId = WiFi.macAddress();

  // Calibrate zero current
  long sum = 0;
  for (int i = 0; i < samples; i++) {
    sum += analogRead(CURRENT_SENSOR_PIN);
    delay(1);
  }
  float avgADC = sum / (float)samples;
  zeroCurrentVoltage = (avgADC / adcResolution) * voltageReference - 0.003;
  Serial.printf("Zero Current Voltage: %.4f\n", zeroCurrentVoltage);

  // Try fallback WiFi first (if set)
  if (strlen(DEFAULT_SSID) > 0) connectToWiFi(DEFAULT_SSID, DEFAULT_PASS);
}

// Poll backend for credentials (if not connected)
bool pollForCredentialsAndConnect() {
  if (WiFi.status() == WL_CONNECTED) return true;

  HTTPClient http;
  http.begin(credentialsUrl);
  int code = http.GET();
  if (code == 200) {
    String payload = http.getString();
    DynamicJsonDocument doc(256);
    DeserializationError err = deserializeJson(doc, payload);
    if (!err && doc.containsKey("ssid") && doc.containsKey("password")) {
      const char* ssid = doc["ssid"];
      const char* pass = doc["password"];
      Serial.println("Got credentials from backend, attempting connect...");
      connectToWiFi(ssid, pass);
      http.end();
      return WiFi.status() == WL_CONNECTED;
    }
  }
  http.end();
  return false;
}

void sendSensorData(float current, float voltage) {
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("Not connected, skipping POST");
    return;
  }

  HTTPClient http;
  http.begin(postUrl);
  http.addHeader("Content-Type", "application/json");

  DynamicJsonDocument doc(256);
  doc["espId"] = espId;
  doc["current"] = current;
  doc["voltage"] = voltage;
  doc["ssid"] = WiFi.SSID();
  String payload;
  serializeJson(doc, payload);

  int httpCode = http.POST(payload);
  if (httpCode > 0) {
    String response = http.getString();
    Serial.println("POST Response: " + response);
  } else {
    Serial.println("POST failed");
  }
  http.end();
}

void loop() {
  // If not connected, poll backend for credentials
  if (WiFi.status() != WL_CONNECTED) {
    bool ok = pollForCredentialsAndConnect();
    if (!ok) {
      delay(2000);
      return;
    }
  }

  // Read voltage
  int rawVoltage = analogRead(VOLTAGE_SENSOR_PIN);
  float dcVoltage = (rawVoltage / (float)adcResolution) * voltageReference * voltageDividerRatio;

  // Read current
  long currentSum = 0;
  for (int i = 0; i < samples; i++) currentSum += analogRead(CURRENT_SENSOR_PIN);
  float avgADC = currentSum / (float)samples;
  float sensorVoltage = (avgADC / adcResolution) * voltageReference;
  float current = (sensorVoltage - zeroCurrentVoltage) / currentSensitivity;
  if (abs(current) < noiseThreshold) current = 0.0;
  if (current < 0) current = 0.0;

  Serial.printf("espId=%s | Current=%.3f A | Voltage=%.2f V\n", espId.c_str(), current, dcVoltage);

  sendSensorData(current, dcVoltage);

  delay(2000);
}
