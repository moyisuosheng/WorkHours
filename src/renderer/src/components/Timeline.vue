<script setup lang="ts">
import { ref } from 'vue'
import { type UseDraggableReturn, VueDraggable } from 'vue-draggable-plus'

type node = {
  startTime: string
  endTime: string
  title: string
  info: string
  type: string
}

const list: node[] = ref([
  {
    startTime: '9:40',
    endTime: '10:50',
    title: 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
    info: 'info1',
    type: '1'
  },
  {
    startTime: '9:40',
    endTime: '10:50',
    title: 'title2',
    info: 'info2',
    type: '2'
  },
  {
    startTime: '9:40',
    endTime: '10:50',
    title: 'title3',
    info: 'info3',
    type: '1'
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

<template>
  <div class="container">
    <div class="item">
      <ul>
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
          <li v-for="(item, index) in list" :key="index">
            <span></span>
            <div>
              <div class="title">{{ item.title }}</div>
              <div class="info">{{ item.info }}</div>
              <div class="type">{{ item.type }}</div>
            </div>
            <span class="number">
              <span>{{ item.startTime }}</span>
              <span>{{ item.endTime }}</span>
            </span>
          </li>
        </VueDraggable>
      </ul>
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
  height: 100vh;
  width: 100vw;
  /* background: linear-gradient(0deg, #acdecc, #a3e1e5); */
}

.container ul {
  margin: 0;
  margin-top: 100px;
  list-style: none;
  position: relative;
  padding: 1px 100px;
  color: #fff;
  font-size: 13px;
}

.container ul:before {
  content: '';
  width: 1px;
  height: 100%;
  position: absolute;
  border-left: 2px dashed #fff;
}

.container ul li {
  position: relative;
  margin-left: 30px;
  background-color: rgba(255, 255, 255, 0.2);
  padding: 14px;
  border-radius: 6px;
  width: 250px;
  box-shadow:
    0 0 4px rgba(0, 0, 0, 0.12),
    0 2px 2px rgba(0, 0, 0, 0.08);
}

.container ul li:not(:first-child) {
  margin-top: 60px;
}

.container ul li > span {
  width: 2px;
  height: 100%;
  background: #fff;
  left: -30px;
  top: 0;
  position: absolute;
}

.container ul li > span:before,
.container ul li > span:after {
  content: '';
  width: 8px;
  height: 8px;
  border-radius: 50%;
  border: 2px solid #fff;
  position: absolute;
  background: #86b7e7;
  left: -3px;
  top: 0;
}

.container ul li span:after {
  top: 100%;
}

.container ul li > div {
  margin-left: 10px;
}

.container div .title {
  background-image: linear-gradient(to right, green, rgb(122, 177, 77));
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.container div .type {
  font-weight: 600;
  font-size: 12px;
}

.container div .info {
  font-weight: 300;
}

.container div > div {
  margin-top: 5px;
}

.container span.number {
  height: 100%;
}

.container span.number span {
  position: absolute;
  font-size: 10px;
  left: -35px;
  font-weight: bold;
}

.container span.number span:first-child {
  top: 0;
}

.container span.number span:last-child {
  top: 100%;
}
</style>
