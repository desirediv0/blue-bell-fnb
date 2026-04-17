// API base URL configuration
export const API_URL =
  import.meta.env.MODE === "production"
    ? "https://www.bluebellfnb.com/api"
    : "http://localhost:4002/api";
