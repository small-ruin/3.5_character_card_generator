import { createApp } from 'vue'
import App from './App.vue'
import {
    AutoComplete, Collapse, CollapsePanel, message, Popover
} from 'ant-design-vue'
import 'ant-design-vue/dist/antd.css'

const cs = [
    AutoComplete, Collapse, CollapsePanel, Popover
]

const app = createApp(App)

cs.forEach(c => app.use(c))

app.config.globalProperties.$message = message;

app.mount('#app')

