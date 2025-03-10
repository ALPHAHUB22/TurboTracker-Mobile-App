import { boot } from 'quasar/wrappers';
import axios from 'axios';
import { Notify } from 'quasar'
import { showLoading, hideLoading } from 'src/utils/loading.js'
import { Preferences } from '@capacitor/preferences';
// Create an Axios instance
const apiClient = axios.create({
  // baseURL: localStorage.getItem("siteUrl"), // Replace with your API base URL
  baseURL: "http://10.0.0.91:8008/", // Replace with your API base URL
  timeout: 10000, // Set a timeout
  headers: {
    'Content-Type': 'application/json',
  },
});

// Optionally set up request interceptors
apiClient.interceptors.request.use(async(config) => {
  const token = await Preferences.get({ key: 'accessToken' });
  if (token.value !== null) {
    config.headers.Authorization = `Bearer ${token.value}`;
  }
  // console.log(token.value, config.headers)
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Optionally set up response interceptors
apiClient.interceptors.response.use(
  (response) => response,
  async(error) => {
    const token = await Preferences.get({ key: 'accessToken' });
    if (token.value !== null && error.response.status === 401){
      await Preferences.remove({ key: 'accessToken' });
    }
    console.error('API Error:', error?.response?.data || error?.message);
    if (error.response.status !== 401 || error.response?.data?.status === "Failure"){
      const message = error.response?.data?.status === "Failure" ? error?.response?.data?.message : `API Error: ${error?.response?.data?.message || error?.message}`
      hideLoading()
      Notify.create({
        color: 'red-5',
        textColor: 'white',
        icon: 'warning',
        message: message
      })
    }
  }
);

export default boot(({ app }) => {
  // Make Axios globally available throughout the app
  app.config.globalProperties.$axios = axios; // Generic Axios instance
  app.config.globalProperties.$api = apiClient; // Custom API client instance
});

// Optionally export the Axios instance for specific imports
export { apiClient };
