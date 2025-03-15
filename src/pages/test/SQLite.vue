<template>
  <div style="padding-left:8px" class="row">
    <q-btn class="col" @click="initializeDatabase" color="primary" label="Initialize Database" />
    <q-btn class="col" @click="creatRecord" color="purple" label="Create Table" />
    <q-btn class="col" @click="getUsers" color="green" label="Get Table" />
    <q-btn class="col" @click="exportDatabaseToExternalStorage" color="black" label="Export DB" />
  </div>
  <p>{{ td }}</p>
    <p>{{ platform }}</p>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useDb } from 'src/composables/useDb';

const db = useDb(); // Auto-injects dbConnection

const td = ref(null)
const platform = ref(Capacitor.getPlatform())

const getUsers = async () => {
  try {
    const query = 'SELECT * FROM users';
    td.value = await db.query(query);
    console.log('ORIGINAL Users:', JSON.stringify(td.value));
  } catch (error) {
    console.error('Error fetching users:', error);
  }
};

const creatRecord = async() => {
  let x = Math.floor((Math.random() * 100) + 1);
  let email = `arun${x}@gmail.com`
  let query_v =`
    INSERT INTO users (name) VALUES ('John Doe');
  `
  console.log(query_v)
  console.log(await db.execute(query_v))
  getUsers()
}

onMounted(() => {
  getUsers();
});

</script>
