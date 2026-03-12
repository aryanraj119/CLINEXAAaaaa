import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { initLocalDb } from "./integrations/local-db/index.ts";

console.log("Starting app initialization...");

const rootElement = document.getElementById("root");
console.log("Root element:", rootElement);

if (!rootElement) {
  document.body.innerHTML = `
    <div style="padding: 20px; font-family: sans-serif; color: red;">
      <h1>Error: Root element not found</h1>
      <p>The #root element is missing from index.html</p>
    </div>
  `;
} else {
  initLocalDb()
    .then(() => {
      console.log("Database initialized successfully");
      console.log("Creating React root...");
      const root = createRoot(rootElement);
      console.log("Rendering App component...");
      root.render(<App />);
      console.log("App rendered successfully");
    })
    .catch((err) => {
      console.error("Failed to initialize database:", err);
      console.error("Error stack:", err.stack);
      document.body.innerHTML = `
        <div style="padding: 20px; font-family: sans-serif;">
          <h1>Error loading database</h1>
          <p>${err.message}</p>
          <p>Check console for details.</p>
          <pre style="background: #f0f0f0; padding: 10px; overflow: auto;">
${err.stack}
          </pre>
        </div>
      `;
    });
}
