import { ref, onMounted, onUnmounted } from "vue";
import { Network } from "@capacitor/network";

const isOnline = ref(true);

export function useNetwork() {
  const checkNetworkStatus = async () => {
    const status = await Network.getStatus();
    isOnline.value = status.connected;
  };

  const handleNetworkChange = (status) => {
    isOnline.value = status.connected;
  };

  onMounted(async () => {
    await checkNetworkStatus();
    Network.addListener("networkStatusChange", handleNetworkChange);
  });

  onUnmounted(() => {
    Network.removeAllListeners();
  });

  return { isOnline };
}
