// Centralized API configuration for environment support during deployment
const getApiUrl = () => {
  let url = import.meta.env.VITE_API_URL?.trim();
  if (!url) {
    return "http://localhost:8000";
  }
  // Eliminar barra final si existe
  url = url.replace(/\/+$/, "");
  // Asegurar protocolo http:// o https://
  if (!url.startsWith("http://") && !url.startsWith("https://")) {
    url = `https://${url}`;
  }
  return url;
};

export const API_URL = getApiUrl();
