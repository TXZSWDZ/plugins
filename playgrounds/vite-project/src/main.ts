import ElementPlus from 'element-plus'
import { createApp } from 'vue'

import App from './App.vue'

import 'element-plus/dist/index.css'

const app = createApp(App)

app.config.globalProperties.hasPermission = () => {
  // 随机返回true或false
  return Math.random() > 0.5
}

app.use(ElementPlus)
app.mount('#app')
