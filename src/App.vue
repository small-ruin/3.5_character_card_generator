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
    最终值 初始值    种族调整值    其它调整值
力量 {{STRENGTH.ability}}（{{STRENGTH.modify}}）= {{STRENGTH.base}}       +{{STRENGTH.race}}          +{{STRENGTH.other}}
敏捷 {{DEXTERITY.ability}}（{{DEXTERITY.modify}}）= {{DEXTERITY.base}}       +{{DEXTERITY.race}}          +{{DEXTERITY.other}}
体质 {{CONSTITUTION.ability}}（{{CONSTITUTION.modify}}）= {{CONSTITUTION.base}}       +{{CONSTITUTION.race}}          +{{CONSTITUTION.other}}
智力 {{INTELLIGENCE.ability}}（{{INTELLIGENCE.modify}}）= {{INTELLIGENCE.base}}       +{{INTELLIGENCE.race}}          +{{INTELLIGENCE.other}}
感知 {{WISDOM.ability}}（{{WISDOM.modify}}）= {{WISDOM.base}}       +{{WISDOM.race}}          +{{WISDOM.other}}
魅力 {{CHARISMA.ability}}（{{CHARISMA.modify}}）= {{CHARISMA.base}}       +{{CHARISMA.race}}          +{{CHARISMA.other}}
****************************************************************************
`
let t = ref(new T(template))

const card = computed(() => t.value && t.value.render(pc.value.print()))
</script>

<template>
  <div class="wrapper">
    <div>
      <card v-model="pc"></card>
    </div>
    <pre>
      {{ card }}
    </pre>
  </div>
</template>

<style>
#app {
  height: 100%;
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
}
.wrapper {
  display: flex;
  height: 100%;
}
.wrapper > div {
  height: 100%;
  overflow: auto;
}
</style>
