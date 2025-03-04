<template>
  <q-layout view="lHh Lpr fff">
    <q-page-container>
      <q-page class="flex flex-center">
        <q-card class="my-card no-shadow">
          <q-card-section>
            <q-form @submit="onSubmit" @reset="onReset" class="q-gutter-sm">
              <q-input style="flex-grow:2" filled type="email" v-model="email" label="Email *" lazy-rules
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

              <q-btn label="Login" type="submit" color="primary" style="width: 100%;" />
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
    var response = await axios.post(`http://localhost:8008/api/method/turbotracker.mobile_integ.login`, data)
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
}

function onReset() {
  email.value = null
  password.value = null
}
</script>
