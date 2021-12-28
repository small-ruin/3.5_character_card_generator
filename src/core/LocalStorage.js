import { message } from "ant-design-vue";

export class LocalStorage {
    name = '';
    constructor(name) {
        this.name = name
        try {
            this.data = JSON.parse(localStorage.getItem(name)) || []
        } catch(e) {
            setTimeout(() => {
                message.error('数据加载失败')
            })
            console.log('error when get localStorage data', name, e)
        }
    }

    save(v) {
        localStorage.setItem(this.name, JSON.stringify(this.data))
    }
    delete(i) {
        this.data.splice(i, 1)
        this.save()
    }
    add(v) {
        this.data.push(v)
        this.save()
    }
}
