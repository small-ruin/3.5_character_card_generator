import { createApp } from 'vue'
import App from './App.vue'
import {
    Button, Input, Form, Select, Checkbox, InputNumber, message, Popconfirm
} from 'ant-design-vue'
import 'ant-design-vue/dist/antd.css'

const cs = [
    Button, Input, Form, Select, Checkbox, InputNumber, Popconfirm
]

const app = createApp(App)

cs.forEach(c => app.use(c))

app.config.globalProperties.$message = message;

app.mount('#app')

