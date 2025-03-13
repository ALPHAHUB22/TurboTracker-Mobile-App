<template>
  <q-btn flat class="logout-icon" icon="logout" @click="() => { isLogoutDialog = true}">
    <q-dialog v-model="isLogoutDialog" :backdrop-filter="'blur(4px) saturate(150%)'">
      <q-card style="border-radius: 10px;">
        <q-card-section class="row items-center q-pb-none text-bold">
          Logout
        </q-card-section>
        <q-card-section class="row items-center">
          <!-- <q-avatar icon="signal_wifi_off" color="primary" text-color="white" /> -->
          <p class="q-ml-sm text-caption">
            Are you sure you want to logout?
          </p>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn class="text-caption cancel-btn" v-close-popup>Cancel</q-btn>
          <q-btn class="text-caption confirm-btn" :loading="logoutLoading" @click="logout()">
            <q-icon size="20px" name="logout"></q-icon>
          </q-btn>
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-btn>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { apiRequest } from 'src/boot/http.js';
import { useRouter } from 'vue-router'
import { showLoading, hideLoading } from 'src/utils/loading.js'
import { Preferences } from '@capacitor/preferences';
const router = useRouter();
const isLogoutDialog = ref(false)
const logoutLoading = ref(false)
const userInfo = ref({})
const token = ref(null)

async function logout() {
    showLoading()
    const data = {
      email_id: userInfo.value.email,
      access_token: token.value
    }
    var response = await apiRequest.post(`api/method/turbotracker.mobile_integ.logout`, data)
    if (response?.message?.status === "Success") {
        await Preferences.remove({ key: 'userInfo' });
        await Preferences.remove({ key: 'accessToken' });
        router.push('/login');
        hideLoading()
    }
}

onMounted(async () => {
  const user_value = await Preferences.get({ key: 'userInfo' })
  userInfo.value = JSON.parse(user_value.value)
  console.log(userInfo.value.email)
  const token_value = await Preferences.get({ key: 'accessToken' })
  token.value = token_value.value
});
</script>
<style lang="css">
.logout-icon{
  color: white;
}
</style>

