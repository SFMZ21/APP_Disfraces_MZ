import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  build: {
    rolldownOptions: {
      output: {
        manualChunks(moduleId) {
          const firebaseService = [
            ["/@firebase/auth", "firebase-auth"],
            ["/@firebase/firestore", "firebase-firestore"],
            ["/@firebase/storage", "firebase-storage"],
            ["/@firebase/functions", "firebase-functions"],
            ["/@firebase/analytics", "firebase-analytics"],
          ].find(([packagePath]) => moduleId.includes(packagePath));

          if (firebaseService) {
            return firebaseService[1];
          }

          if (moduleId.includes("/node_modules/firebase/")) {
            return "firebase-entry";
          }

          if (
            moduleId.includes("/node_modules/react/") ||
            moduleId.includes("/node_modules/react-dom/") ||
            moduleId.includes("/node_modules/react-router")
          ) {
            return "react";
          }

          return undefined;
        },
      },
    },
  },
  test: {
    environment: "jsdom",
    setupFiles: "./src/test/setup.js",
    css: true,
  },
});
