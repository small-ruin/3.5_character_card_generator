<script setup>
import { ref } from "vue";
import Class from './views/Class.vue'

const aligns = [
  { value: "LG", label: "守序善良" },
  { value: "NG", label: "中立善良" },
  { value: "CG", label: "混乱善良" },
  { value: "LN", label: "守序中立" },
  { value: "NN", label: "绝对中立" },
  { value: "CN", label: "混乱中立" },
  { value: "LE", label: "守序邪恶" },
  { value: "NE", label: "中立邪恶" },
  { value: "CE", label: "混乱邪恶" },
];

const form = ref({
  class: []
})

const activeKey = ref(['base', 'class'])
</script>

<template>
    <a-collapse v-model:activeKey="activeKey">
      <a-collapse-panel key="base" header="基础信息">
        <a-form :model="form">
          <a-form-item label="姓名"><a-input v-model:value="form.name"/></a-form-item>
          <a-form-item label="年龄"><a-input v-model:value="form.age"/></a-form-item>
          <a-form-item label="信仰"><a-input v-model:value="form.religion"/></a-form-item>
          <a-form-item label="阵营">
            <a-select v-model:value="form.align">
              <a-select-option v-for="a in aligns" :key="a.value" :value="a.value">{{a.label}}</a-select-option>
            </a-select>
          </a-form-item>
          <a-form-item label="语言"><a-input v-model:value="form.language"/></a-form-item>
        </a-form>
      </a-collapse-panel>
      <a-collapse-panel key="class" header="职业">
        <class></class>
      </a-collapse-panel>
      <a-collapse-panel key="abilities" header="属性">

      </a-collapse-panel>
      <a-collapse-panel key="skills" header="技能">

      </a-collapse-panel>
      <a-collapse-panel key="fate" header="专长">

      </a-collapse-panel>
      <a-collapse-panel key="items" header="物品">

      </a-collapse-panel>
      <a-collapse-panel key="spell" header="法术">

      </a-collapse-panel>
    </a-collapse>
</template>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
}
</style>
