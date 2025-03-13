import { boot } from 'quasar/wrappers';
import { Network } from '@capacitor/network';
import { ref } from 'vue';

export const isOnline = ref(true); // Reactive network status

// Function to listen for network status changes
async function setupNetworkListener() {
    // Listen for network changes
    Network.addListener('networkStatusChange', (status) => {
        console.log(`📡 Network changed: ${status.connected ? 'Online' : 'Offline'}`);
        isOnline.value = status.connected; // Update reactive state
    });
}

export default boot(({ app }) => {
    // Run network listener on app startup
    setupNetworkListener();

    // Make network functions globally available
    app.config.globalProperties.$isOnline = isOnline; // Use this in Vue components
});
