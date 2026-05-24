// src/config.ts
// ב-Vercel: חובה להגדיר Environment Variable: VITE_API_URL = כתובת ה-backend (למשל https://your-app.onrender.com)
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

export default {
  API_URL,
};