import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
var stdin_default = defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ["lucide-react"]
  }
});
export {
  stdin_default as default
};
