import { createApp } from 'vue'
import App from './App.vue'
import {
    AutoComplete, Button, Input, Form, Select, Collapse, Modal, Checkbox, InputNumber, message
} from 'ant-design-vue'
import 'ant-design-vue/dist/antd.css'

const cs = [
    AutoComplete, Button, Input, Form, Select, Collapse, Modal, Checkbox, InputNumber
]

const app = createApp(App)

cs.forEach(c => app.use(c))

app.config.globalProperties.$message = message;

app.mount('#app')

