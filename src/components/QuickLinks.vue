<template>
  <div class="q-px-md">
    <q-list>
      <q-expansion-item popup default-opened icon="link" :label="props.title">
        <q-separator />
        <q-card>
          <div class="q-pa-md row items-start">
            <div class="my-card q-gutter-sm">
              <q-card class="text-white bg-primary" @click="$router.push({ name: 'InventoryLogForm' })">
                <q-card-section class="q-pa-md row">
                  <div class="col-11"><q-icon name="add"/>Add Item</div>
                  <q-icon size="xs" class="col-1" name="arrow_right"/>
                </q-card-section>
              </q-card>
            </div>
          </div>
        </q-card>
      </q-expansion-item>
    </q-list>
  </div>
</template>
<script setup>
const props = defineProps({
	title: {
		type: String,
		required: false
	},
	items: {
		type: Object,
		// required: true,
	},
})
</script>
