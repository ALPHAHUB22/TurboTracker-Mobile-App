import { boot } from 'quasar/wrappers';
import axios from 'axios';
import { Notify } from 'quasar'

// Create an Axios instance
const apiClient = axios.create({
  // baseURL: localStorage.getItem("siteUrl"), // Replace with your API base URL
  baseURL: "http://localhost:8008/", // Replace with your API base URL
  timeout: 10000, // Set a timeout
  headers: {
    'Content-Type': 'application/json',
  },
});

// Optionally set up request interceptors
apiClient.interceptors.request.use((config) => {
  // localStorage.removeItem('accessToken')
  const token = localStorage.getItem('accessToken'); // Retrieve token dynamically
  // console.log(["ACCESS_TOKEN", token])
  const url = localStorage.getItem("siteUrl")
  if (token && url) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Optionally set up response interceptors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    Notify.create({
      color: 'red-5',
      textColor: 'white',
      icon: 'warning',
      message: `API Error:' ${error.response?.data?.exception || error.message}`
    })
    // return Promise.reject(error);
  }
);

export default boot(({ app }) => {
  // Make Axios globally available throughout the app
  app.config.globalProperties.$axios = axios; // Generic Axios instance
  app.config.globalProperties.$api = apiClient; // Custom API client instance
});

// Optionally export the Axios instance for specific imports
export { apiClient };
