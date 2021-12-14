<script setup>
import { ref, computed } from "vue";
import CharacterClass, { getClassByName, SaveType } from './core/Class'
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
  class: [],
  STRENGTH: 10,
  DEXTERITY: 10,
  CONSTITUTION: 10,
  INTELLIGENCE: 10,
  WISDOM: 10,
  CHARISMA: 10,
})

const characterClasses = ref([{ level: 1 }])

const activeKey = ref(['base', 'class', 'abilities'])

function safeGetClass(c) {
    if (!c.name) return null
    const level = c.level
    if (!(c instanceof CharacterClass)) {
        c = getClassByName(c.name)
        c.level = level
    }
    return c
}
// TODO: create save core model
function computeSave(saveType, level) {
  if (saveType === SaveType.STRONG) {
    return Math.floor((level * 5 + 20) / 10)
  }

  if (saveType === SaveType.WEAK) {
    return Math.floor(level / 3)
  }
}
const createSaveComputed = saveName => computed(() => characterClasses.value.reduce((p, c) => {
  c = safeGetClass(c)
  if (!c) return p
  return p + computeSave(c[saveName], c.level)
}, 0))

const bab = computed(() => characterClasses.value.reduce((p, c) => {
  c = safeGetClass(c)
  if (!c) return p
  return p + Math.floor(c.level * c.bab)
}, 0))

const fortSave = createSaveComputed('fortSave')
const refSave = createSaveComputed('refSave')
const willSave = createSaveComputed('willSave')
</script>

<template>
    <a-collapse v-model:activeKey="activeKey">
      <a-collapse-panel key="base" header="基础信息">
        <a-form :model="form">
          <a-form-item label="姓名"><a-input v-model:value="form.name"/></a-form-item>
          <a-form-item label="种族"><a-input v-model:value="form.name"/></a-form-item>
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
        <class v-model="characterClasses"></class>
      </a-collapse-panel>
      <a-collapse-panel key="abilities" header="属性">
        <a-form :model="form">
          <a-form-item label="力量"><a-input-number v-model:value="form.STRENGTH"/></a-form-item>
          <a-form-item label="敏捷"><a-input-number v-model:value="form.DEXTERITY"/></a-form-item>
          <a-form-item label="体质"><a-input-number v-model:value="form.CONSTITUTION"/></a-form-item>
          <a-form-item label="智力"><a-input-number v-model:value="form.INTELLIGENCE"/></a-form-item>
          <a-form-item label="感知"><a-input-number v-model:value="form.WISDOM"/></a-form-item>
          <a-form-item label="魅力"><a-input-number v-model:value="form.CHARISMA"/></a-form-item>
        
          <a-form-item label="bab">{{bab}}</a-form-item>
          <a-form-item label="擒抱"></a-form-item>
          <a-form-item label="强韧检定">{{fortSave}}</a-form-item>
          <a-form-item label="反射检定">{{refSave}}</a-form-item>
          <a-form-item label="意志检定">{{willSave}}</a-form-item>

        </a-form>
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
