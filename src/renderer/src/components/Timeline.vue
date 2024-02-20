<script setup lang="ts">
import { reactive } from 'vue'
const arr: string[] = reactive(['9:40', '10:50', '11:40', '13:00', '16:00', '18:00'])
</script>

<template>
  <div class="container">
    <div class="item">
      <a-timeline :pending="arr[arr.length - 1]" mode="alternate">
        <a-timeline-item
          v-for="(item, index) in arr.slice(0, arr.length - 1)"
          :key="index"
          color="red"
        >
          {{ item }}
        </a-timeline-item>
      </a-timeline>
    </div>
  </div>
</template>

<style lang="css" scoped>
.container {
  height: 100vh;
  width: 100vw;
  display: flex;
  background: linear-gradient(180deg, #acdecc, #a3e1e5);
  align-items: center;
  justify-content: center;
}

.item {
  height: 50vh;
  width: 50vw;
  /* background: linear-gradient(0deg, #acdecc, #a3e1e5); */
}
</style>
