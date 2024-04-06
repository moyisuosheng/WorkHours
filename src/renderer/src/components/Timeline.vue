<script setup lang="ts">
import { Ref, ref, h, onMounted, onBeforeMount } from 'vue'
import { type UseDraggableReturn, VueDraggable } from 'vue-draggable-plus'
import dayjs, { Dayjs } from 'dayjs'
import { message } from 'ant-design-vue'
import {
  DeleteOutlined,
  PlusOutlined,
  SettingOutlined,
  SaveOutlined,
  ImportOutlined,
  PushpinOutlined
} from '@ant-design/icons-vue'
//配置类名称
const configureName = 'config'

const el = ref<UseDraggableReturn>()

type nodeConfig = {
  min: number
  max: number
  step: number
}

//定义节点类型
type node = {
  duration: number
  percent?: number
  startTime?: Dayjs
  endTime?: Dayjs
  title?: string
  info?: string
  type?: number
  config: nodeConfig
}
//定义工作时间设置
type configure = {
  rang: [Dayjs, Dayjs]
  ignoreRang: [Dayjs, Dayjs]
  min: number
  max: number
  step: number
  initDuration: number
  timeRangeformat: string
  displayFormat: string
  copyFormat: string
  disabledTime: Dayjs
}

type DisabledTime = (now: Dayjs) => {
  disabledHours?: () => number[]
  disabledMinutes?: (selectedHour: number) => number[]
  disabledSeconds?: (selectedHour: number, selectedMinute: number) => number[]
}

//是否置顶
const topping = ref<boolean>(false)

