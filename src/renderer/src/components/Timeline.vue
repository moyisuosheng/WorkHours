<script setup lang="ts">
import { Ref, ref, reactive, h, onMounted } from 'vue'
import { type UseDraggableReturn, VueDraggable } from 'vue-draggable-plus'
import dayjs, { Dayjs } from 'dayjs'
import { DeleteOutlined, PlusOutlined, SettingOutlined } from '@ant-design/icons-vue'

const el = ref<UseDraggableReturn>()
//定义节点类型
type node = {
  duration: number
  percent?: number
  startTime?: Dayjs
  endTime?: Dayjs
  title?: string
  info?: string
  type?: number
}
//定义工作时间设置
type config = {
  rang: [Dayjs, Dayjs]
  ignoreRang: [Dayjs, Dayjs]
  min: number
  max: number
  step: number
  initDuration: number
}

//配置类初始化
const configImpl = reactive<config>({
  rang: [dayjs('09:00:00', 'HH:mm:ss'), dayjs('18:00:00', 'HH:mm:ss')],
  ignoreRang: [dayjs('12:00:00', 'HH:mm:ss'), dayjs('13:00:00', 'HH:mm:ss')],
  min: 0.5,
  max: 4.1,
  step: 0.1,
  initDuration: 2.5
})

const list: Ref<node[]> = ref([])

const disabled = ref(false)

const onStart = (e) => {
  console.log('start', e)
}

const onUpdate = (e) => {
  console.log('update', e)
  updateList()
}
//Drawer 抽屉
const open = ref<boolean>(false)

const afterOpenChange = (bool: boolean) => {
  console.log('open', bool)
}

//点击悬浮按钮，打开弹层
const handleClick = () => {
  open.value = true
}

//在滑动条上松开鼠标按键时触发
const onAfterChange = (_value: number) => {
  updateList()
}

//更新集合
const updateList = () => {
  let startDay: Dayjs = configImpl.rang[0]
  const endDay: Dayjs = configImpl.rang[1]

  list.value.forEach((item) => {
    const start = startDay.clone()
    const diff = union(start, item.duration, configImpl.ignoreRang)
    const end = startDay.add(diff, 'hour')
    if (diff > item.duration) {
      item.info = '总计：' + diff + '小时，工时：' + item.duration + '小时'
      item.percent = (item.duration / diff) * 100
    } else {
      item.info = item.duration + '小时'
      item.percent = 100
    }

    item.startTime = start
    item.endTime = end

    startDay = end

    console.log('下次开始时间', startDay?.format('HH.mm'))
  })
}

// 判断两个区间是否相交，相交则返回true
const isIntersect = (arr1: [Dayjs, Dayjs], arr2: [Dayjs, Dayjs]): boolean => {
  arr1.sort((a, b) => {
    if (a.isBefore(b)) {
      return 0
    } else {
      return 1
    }
  })

  arr2.sort((a, b) => {
    if (a.isBefore(b)) {
      return 0
    } else {
      return 1
    }
  })

  //最小值
  let min: Dayjs = arr1[0]
  //最大值
  let max: Dayjs = arr1[0]
  arr1.concat(arr2).forEach((item) => {
    min = min.isBefore(item) ? min : item
    max = max.isAfter(item) ? max : item

    // console.log('mix.max', min, max)
  })

  if (
    max.diff(min, 'hour', true) <
    arr1[1].diff(arr1[0], 'hour', true) + arr2[1].diff(arr2[0], 'hour', true)
  ) {
    return true
  } else {
    return false
  }
}

//不相交时，仅返回传入的差值，相交时，返回并集的差值
const union = (start: Dayjs, duration: number, arr2: [Dayjs, Dayjs]): number => {
  const end = start.add(duration, 'hour')
  if (isIntersect([start, end], arr2)) {
    console.log('相交', duration + arr2[1].diff(arr2[0], 'hour', true))
    return duration + arr2[1].diff(arr2[0], 'hour', true)
  } else {
    console.log('不相交', duration)
    return duration
  }
}

//添加元素
const add = (_index: number) => {
  const item: node = {
    duration: configImpl.initDuration
  }
  list.value.push(item)
  updateList()
}

//根据下标删除元素
const del = (index: number) => {
  list.value.splice(index, 1)
  updateList()
}

//当修改了工作时间范围配置后触发
const timeRangChange = (e) => {
  configImpl.rang = e
  updateList()
}

//当修改了 忽略时间范围触发
const timeIgnoreRangChange = (e) => {
  configImpl.ignoreRang = e
  updateList()
}

//页面加载完毕后，添加一个元素
onMounted(() => {
  add(0)
})
</script>

<template>
  <div class="container">
    <a-float-button @click="handleClick">
      <template #icon>
        <SettingOutlined />
      </template>
    </a-float-button>
    <a-drawer
      v-model:open="open"
      class="custom-class"
      root-class-name="root-class-name"
      :root-style="{ color: 'blue' }"
      style="color: red"
      title="Settings"
      placement="right"
      @after-open-change="afterOpenChange"
    >
      <a-flex gap="middle" vertical>
        <a-time-range-picker :value="configImpl.rang" :bordered="false" @change="timeRangChange" />
        <a-time-range-picker
          :value="configImpl.ignoreRang"
          :bordered="false"
          @change="timeIgnoreRangChange"
        />
        <a-input-number
          v-model:value="configImpl.step"
          style="width: 200px"
          :min="0.01"
          :max="1"
          :step="0.01"
          string-mode
        />
        <a-input-number
          v-model:value="configImpl.min"
          style="width: 200px"
          :min="0.01"
          :max="4.1"
          :step="0.01"
          string-mode
        />
      </a-flex>
    </a-drawer>
    <div v-if="list.length === 0">
      <a-button @click="add(0)" type="primary" shape="circle" :icon="h(PlusOutlined)" />
    </div>
    <div v-else>
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
              <a-slider
                v-model:value="item.duration"
                :min="configImpl.min"
                :max="configImpl.max"
                :step="configImpl.step"
                @after-change="onAfterChange"
              />
              <div class="type">{{ item.type }}</div>
              <div class="operate">
                <a-flex justify="space-around" align="space-around">
                  <span>
                    <a-progress
                      :stroke-color="{
                        '0%': '#108ee9',
                        '100%': '#87d068'
                      }"
                      type="circle"
                      :percent="item.percent"
                      :size="16"
                    />
                  </span>
                  <span v-if="0 !== index">
                    <DeleteOutlined @click="del(index)" />
                  </span>
                  <span v-if="list.length === index + 1">
                    <PlusOutlined @click="add(index)" />
                  </span>
                </a-flex>
              </div>
            </div>
            <span class="number">
              <span>{{ item.startTime?.format('HH:mm') }}</span>
              <span>{{ item.endTime?.format('HH:mm') }}</span>
            </span>
          </li>
        </VueDraggable>
      </ul>
    </div>
  </div>
</template>

<style lang="css" scoped>
.container {
  display: flex;
  align-items: center;
  justify-content: center;
  box-sizing: content-box;
}

.container ul {
  margin-top: 50px;
  margin-bottom: 50px;
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
.container div .operate {
  align-items: center;
  justify-content: space-between;
}

.container div .info {
  font-weight: 300;
}

.container div > div {
  margin-top: 5px;
}

.container span.number {
  height: 100%;
  cursor: pointer;
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
