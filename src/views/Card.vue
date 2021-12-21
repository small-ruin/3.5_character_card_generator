<script setup>
import { ref, computed, watch, watchEffect } from "vue";
import { message } from 'ant-design-vue';
import { getWeightByStr } from '../core/Weight'
import CharacterClass, { getClassByName, SaveType, allSkills } from '../core/Class'
import Class from './Class.vue'

import { useModelWrapper } from '../hooks/useModelWrapper'

const props = defineProps({
    modelValue: Object,
})
const emit = defineEmits(['update:modelValue'])

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

const form = useModelWrapper(props, emit)
const characterClasses = computed(() => form.value.class)

const computeAbilityModify = ability => Math.floor((ability - 10) / 2)
const abilityModifiers = computed(() => {
  return {
      STRENGTH: computeAbilityModify(form.value['STRENGTH']),
      DEXTERITY: computeAbilityModify(form.value['DEXTERITY']),
      CONSTITUTION: computeAbilityModify(form.value['CONSTITUTION']),
      INTELLIGENCE: computeAbilityModify(form.value['INTELLIGENCE']),
      WISDOM: computeAbilityModify(form.value['WISDOM']),
      CHARISMA: computeAbilityModify(form.value['CHARISMA']),
  }
})

const activeKey = ref(['base', 'class', 'abilities', 'skills', 'fates', 'items', 'spells'])

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
  const rst = p + computeSave(c[saveName], c.level)
  return rst
}, 0))

const bab = computed(() => characterClasses.value.reduce((p, c) => {
  c = safeGetClass(c)
  if (!c) return p
  return p + Math.floor(c.level * c.bab)
}, 0))

const fortSave = createSaveComputed('fortSave')
const refSave = createSaveComputed('refSave')
const willSave = createSaveComputed('willSave')

const skillMax = computed(() => characterClasses.value.reduce((p, c) => p + c.level || 0, 3))

const classSkills = computed(() => {
  const rst = {}

  characterClasses.value.forEach(c => {
    c = safeGetClass(c)
    c && c.skills.forEach(s => {
      if (!rst[s.name]) {
        rst[s.name] = true
      }
    })
  })

  return rst
})

const skillPoints = computed(() => {
  let points = 0
  let classes = characterClasses.value.slice()
  let firstClass = classes.shift()
  firstClass = safeGetClass(firstClass)
  if (!firstClass) return 0
  else points = (
    firstClass.skillPointsEachLevel +
    abilityModifiers.value.INTELLIGENCE +
    form.value.raceSkillPoint
  ) * (firstClass.level + 3)

  classes.forEach(c => {
    c = safeGetClass(c)
    if (c) {
      points += (c.skillPointsEachLevel +
        abilityModifiers.value.INTELLIGENCE +
        form.value.raceSkillPoint) * c.level
    }
  })

  return points
})

const usedSkillPoints = computed(() => {
  return Object.values(form.value.skills).reduce((p, c) => p + c, 0)
})

const levelUpExp = computed(() => {
    const level = form.value.class.reduce((p, c) => c.level + p, 0)
    return Math.round((level * level - level)*500) + 1000*level
})

function handleSkillInputChange(p, skill) {
  if (skillPoints.value - usedSkillPoints.value < 0) {
    message.error('没有技能点了')
    form.value.skills[skill.name] = p - 1
  }
}

// 自动新增一行
const autoIncrease = (target, key) => {
  watch(
    target,
    () => {
      if (target.find(t => !t[key])) {
        return
      }
      target.push({})
    },
    { deep: true }
  )
}
autoIncrease(form.value.fates, 'name')
autoIncrease(form.value.items, 'name')
autoIncrease(form.value.spells, 'name')

const weightLimit = computed(() => getWeightByStr(form.value.STRENGTH))
const coinWeight = computed(() => ((form.value.pp + form.value.gp + form.value.sp + form.value.cp) / 50).toFixed(2))
const weight = computed(() => (
  form.value.items.reduce((p, c) => p +
    +(c.weight || 0), 0) +
    +coinWeight.value).toFixed(2)
)
const weightDetail = computed(() => {
  if (weight.value < weightLimit.value[0]) return '轻载'
  if (weightLimit.value[0] < weight.value < weightLimit.value[1]) return '中载'
  if (weight.value > weightLimit.value[2]) return '轻载'
})