const range = (start: number, end: number): number[] => {
  const result: number[] = []
  for (let i: number = start; i < end; i++) {
    result.push(i)
  }
  console.log('result', result, start, end)

  return result
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const disabledTime: DisabledTime = (_now) => {
  const hour: number = config.value.disabledTime.hour() // 获取当前的小时
  const minute: number = config.value.disabledTime.minute() // 获取当前的分钟
  const second: number = config.value.disabledTime.second()
  return {
    disabledHours: () => range(0, 24).splice(0, hour),

    disabledMinutes: (selectedHour) => {
      console.log('selectedHour,hour', selectedHour, hour)
      if (selectedHour > hour) {
        console.log('range(0, 60)', range(0, 60))
        return []
      } else if ((selectedHour = hour)) {
        console.log('selectedHour = hour', range(0, minute), minute)
        return range(0, minute + 1)
      } else {
        console.log('range(0, 60).splice(0, min)', range(0, 60).splice(0, minute))
        return range(0, 60)
      }
    },
    disabledSeconds: (selectedHour, selectedMinute) => {
      if (selectedHour > hour && selectedMinute > minute) {
        return []
      } else if (selectedHour == hour && selectedMinute == minute) {
        return range(0, second + 1)
      } else {
        return range(0, 60)
      }
    }
  }
}

//配置类初始化
const config: Ref<configure> = ref<configure>({
  rang: [dayjs('09:00:00', 'HH:mm:ss'), dayjs('18:00:00', 'HH:mm:ss')],
  ignoreRang: [dayjs('12:00:00', 'HH:mm:ss'), dayjs('13:00:00', 'HH:mm:ss')],
  min: 0.5,
  max: 4.1,
  step: 0.1,
  initDuration: 2.5,
  timeRangeformat: 'HH:mm',
  disabledTime: dayjs('09:10:00', 'HH:mm:ss'),
  displayFormat: 'YYYY-MM-DD HH:mm:ss',
  copyFormat: 'YYYY-MM-DD HH:mm:ss'
})

const list: Ref<node[]> = ref([])

//抽屉是否打开
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

const pushpin = () => {
  topping.value = !topping.value
  if (topping.value) {
    window.electronAPI.setTop()
  } else {
    window.electronAPI.cancelTop()
  }
}

//在滑动条上松开鼠标按键时触发
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const onAfterChange = (_value: number) => {
  updateList()
}

//更新集合
const updateList = () => {
  let startDay: Dayjs = config.value.rang[0]

  list.value.forEach((item) => {
    const start = startDay.clone()
    const diff = union(start, item.duration, config.value.ignoreRang)
    const end = startDay.add(diff, 'hour')
    if (diff > item.duration) {
      item.title = '总计：' + diff + '小时'
      item.info = '工时：' + item.duration + '小时'
      item.percent = Math.round((item.duration / diff) * 100 * 100) / 100
      item.type = 1
    } else {
      item.title = '总计：' + diff + '小时'
      item.info = '工时：' + item.duration + '小时'
      item.percent = 100
      item.type = 0
    }

    item.startTime = start
    item.endTime = end

    startDay = end

    item.config.min = config.value.min
    item.config.max = config.value.max
    item.config.step = config.value.step

    // console.log('下次开始时间', startDay?.format('HH.mm'))
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
    return duration + arr2[1].diff(arr2[0], 'hour', true)
  } else {
    return duration
  }
}

//添加元素
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const add = (_index: number) => {
  const item: node = {
    duration: config.value.initDuration,
    config: {
      min: config.value.min,
      max: config.value.max,
      step: config.value.step
    }
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
  config.value.rang = e
  config.value.disabledTime = e[0]
  updateList()
}

//当修改了 忽略时间范围触发
const timeIgnoreRangChange = (e) => {
  config.value.ignoreRang = e
  updateList()
}

//页面加载完毕后，添加一个元素
onMounted(() => {
  add(0)
  updateList()
})
//导入配置文件
onBeforeMount(async () => {
  await importConfig(false)
})

const saveConfig = async () => {
  await window.electronAPI.setStore(configureName, JSON.parse(JSON.stringify(config.value)))
  message.success('已保存当前配置！')
}

//将读取的配置赋值给当前配置类对象中
const importSetting = async (setting: configure) => {
  if (setting) {
    config.value.rang[0] = dayjs(setting.rang[0]) ?? config.value.rang[0]
    config.value.rang[1] = dayjs(setting.rang[1]) ?? config.value.rang[1]

    config.value.ignoreRang[0] = dayjs(setting.ignoreRang[0]) ?? config.value.ignoreRang[0]
    config.value.ignoreRang[1] = dayjs(setting.ignoreRang[1]) ?? config.value.ignoreRang[1]

    config.value.min = setting.min ?? config.value.min
    config.value.max = setting.max ?? config.value.max
    config.value.step = setting.step ?? config.value.step
    config.value.initDuration = setting.initDuration ?? config.value.initDuration
    config.value.timeRangeformat = setting.timeRangeformat ?? config.value.timeRangeformat
    config.value.displayFormat = setting.displayFormat ?? config.value.displayFormat
    config.value.copyFormat = setting.copyFormat ?? config.value.copyFormat
    config.value.disabledTime = dayjs(setting.disabledTime) ?? config.value.disabledTime

    updateList()
  } else {
    window.electronAPI.setStore(configureName, JSON.parse(JSON.stringify(config.value)))
  }
}
//读取配置文件
const importConfig = async (isMessage: boolean) => {
  const setting: configure = (await window.electronAPI.getStore(configureName)) as configure
  await importSetting(setting)
  //通过闭包控制，第一次的时候不提示
  if (isMessage) {
    message.success('已从文件中读取配置！')
  }
}
</script>

<template>
  <div id="container" class="container">
    <a-float-button-group shape="circle" :style="{ right: '24px' }">
      <a-float-button @click="handleClick">
        <template #icon>
          <SettingOutlined />
        </template>
      </a-float-button>

      <a-float-button @click="pushpin">
        <template #icon>
          <PushpinOutlined :class="{ 'rotate-start': topping, 'rotate-end': !topping }" />
        </template>
      </a-float-button>
      <a-back-top :visibility-height="0" />
    </a-float-button-group>

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
        <div>
          <div class="card-title">工作时间区间</div>
          <a-time-range-picker
            :value="config.rang"
            :bordered="false"
            :allow-clear="false"
            :format="config.timeRangeformat"
            @change="timeRangChange"
          />
        </div>
        <div>
          <div class="card-title">午休时间区间</div>
          <a-time-range-picker
            :value="config.ignoreRang"
            :bordered="false"
            :allow-clear="false"
            :format="config.timeRangeformat"
            :disabled-time="disabledTime"
            @change="timeIgnoreRangChange"
          />
        </div>

        <div>
          <div class="card-title">步长</div>
          <a-row>
            <a-col :span="12">
              <a-slider v-model:value="config.step" :min="0.01" :max="1" :step="0.01" />
            </a-col>
            <a-col :span="4">
              <a-input-number
                v-model:value="config.step"
                :min="0.01"
                :max="1"
                :step="0.01"
                style="margin-left: 16px"
              />
            </a-col>
          </a-row>
        </div>
        <div>
          <div class="card-title">最小工时</div>
          <a-row>
            <a-col :span="12">
              <a-slider v-model:value="config.min" :min="0.01" :max="8.0" :step="0.01" />
            </a-col>
            <a-col :span="4">
              <a-input-number
                v-model:value="config.min"
                :min="0.01"
                :max="8.0"
                :step="0.01"
                style="margin-left: 16px"
              />
            </a-col>
          </a-row>
        </div>
        <div>
          <div class="card-title">最大工时</div>
          <a-row>
            <a-col :span="12">
              <a-slider v-model:value="config.max" :min="0.01" :max="8.0" :step="0.01" />
            </a-col>
            <a-col :span="4">
              <a-input-number
                v-model:value="config.max"
                :min="0.01"
                :max="8.0"
                :step="0.01"
                style="margin-left: 16px"
              />
            </a-col>
          </a-row>
        </div>

        <div>
          <div class="card-title">显示格式</div>
          <a-row>
            <a-typography-text code>{{ config.displayFormat }}</a-typography-text>
          </a-row>
        </div>

        <div>
          <div class="card-title">拷贝格式</div>
          <a-row>
            <a-typography-text code>{{ config.copyFormat }}</a-typography-text>
          </a-row>
        </div>
      </a-flex>
      <template #extra>
        <a-space>
          <a-tooltip title="read">
            <a-button
              type="primary"
              shape="circle"
              :icon="h(ImportOutlined)"
              @click="importConfig(true)"
            />
          </a-tooltip>
          <a-tooltip title="save">
            <a-button type="primary" shape="circle" :icon="h(SaveOutlined)" @click="saveConfig" />
          </a-tooltip>
        </a-space>
      </template>
    </a-drawer>
    <div v-if="list.length === 0">
      <a-button :icon="h(PlusOutlined)" type="primary" shape="circle" @click="add(0)" />
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
            <div>
              <div class="title">{{ item.title ?? '' }}</div>
              <div class="info">
                <a-typography-paragraph :copyable="{ tooltip: false, text: item.duration ?? 0 }">
                  {{ item.info ?? '' }}
                </a-typography-paragraph>
              </div>
              <a-slider
                v-model:value="item.duration"
                :min="item?.config?.min ?? 0.1"
                :max="item?.config?.max ?? 4.1"
                :step="item?.config?.step ?? 0.01"
                @after-change="onAfterChange"
              />
              <div class="operate">
                <a-row justify="space-around" :align="'middle'">
                  <a-col :span="8">
                    <a-flex gap="middle" :align="'center'" vertical>
                      <span>
                        <a-progress
                          :stroke-color="{
                            '0%': '#108ee9',
                            '100%': '#87d068'
                          }"
                          type="circle"
                          :percent="item.percent ?? 100"
                          :size="16"
                        />
                      </span>
                    </a-flex>
                  </a-col>
                  <a-col :span="8">
                    <a-flex gap="middle" :align="'center'" vertical
                      ><span v-show="list.length === index + 1">
                        <PlusOutlined @click="add(index)" />
                      </span>
                    </a-flex>
                  </a-col>
                  <a-col :span="8">
                    <a-flex gap="middle" :align="'center'" vertical>
                      <span v-show="0 !== index"> <DeleteOutlined @click="del(index)" /> </span>
                    </a-flex>
                  </a-col>
                </a-row>
              </div>
            </div>
            <span class="number" :style="{ height: (item.percent ?? 100) + '%' }">
              <span>
                <a-typography-paragraph :copyable="{ tooltip: false }" class="start-time-text">
                  {{ item.startTime?.format(config.displayFormat ?? 'YYYY-MM-DD HH:mm:ss') }}
                </a-typography-paragraph>
              </span>

              <span>
                <a-typography-paragraph :copyable="{ tooltip: false }" class="end-time-text">
                  {{ item.endTime?.format(config.displayFormat ?? 'YYYY-MM-DD HH:mm:ss') }}
                </a-typography-paragraph>
              </span>
            </span>
          </li>
        </VueDraggable>
      </ul>
    </div>
    <a-back-top />
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
  margin-top: 60px;
  margin-bottom: 60px;
  margin-left: 80px;
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
  /* height: 100%; */
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
  cursor: pointer;
}

.container span.number span {
  position: absolute;
  font-size: 14px;
  right: 20px;
  width: 180px;
  text-align: end;
  font-weight: bold;
}

.container span.number span:first-child {
  top: 0;
}

.container span.number span:last-child {
  top: 100%;
}
.card-title {
  color: #86b7e7;
}
.start-time-text {
  color: #ffffff;
}
.end-time-text {
  color: #7993b7;
}
.rotate-start {
  -webkit-transform: rotate(-45deg);
  transform: rotate(-45deg);
  -webkit-transition: -webkit-transform 500ms linear;
  transition: transform 500ms linear;
}
.rotate-end {
  -webkit-transition: -webkit-transform 500ms linear;
  transition: transform 500ms linear;
}
</style>
