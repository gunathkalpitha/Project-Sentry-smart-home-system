import { useState, useEffect, useRef } from "react";
import { User, Phone, Shield, Bell, Palette, Save, Camera, Trash2 } from "lucide-react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { api } from "../services/api";
const Profile = () => {
  const [profile, setProfile] = useState(null);
  const fileInputRef = useRef(null);
  const [activeTab, setActiveTab] = useState("personal");
  const [isEditing, setIsEditing] = useState(false);
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;
        const response = await api.get("/auth/me");
        setProfile(response.data);
      } catch (error) {
        toast.error("Failed to load profile");
      }
    };
    fetchProfile();
  }, []);
  const handleSave = async () => {
    try {
      if (!profile) return;
      await api.put("/auth/me", profile);
      toast.success("Profile updated successfully!");
      setIsEditing(false);
    } catch (error) {
      toast.error("Failed to update profile");
    }
  };
  const handleAvatarUpload = async (e) => {
    if (!e || !e.target.files || !profile) return;
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append("avatar", file);
    try {
      const response = await api.put("/auth/me/avatar", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      setProfile((prev) => prev ? { ...prev, avatar: response.data.avatar } : prev);
      toast.success("Avatar uploaded successfully!");
    } catch {
      toast.error("Failed to upload avatar");
    }
  };
  const updateProfile = (field, value) => {
    setProfile((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        [field]: value
      };
    });
  };
  const updatePreferences = (field, value) => {
    setProfile((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        preferences: {
          ...prev.preferences,
          [field]: value
        }
      };
    });
  };
  const updateNotifications = (field, value) => {
    setProfile((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        preferences: {
          ...prev.preferences,
          notifications: {
            ...prev.preferences.notifications,
            [field]: value
          }
        }
      };
    });
  };
  const updateAlertSettings = (field, value) => {
    setProfile((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        preferences: {
          ...prev.preferences,
          alertSettings: {
            ...prev.preferences.alertSettings,
            [field]: value
          }
        }
      };
    });
  };
  const addEmergencyContact = () => {
    const newContact = { name: "", phone: "", relationship: "" };
    setProfile((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        emergencyContacts: [...prev.emergencyContacts, newContact]
      };
    });
  };
  const removeEmergencyContact = (index) => {
    setProfile((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        emergencyContacts: prev.emergencyContacts.filter((_, i) => i !== index)
      };
    });
  };
  const updateEmergencyContact = (index, field, value) => {
    setProfile((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        emergencyContacts: prev.emergencyContacts.map(
          (contact, i) => i === index ? { ...contact, [field]: value } : contact
        )
      };
    });
  };
  if (!profile) {
    return <div className="flex justify-center items-center h-64 text-gray-500">Loading profile...</div>;
  }
  return <div className="space-y-6">{
    /* Header */
  }<div className="flex items-center justify-between"><div><h1 className="text-2xl font-bold text-gray-900 dark:text-white">Profile Settings</h1><p className="text-gray-600 dark:text-gray-400">Manage your Sentry account and security preferences</p></div><motion.button
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.95 }}
    onClick={isEditing ? handleSave : () => setIsEditing(true)}
    className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium"
  ><Save className="h-4 w-4 mr-2" />{isEditing ? "Save Changes" : "Edit Profile"}</motion.button></div><div className="grid grid-cols-1 lg:grid-cols-4 gap-6">{
    /* Sidebar Navigation */
  }<div className="lg:col-span-1"><div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4"><nav className="space-y-2">{[
    { id: "personal", label: "Personal Info", icon: User },
    { id: "preferences", label: "Preferences", icon: Palette },
    { id: "security", label: "Security", icon: Shield },
    { id: "emergency", label: "Emergency", icon: Phone }
  ].map((tab) => <button
    key={tab.id}
    onClick={() => setActiveTab(tab.id)}
    className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${activeTab === tab.id ? "bg-blue-50 text-blue-700 dark:bg-blue-900/50 dark:text-blue-200" : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"}`}
  ><tab.icon className="h-4 w-4 mr-3" />{tab.label}</button>)}</nav></div></div>{
    /* Main Content */
  }<div className="lg:col-span-3"><div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">{
    /* Personal Information */
  }{activeTab === "personal" && <div className="space-y-6"><h2 className="text-lg font-semibold text-gray-900 dark:text-white">Personal Information</h2>{
    /* Avatar */
  }<div className="flex items-center space-x-4"><div className="w-20 h-20 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center overflow-hidden">{profile.avatar ? <img src={profile.avatar} alt="Avatar" className="w-full h-full rounded-full object-cover" /> : profile.name ? <span className="text-3xl font-bold text-white">{profile.name.charAt(0).toUpperCase()}</span> : <User className="w-8 h-8 text-white" />}</div>{isEditing && <div className="space-x-2"><button
    onClick={() => fileInputRef.current?.click()}
    className="flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
  ><Camera className="h-4 w-4 mr-2" />
                        Upload
                      </button><input
    type="file"
    accept="image/*"
    ref={fileInputRef}
    style={{ display: "none" }}
    onChange={handleAvatarUpload}
  /></div>}</div>{
    /* Form Fields */
  }<div className="grid grid-cols-1 md:grid-cols-2 gap-6"><div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Full Name
                    </label><input
    type="text"
    value={profile.name}
    onChange={(e) => updateProfile("name", e.target.value)}
    disabled={!isEditing}
    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:bg-gray-50 dark:disabled:bg-gray-800"
  /></div><div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Email Address
                    </label><input
    type="email"
    value={profile.email}
    onChange={(e) => updateProfile("email", e.target.value)}
    disabled={!isEditing}
    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:bg-gray-50 dark:disabled:bg-gray-800"
  /></div><div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Phone Number
                    </label><input
    type="tel"
    value={profile.phone}
    onChange={(e) => updateProfile("phone", e.target.value)}
    disabled={!isEditing}
    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:bg-gray-50 dark:disabled:bg-gray-800"
  /></div><div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Role
                    </label><select
    value={profile.role}
    onChange={(e) => updateProfile("role", e.target.value)}
    disabled={!isEditing}
    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:bg-gray-50 dark:disabled:bg-gray-800"
  ><option value="admin">Administrator</option><option value="user">User</option><option value="guest">Guest</option></select></div></div></div>}{
    /* Preferences */
  }{activeTab === "preferences" && <div className="space-y-6"><h2 className="text-lg font-semibold text-gray-900 dark:text-white">Preferences</h2>{
    /* Theme */
  }<div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Theme
                  </label><select
    value={profile.preferences.theme}
    onChange={(e) => updatePreferences("theme", e.target.value)}
    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
  ><option value="light">Light</option><option value="dark">Dark</option><option value="auto">Auto</option></select></div>{
    /* Notifications */
  }<div><h3 className="text-md font-medium text-gray-900 dark:text-white mb-3">Notifications</h3><div className="space-y-3">{Object.entries(profile.preferences.notifications).map(([key, value]) => <div key={key} className="flex items-center justify-between"><span className="text-sm text-gray-700 dark:text-gray-300 capitalize">{key} Notifications
                        </span><input
    type="checkbox"
    checked={value}
    onChange={(e) => updateNotifications(key, e.target.checked)}
    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
  /></div>)}</div></div>{
    /* Alert Settings */
  }<div><h3 className="text-md font-medium text-gray-900 dark:text-white mb-3">Alert Settings</h3><div className="space-y-3">{Object.entries(profile.preferences.alertSettings).map(([key, value]) => <div key={key} className="flex items-center justify-between"><span className="text-sm text-gray-700 dark:text-gray-300">{key.replace(/([A-Z])/g, " $1").replace(/^./, (str) => str.toUpperCase())}</span><input
    type="checkbox"
    checked={value}
    onChange={(e) => updateAlertSettings(key, e.target.checked)}
    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
  /></div>)}</div></div></div>}{
    /* Security */
  }{activeTab === "security" && <div className="space-y-6"><h2 className="text-lg font-semibold text-gray-900 dark:text-white">Security Settings</h2><div className="space-y-4"><button className="w-full flex items-center justify-between p-4 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"><div className="flex items-center"><Shield className="h-5 w-5 text-gray-600 dark:text-gray-400 mr-3" /><div className="text-left"><p className="font-medium text-gray-900 dark:text-white">Change Password</p><p className="text-sm text-gray-600 dark:text-gray-400">Update your account password</p></div></div></button><button className="w-full flex items-center justify-between p-4 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"><div className="flex items-center"><Phone className="h-5 w-5 text-gray-600 dark:text-gray-400 mr-3" /><div className="text-left"><p className="font-medium text-gray-900 dark:text-white">Two-Factor Authentication</p><p className="text-sm text-gray-600 dark:text-gray-400">Add an extra layer of security</p></div></div></button><button className="w-full flex items-center justify-between p-4 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"><div className="flex items-center"><Bell className="h-5 w-5 text-gray-600 dark:text-gray-400 mr-3" /><div className="text-left"><p className="font-medium text-gray-900 dark:text-white">Login Alerts</p><p className="text-sm text-gray-600 dark:text-gray-400">Get notified of new logins</p></div></div></button></div></div>}{
    /* Emergency Contacts */
  }{activeTab === "emergency" && <div className="space-y-6"><div className="flex items-center justify-between"><h2 className="text-lg font-semibold text-gray-900 dark:text-white">Emergency Contacts</h2><button
    onClick={addEmergencyContact}
    className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm"
  >
                    Add Contact
                  </button></div><div className="space-y-4">{profile.emergencyContacts.map((contact, index) => <div key={index} className="p-4 border border-gray-300 dark:border-gray-600 rounded-lg"><div className="grid grid-cols-1 md:grid-cols-3 gap-4"><input
    type="text"
    placeholder="Name"
    value={contact.name}
    onChange={(e) => updateEmergencyContact(index, "name", e.target.value)}
    className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
  /><input
    type="tel"
    placeholder="Phone"
    value={contact.phone}
    onChange={(e) => updateEmergencyContact(index, "phone", e.target.value)}
    className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
  /><div className="flex items-center space-x-2"><input
    type="text"
    placeholder="Relationship"
    value={contact.relationship}
    onChange={(e) => updateEmergencyContact(index, "relationship", e.target.value)}
    className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
  /><button
    onClick={() => removeEmergencyContact(index)}
    className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
  ><Trash2 className="h-4 w-4" /></button></div></div></div>)}</div></div>}</div></div></div></div>;
};
export {
  Profile
};
