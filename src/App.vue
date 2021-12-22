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
阵营：{{align}}
体型：{{size}}
年龄：{{age}}
性别：{{sex}}
语言：{{language}}
身高：{{height}}尺
体重：{{selfWeight}}磅
信仰：{{religion}}
职业：{{class}}
等级：{{level}}
经验：{{exp}}/{{levelUpExp}}
****************************************************************************
`
let t = ref(new T(template))

const card = computed(() => t.value && t.value.render(pc.value.print()))
</script>

<template>
  <div class="wrapper">
    <card v-model="pc"></card>
    <pre>
      {{ card }}
    </pre>
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
