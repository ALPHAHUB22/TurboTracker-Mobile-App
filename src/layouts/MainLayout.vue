<template>
  <q-layout view="lHh Lpr lFf">
    <q-card class="top-sheet" flat />
    <q-toolbar>
    <q-toolbar-title class="row col justify-between">
      <q-btn size="md" class="col-2" flat color="white">
        <q-avatar style="border-radius: 10px;" size="lg">
          <img src="https://cdn.quasar.dev/img/boy-avatar.png">
        </q-avatar>
      </q-btn>
      <div class="q-mt-sm col-8 text-center">TurboTracker</div>
      <q-btn flat class="col-2 logout-icon" icon="logout" @click="() => { isLogoutDialog = true}"></q-btn>
    </q-toolbar-title>
  </q-toolbar>
    <router-view />
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
          <q-btn class="text-caption logout-btn" :loading="logoutLoading" @click="logout()">
            <q-icon size="20px" name="logout"></q-icon>
          </q-btn>
        </q-card-actions>
      </q-card>
    </q-dialog>
    <Footer />
  </q-layout>
</template>

<script setup>
import { ref, reactive } from 'vue'
import Header from 'components/Header.vue'
import { useRouter } from 'vue-router'
import Footer from 'components/Footer.vue'
import { apiClient } from 'src/boot/axios';
import { showLoading, hideLoading } from 'src/utils/loading.js'

const router = useRouter();
const isLogoutDialog = ref(false)
const logoutLoading = ref(false)

const userInfo = reactive(JSON.parse(localStorage.getItem('userInfo')))
const token = localStorage.getItem('accessToken')

async function logout() {
    showLoading()
    const data = {
      email_id: userInfo.email,
      access_token: token
    }
    var response = await apiClient.post(`api/method/turbotracker.mobile_integ.logout`, data)
    if (response?.data?.message?.status === "Success") {
        localStorage.removeItem("userInfo")
        localStorage.removeItem("accessToken")
        router.push('/login');
        hideLoading()
    }
    // .catch((err) => {
      //   if (err.response?.status === 404 || err.response?.status === 401) {
      //     Notify.create({
      //       color: 'red-5',
      //       textColor: 'white',
      //       icon: 'warning',
      //       message: `${err.response?.data?.message}`
      //     })
      //   }
      //   hideLoading()
      // });
}

</script>
<style scoped>
.top-sheet{
  position: absolute; width: 100%;
  height: 19vh;
  border-top-left-radius: 0%;
  border-top-right-radius: 0%;
  border-bottom-left-radius: 100%;
  border-bottom-right-radius: 100%;
  background-color: rgb(146, 200, 255)
}
.cancel-btn{
  border: 1px solid #42C2FF;
  background-color: white;
  color: #42C2FF;
}
.logout-icon{
  color: white;
}
.logout-btn{
  background-color: #42C2FF;
  color: white;
}
</style>
