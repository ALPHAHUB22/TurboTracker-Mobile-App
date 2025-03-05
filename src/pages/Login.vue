<template>
  <q-layout view="lHh Lpr fff">
    <q-page-container>
      <q-page class="column flex-center">
        <img src="https://www.riverstonetech.com/wp-content/uploads/2024/12/riverstone-tech-design-logo.png#3103"/>
        <q-card class="no-shadow q-mt-lg" style="width:75%;border-radius: 10px;">
          <q-card-section class="flex flex-center">
            <!-- <div class="q-pb-md text-center text-h6 text-bold" style="width: 75%;">TurboTracker</div> -->
            <q-form @submit="onSubmit" class="q-gutter-sm">
              <q-input filled type="email" v-model="email" label="Email *" lazy-rules
                :rules="[val => val && val.length > 0 || 'Please type your email id']" />

              <q-input filled :type="isPwd ? 'password' : 'text'" v-model="password" label="Password *" lazy-rules
                :rules="[
                  val => val !== null && val !== '' || 'Please type your password',
                ]">
                <template v-slot:append>
                  <q-icon :name="isPwd ? 'visibility_off' : 'visibility'" class="cursor-pointer"
                    @click="isPwd = !isPwd" />
                </template>
              </q-input>

              <q-btn class="login text-bold" label="Login" type="submit" style="width: 100%;" />
            </q-form>
          </q-card-section>
        </q-card>
      </q-page>
    </q-page-container>
  </q-layout>
</template>

<script setup>

import { Notify } from 'quasar'
import { ref, provide, computed } from 'vue'
import { useRouter } from 'vue-router';
import { showLoading, hideLoading } from 'src/utils/loading.js'
import { apiClient } from 'src/boot/axios';
// import { computedAsync } from "@vueuse/core";
import axios from 'axios';
const router = useRouter();

const isPwd = ref(true)
const email = ref("arun.r@riverstonetech.com")
const password = ref("alpha@123")

async function onSubmit() {
  if (email.value && password.value) {
    showLoading()
    const data = {
      email_id: email.value,
      password: password.value
    }
    var response = await apiClient.post(`api/method/turbotracker.mobile_integ.login`, data)
    if (response?.data?.message?.access_token) {
        response = response.data.message
        localStorage.setItem('accessToken', response.access_token);
        const userInfo = {
          email: email.value,
          name: response.full_name,
          employee_id: response.employee_id
        }
        localStorage.setItem('userInfo', JSON.stringify(userInfo));
        router.push('/');
        hideLoading()
    }
  }
}
</script>
<style>
.login{
  background-color: #42C2FF;
  color: white;
}
</style>
