<template>
  <button @click="start">start</button>
  <button @click="pause">pause</button>
  <button @click="disabled = true">disabled</button>
  <div class="flex">
    <a-timeline mode="alternate"></a-timeline>
    <VueDraggable
      ref="el"
      v-model="list"
      :disabled="disabled"
      :animation="150"
      ghost-class="ghost"
      class="flex flex-col gap-2 p-4 w-300px h-300px m-auto bg-gray-500/5 rounded"
      @start="onStart"
      @update="onUpdate"
    >
      <a-timeline-item v-for="(item, index) in list" :key="index" color="red">
        {{ item }}
      </a-timeline-item>
    </VueDraggable>
    <preview-list :list="list" />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { type UseDraggableReturn, VueDraggable } from 'vue-draggable-plus'
const list = ref([
  {
    name: 'Joao',
    id: 1
  },
  {
    name: 'Jean',
    id: 2
  },
  {
    name: 'Johanna',
    id: 3
  },
  {
    name: 'Juan',
    id: 4
  }
])

const el = ref<UseDraggableReturn>()
const disabled = ref(false)
function pause() {
  el.value?.pause()
}

function start() {
  el.value?.start()
}

const onStart = () => {
  console.log('start')
}

const onUpdate = () => {
  console.log('update')
}
</script>

<style scoped>
.ghost {
  opacity: 0.5;
  background: #c8ebfb;
}
</style>
