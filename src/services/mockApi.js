import { mockDevices } from "../data/mockDevices";
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
class MockDeviceService {
  devices = [...mockDevices];
  async getAllDevices() {
    await delay(500);
    return [...this.devices];
  }
  async toggleDevice(deviceId) {
    await delay(300);
    const deviceIndex = this.devices.findIndex((d) => d.id === deviceId);
    if (deviceIndex === -1) {
      throw new Error("Device not found");
    }
    this.devices[deviceIndex] = {
      ...this.devices[deviceIndex],
      isOn: !this.devices[deviceIndex].isOn,
      powerConsumption: !this.devices[deviceIndex].isOn ? Math.random() * 200 + 50 : 0,
      currentReading: !this.devices[deviceIndex].isOn ? Math.random() * 10 + 1 : 0,
      lastUpdated: /* @__PURE__ */ new Date()
    };
    return this.devices[deviceIndex];
  }
  async updateSafetyLimits(deviceId, limits) {
    await delay(300);
    const deviceIndex = this.devices.findIndex((d) => d.id === deviceId);
    if (deviceIndex === -1) {
      throw new Error("Device not found");
    }
    this.devices[deviceIndex] = {
      ...this.devices[deviceIndex],
      ...limits,
      lastUpdated: /* @__PURE__ */ new Date()
    };
    return this.devices[deviceIndex];
  }
}
class MockWiFiService {
  networks = [
    { ssid: "HomeNetwork_5G", signal: 85, security: "WPA2" },
    { ssid: "HomeNetwork_2.4G", signal: 78, security: "WPA2" },
    { ssid: "Neighbor_WiFi", signal: 45, security: "WPA2" },
    { ssid: "Public_WiFi", signal: 32, security: "Open" },
    { ssid: "Office_Network", signal: 67, security: "WPA3" }
  ];
  async scanNetworks() {
    await delay(2e3);
    return [...this.networks];
  }
  async connectToNetwork(ssid, password) {
    await delay(3e3);
    const network = this.networks.find((n) => n.ssid === ssid);
    if (!network) {
      throw new Error("Network not found");
    }
    if (network.security !== "Open" && !password) {
      throw new Error("Password required for secured network");
    }
    return { success: true, message: `Connected to ${ssid}` };
  }
  async getNetworkStatus() {
    await delay(500);
    return { ssid: "HomeNetwork_5G", connected: true };
  }
}
const mockDeviceService = new MockDeviceService();
const mockWiFiService = new MockWiFiService();
export {
  mockDeviceService,
  mockWiFiService
};