watchEffect(() => {
  const map = {
    bab, fortSave, refSave, willSave,
    skillMax, skillPoints, usedSkillPoints,
    levelUpExp, weightLimit, coinWeight,
    weight, weightDetail,
  }
  Object.keys(map).forEach(k => form.value.set(k, map[k].value))
})
</script>

<template>
    <a-collapse v-model:activeKey="activeKey">
      <a-collapse-panel key="base" header="基础信息">
        <a-form :model="form">
          <a-form-item label="姓名"><a-input v-model:value="form.name"/></a-form-item>
          <a-form-item label="种族"><a-input v-model:value="form.race"/></a-form-item>
          <a-form-item label="年龄"><a-input v-model:value="form.age"/></a-form-item>
          <a-form-item label="信仰"><a-input v-model:value="form.religion"/></a-form-item>
          <a-form-item label="阵营">
            <a-select v-model:value="form.align">
              <a-select-option v-for="a in aligns" :key="a.value" :value="a.value">{{a.label}}</a-select-option>
            </a-select>
          </a-form-item>
          <a-form-item label="语言"><a-input v-model:value="form.language"/></a-form-item>
          <a-form-item label="经验"><a-input v-model:value="form.exp"/>/{{levelUpExp}}</a-form-item>
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
        <a-form-item label="种族奖励技能点">
            <a-input-number
              v-model:value="form.raceSkillPoint"
              :min="0"
              ></a-input-number>
        </a-form-item>
        <a-form-item>剩余技能点数：{{skillPoints - usedSkillPoints}}</a-form-item>
        <a-form-item v-for="s in allSkills" :key="s.name" :label="s.name">
            <span v-if="s.name in classSkills">本职技能</span>
            <a-input-number
              v-model:value="form.skills[s.name]"
              @change="v => handleSkillInputChange(v, s)"
              :max="skillMax"
              :min="0"
              ></a-input-number>
            <span>{{s.getPoint(
              abilityModifiers,
              form.skills[s.name] || 0,
              classSkills[s.name]
            )}}</span>
        </a-form-item>
      </a-collapse-panel>
      <a-collapse-panel key="fate" header="专长">
        <a-form-item v-for="(f, i) in form.fates" :key="i">
          <a-input placeholder="专长名" v-model:value="f.name" />
          <a-textarea placeholder="专长描述(非必填)" v-model:value="f.describe"></a-textarea>
        </a-form-item>
      </a-collapse-panel>
      <a-collapse-panel key="items" header="物品">
        <a-form-item v-for="(it, i) in form.items" :key="i">
          <a-input placeholder="物品名称" v-model:value="it.name" />
          <a-input placeholder="价格" v-model:value="it.price"></a-input>
          <a-input placeholder="重量" v-model:value="it.weight"></a-input>
          <a-textarea placeholder="备注" v-model:value="it.remark"></a-textarea>
        </a-form-item>
        <a-form-item :label="p" :key="p" v-for="p in ['pp', 'gp', 'sp', 'cp']">
          <a-input-number :min="0" v-model:value="form[p]"></a-input-number>
        </a-form-item>
        <a-form-item>
          货币：{{form.pp + form.gp + form.sp + form.cp}}枚，
          {{(form.pp * 10 + form.gp + form.sp / 10 + form.cp / 100).toFixed(2)}}gp，
          {{coinWeight}}磅
        </a-form-item>
        <a-form-item>
          <p>负重：{{weight}}磅, {{weightDetail}}</p>
          轻载：{{'<' + weightLimit[0]}} 中载：{{'<' + (weightLimit[1] + 1)}} 重载：{{'>' + weightLimit[2]}}
        </a-form-item>

      </a-collapse-panel>
      <a-collapse-panel key="spells" header="法术">
        <a-form-item v-for="(f, i) in form.spells" :key="i">
          {{i}}环：<a-textarea v-model:value="f.name"></a-textarea>
        </a-form-item>
      </a-collapse-panel>
    </a-collapse>
</template>
