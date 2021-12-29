import { message } from "ant-design-vue";

export class LocalStorage {
    name = '';
    constructor(name, limit) {
        this.name = name
        this.limit = limit
        try {
            this.data = JSON.parse(localStorage.getItem(name)) || []
        } catch(e) {
            setTimeout(() => {
                message.error('数据加载失败')
            })
            console.log('error when get localStorage data', name, e)
        }
    }

    save() {
        localStorage.setItem(this.name, JSON.stringify(this.data))
    }
    delete(i) {
        this.data.splice(i, 1)
        this.save()
    }
    add(v) {
        if (this.limit && this.data.length > this.limit) {
            this.data.pop()
        }
        this.data.unshift(JSON.parse(JSON.stringify(v)))
        this.save()
    }
}
