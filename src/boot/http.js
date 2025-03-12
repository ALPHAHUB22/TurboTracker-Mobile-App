import { CapacitorHttp } from '@capacitor/core';
import { Notify } from "quasar";
import { showLoading, hideLoading } from "src/utils/loading.js";
import { Preferences } from "@capacitor/preferences";

// Function to get API base URL
async function getBaseUrl() {
  const siteUrl = await Preferences.get({ key: "siteUrl" });
  return siteUrl.value || "http://10.0.0.91:8008/";
}

// Function to get Authorization Token
async function getAuthToken() {
  const token = await Preferences.get({ key: "accessToken" });
  return token.value ? `Bearer ${token.value}` : null;
}

// Base API request function
async function apiRequest(url, method = "GET", options = {}) {
  const baseUrl = await getBaseUrl();
  const token = await getAuthToken();

  const headers = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: token } : {}),
  };

  // Initialize request config
  let requestConfig = {
    method,
    url: `${baseUrl}${url}`,
    headers,
  };

  // ✅ GET requests should only use `params`
  if (method === "GET" && options.params) {
    requestConfig.params = options.params; // ✅ This is the correct way for mobile
  } else if (method !== "GET" && options.data) {
    requestConfig.data = options.data || {}; // ✅ POST, PUT, DELETE should use `data`
  }

  try {
    showLoading();
    const response = await CapacitorHttp.request(requestConfig);
    if (token !== null && response.status === 401){
      await Preferences.remove({ key: 'accessToken' });
    }
    hideLoading();
    return response.data;
  } catch (error) {
    hideLoading();
    handleApiError(error);
    throw error;
  }
}

// **Helper function to handle errors**
function handleApiError(error) {
  let message = error.message || "Network error";
  if (error.response) {
    if (error.response.status === 401) {
      message = "Unauthorized access. Please log in again.";
    } else if (error.response.data?.status === "Failure") {
      message = error.response.data.message;
    } else {
      message = `API Error: ${error.response.data.message || error.message}`;
    }
  }

  Notify.create({
    color: "red-5",
    textColor: "white",
    icon: "warning",
    message,
  });
}

// **Export API Methods**
const apiRequestMethods = {
  get: (url, params = {}) => apiRequest(url, "GET", { params }),
  post: (url, data = {}) => apiRequest(url, "POST", { data }),
};

export { apiRequestMethods as apiRequest };
