import { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send, Bot, User, Zap, Shield, Thermometer, BarChart3 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
const quickActions = [
  { icon: Zap, label: "Check device status", query: "Show me the status of all my devices" },
  { icon: Shield, label: "Security overview", query: "Give me a security system overview" },
  { icon: Thermometer, label: "Environmental status", query: "How is the air quality and temperature?" },
  { icon: BarChart3, label: "Energy report", query: "Show me today's energy consumption" }
];
const mockResponses = {
  "device status": "I can see you have 6 devices connected. 5 are online and working normally. Your bedroom outlet is showing high current usage (16.2A) which exceeds the safety limit. Would you like me to turn it off for safety?",
  "security": "Your Sentry security system is armed and all sensors are functioning normally. I detected 1 active water leak alert in the basement that needs your attention. All other security sensors show green status.",
  "environmental": 'Current conditions look good! Temperature is 24.2\xB0C, humidity at 50%, and air quality is rated as "Good" at 75/100. CO2 levels are acceptable at 465 ppm.',
  "energy": "Today's energy consumption is 24.3 kWh, which is 2.1% lower than yesterday. Your living room outlet is the highest consumer at 142.8W. Total estimated cost for today is $3.65.",
  "default": "I'm your Sentry AI assistant! I can help you monitor your smart home devices, check security status, analyze energy consumption, and provide insights about your home's environmental conditions. What would you like to know?"
};
const AIAssistant = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: "1",
      type: "assistant",
      content: "Hello! I'm your Sentry AI assistant. I can help you monitor your home security, check device status, analyze energy usage, manage environmental conditions, and respond to alerts. How can I protect your home today?",
      timestamp: /* @__PURE__ */ new Date(),
      suggestions: ["Check device status", "Security overview", "Energy report", "Environmental status"]
    }
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  const getAIResponse = (userMessage) => {
    const message = userMessage.toLowerCase();
    if (message.includes("device") || message.includes("status") || message.includes("outlet") || message.includes("switch")) {
      return mockResponses["device status"];
    } else if (message.includes("security") || message.includes("sensor") || message.includes("alert") || message.includes("alarm")) {
      return mockResponses["security"];
    } else if (message.includes("temperature") || message.includes("air") || message.includes("environmental") || message.includes("humidity")) {
      return mockResponses["environmental"];
    } else if (message.includes("energy") || message.includes("power") || message.includes("consumption") || message.includes("cost")) {
      return mockResponses["energy"];
    } else {
      return mockResponses["default"];
    }
  };
  const handleSendMessage = async (message) => {
    if (!message.trim()) return;
    const userMessage = {
      id: Date.now().toString(),
      type: "user",
      content: message,
      timestamp: /* @__PURE__ */ new Date()
    };
    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsTyping(true);
    setTimeout(() => {
      const aiResponse = {
        id: (Date.now() + 1).toString(),
        type: "assistant",
        content: getAIResponse(message),
        timestamp: /* @__PURE__ */ new Date(),
        suggestions: ["Turn off bedroom outlet", "Show energy details", "Check all sensors", "Environmental report"]
      };
      setMessages((prev) => [...prev, aiResponse]);
      setIsTyping(false);
    }, 1500);
  };
  const handleQuickAction = (query) => {
    handleSendMessage(query);
  };
  const handleSuggestionClick = (suggestion) => {
    handleSendMessage(suggestion);
  };
  return <>{
    /* Floating Chat Button */
  }<motion.button
    whileHover={{ scale: 1.1 }}
    whileTap={{ scale: 0.9 }}
    onClick={() => setIsOpen(true)}
    className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full shadow-lg hover:shadow-xl transition-shadow z-40 flex items-center justify-center"
  ><MessageCircle className="w-6 h-6" />{
    /* Notification dot */
  }<span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center"><span className="w-2 h-2 bg-white rounded-full animate-pulse" /></span></motion.button>{
    /* Chat Modal */
  }<AnimatePresence>{isOpen && <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end justify-end p-4 z-50"><motion.div
    initial={{ opacity: 0, scale: 0.95, y: 20 }}
    animate={{ opacity: 1, scale: 1, y: 0 }}
    exit={{ opacity: 0, scale: 0.95, y: 20 }}
    className="w-full max-w-md h-[600px] bg-white dark:bg-gray-800 rounded-xl shadow-2xl flex flex-col"
  >{
    /* Header */
  }<div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700"><div className="flex items-center"><div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center mr-3"><Bot className="w-5 h-5 text-white" /></div><div><h3 className="font-semibold text-gray-900 dark:text-white">Sentry AI</h3><p className="text-sm text-green-600 dark:text-green-400">Online</p></div></div><button
    onClick={() => setIsOpen(false)}
    className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
  ><X className="w-5 h-5" /></button></div>{
    /* Quick Actions */
  }<div className="p-4 border-b border-gray-200 dark:border-gray-700"><p className="text-sm text-gray-600 dark:text-gray-400 mb-3">Quick actions:</p><div className="grid grid-cols-2 gap-2">{quickActions.map((action, index) => <button
    key={index}
    onClick={() => handleQuickAction(action.query)}
    className="flex items-center p-2 text-sm bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
  ><action.icon className="w-4 h-4 mr-2 text-blue-600 dark:text-blue-400" /><span className="text-gray-700 dark:text-gray-300">{action.label}</span></button>)}</div></div>{
    /* Messages */
  }<div className="flex-1 overflow-y-auto p-4 space-y-4">{messages.map((message) => <div key={message.id} className={`flex ${message.type === "user" ? "justify-end" : "justify-start"}`}><div className={`max-w-[80%] ${message.type === "user" ? "order-2" : "order-1"}`}><div className={`flex items-start space-x-2 ${message.type === "user" ? "flex-row-reverse space-x-reverse" : ""}`}><div className={`w-8 h-8 rounded-full flex items-center justify-center ${message.type === "user" ? "bg-blue-600" : "bg-gradient-to-r from-blue-600 to-purple-600"}`}>{message.type === "user" ? <User className="w-4 h-4 text-white" /> : <Bot className="w-4 h-4 text-white" />}</div><div className={`rounded-lg p-3 ${message.type === "user" ? "bg-blue-600 text-white" : "bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white"}`}><p className="text-sm">{message.content}</p><p className={`text-xs mt-1 ${message.type === "user" ? "text-blue-100" : "text-gray-500 dark:text-gray-400"}`}>{message.timestamp.toLocaleTimeString()}</p></div></div>{
    /* Suggestions */
  }{message.suggestions && message.type === "assistant" && <div className="mt-2 ml-10 space-y-1">{message.suggestions.map((suggestion, index) => <button
    key={index}
    onClick={() => handleSuggestionClick(suggestion)}
    className="block text-xs text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 bg-blue-50 dark:bg-blue-900/20 px-2 py-1 rounded border border-blue-200 dark:border-blue-800 hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
  >{suggestion}</button>)}</div>}</div></div>)}{
    /* Typing indicator */
  }{isTyping && <div className="flex justify-start"><div className="flex items-start space-x-2"><div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center"><Bot className="w-4 h-4 text-white" /></div><div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-3"><div className="flex space-x-1"><div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" /><div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0.1s" }} /><div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }} /></div></div></div></div>}<div ref={messagesEndRef} /></div>{
    /* Input */
  }<div className="p-4 border-t border-gray-200 dark:border-gray-700"><div className="flex space-x-2"><input
    type="text"
    value={inputValue}
    onChange={(e) => setInputValue(e.target.value)}
    onKeyPress={(e) => e.key === "Enter" && handleSendMessage(inputValue)}
    placeholder="Ask me anything about your smart home..."
    className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
  /><button
    onClick={() => handleSendMessage(inputValue)}
    disabled={!inputValue.trim() || isTyping}
    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg transition-colors disabled:cursor-not-allowed"
  ><Send className="w-4 h-4" /></button></div></div></motion.div></div>}</AnimatePresence></>;
};
export {
  AIAssistant
};
