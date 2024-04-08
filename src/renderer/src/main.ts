import './assets/index.css'

import { createApp } from 'vue'
import Antd from 'ant-design-vue'
import 'ant-design-vue/dist/reset.css'
import App from './App.vue'
import dayjs from 'dayjs'
import minMax from 'dayjs/plugin/minMax'

dayjs.extend(minMax)

const app = createApp(App)

app.use(Antd).mount('#app')
