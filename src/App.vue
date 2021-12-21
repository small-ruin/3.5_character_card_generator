<script setup>
import { ref, computed } from '@vue/reactivity'
import Card from './views/Card.vue'
import PC from './core/Character'
import T from './core/template/index.js'

const pc = ref(new PC())
const template = `
****************************************************************************
姓名：{{name}}
种族：{{race}}
阵营：中立善良
体型：中等
年龄：{{age}}
性别：男
语言：{{language}}
身高：7.5尺
体重：300磅
信仰：卡瓦基
职业：野蛮人一级、战士二级
等级：三级（+1la）
经验：{{exp}}
****************************************************************************
`
let t = ref(new T(template))

const card = computed(() => t.value && t.value.render(pc.value))
</script>

<template>
  <div class="wrapper">
    <card v-model="pc"></card>
    <div>
      {{ card }}
    </div>
  </div>
</template>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
}
.wrapper {
  display: flex;
}
</style>
