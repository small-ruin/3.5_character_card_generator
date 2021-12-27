<script setup>
import { ref, computed, watch, watchEffect, nextTick } from "vue";
import { message } from 'ant-design-vue';
import { getWeightByStr, aligns, sizes, sizeModifyMap, SaveType, allSkills, AbilityNameMap  } from '../core'
import CharacterClass, { getClassByName } from '../core/Class'
import Class from './Class.vue'

import { useModelWrapper } from '../hooks/useModelWrapper'

const props = defineProps({
    modelValue: Object,
})
const emit = defineEmits(['update:modelValue'])

const form = useModelWrapper(props, emit)

const abilityModifiers = computed(() => {
  return {
      STRENGTH: form.value['STRENGTH'].modify,
      DEXTERITY: form.value['DEXTERITY'].modify,
      CONSTITUTION: form.value['CONSTITUTION'].modify,
      INTELLIGENCE: form.value['INTELLIGENCE'].modify,
      WISDOM: form.value['WISDOM'].modify,
      CHARISMA: form.value['CHARISMA'].modify,
  }
})

const activeKey = ref(['base', 'class', 'abilities', 'skills', 'fates', 'traits', 'items', 'spells', 'attacks', 'armors'])
const customClass = ref([])

function safeGetClass(c) {
    if (!c.name) return null
    const level = c.level
    if (!(c instanceof CharacterClass)) {
        let cc = customClass.value.find(cc => cc.name === c.name)
        if (cc) {
          c = cc
        } else {
          c = getClassByName(c.name)
          c.level = level
        }
    }
    return c
}
const characterClasses = computed(() => form.value.class.filter(i => i.name).map(c => safeGetClass(c)))
const level = computed(() => characterClasses.value.reduce((p, c) => p + c.level, 0))

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
  if (!c) return p
  const rst = p + computeSave(c[saveName], c.level)
  return rst
}, 0))

const bab = computed(() => characterClasses.value.reduce((p, c) => {
  if (!c) return p
  return p + Math.floor(c.level * c.bab)
}, 0))

const fortSave = createSaveComputed('fortSave')
const refSave = createSaveComputed('refSave')
const willSave = createSaveComputed('willSave')
const totalFortSave = computed(() => fortSave.value + form.value.otherFortSave + form.value.CONSTITUTION.modify)
const totalRefSave = computed(() => refSave.value + form.value.otherRefSave + form.value.DEXTERITY.modify)
const totalWillSave = computed(() => willSave.value + form.value.otherWillSave + form.value.WISDOM.modify)

const skillMax = computed(() => characterClasses.value.reduce((p, c) => p + c.level || 0, 3))
const classSkills = computed({
  get: () => form.value.classSkills,
  set: (v) => form.value.classSkills = v
})
const resetClassSkills = function() {
  nextTick(() => {
    classSkills.value = {}
    characterClasses.value.forEach(c => {
      c.skills.forEach(s => !(s in classSkills.value) && (classSkills.value[s.name] = true))
    })
  })
}

const skillPoints = computed(() => {
  let points = 0
  let classes = characterClasses.value.slice()
  let firstClass = classes.shift()
  if (!firstClass) return 0
  else points = (
    firstClass.skillPointsEachLevel +
    abilityModifiers.value.INTELLIGENCE +
    form.value.raceSkillPoint
  ) * (firstClass.level + 3)

  classes.forEach(c => {
    points += (c.skillPointsEachLevel +
      abilityModifiers.value.INTELLIGENCE +
      form.value.raceSkillPoint) * c.level
  })

  return points
})

const usedSkillPoints = computed(() => {
  return Object.values(form.value.skills).reduce((p, c) => p + c.point, 0)
})

const levelUpExp = computed(() => {
    const level = form.value.class.reduce((p, c) => c.level + p, 0)
    return Math.round(500*level*level + 1500*level + 1000)
})

function handleSkillInputChange(p, skill) {
  if (skillPoints.value - usedSkillPoints.value < 0) {
    message.error('没有技能点了')
    form.value.skills[skill.name].point = p - 1
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
autoIncrease(form.value.traits, 'name')
autoIncrease(form.value.items, 'name')
autoIncrease(form.value.spells, 'spell')
autoIncrease(form.value.attacks, 'name')
autoIncrease(form.value.armors, 'name')

const weightLimit = computed(() => getWeightByStr(form.value.STRENGTH.ability))
const coinWeight = computed(() => ((form.value.pp + form.value.gp + form.value.sp + form.value.cp) / 50).toFixed(2))
const weight = computed(() => (
  form.value.items.reduce((p, c) => p +
    +(c.weight * c.count || 0), 0) +
    +coinWeight.value).toFixed(2)
)
const weightDetail = computed(() => {
  if (weight.value < weightLimit.value[0]) return '轻载'
  else if (weight.value <= weightLimit.value[1]) return '中载'
  else if (weight.value <= weightLimit.value[2]) return '重载'
  else return '超重'
})
const hitPoint = computed(() => {
  return (form.value.classHitPoint || 0) + form.value.CONSTITUTION.modify * level.value
})
const totalAc = computed(() => form.value.ac.armor + form.value.ac.dex + form.value.ac.other + 10)
const touchAc = computed(() => form.value.ac.dex + 10)
const flatFootAc = computed(() => form.value.ac.armor + 10 + form.value.ac.other)
const init = computed(() => form.value.otherInit + form.value.DEXTERITY.modify)
const grab = computed(() => sizeModifyMap[form.value.size] * 4 + form.value.STRENGTH.modify + bab.value + form.value.otherGrab)

watchEffect(() => {
  const map = {
    bab, fortSave, refSave, willSave,
    skillMax, skillPoints, usedSkillPoints,
    levelUpExp, weightLimit, coinWeight,
    weight, weightDetail, level, hitPoint,
    totalAc, touchAc, flatFootAc, init, grab,
    totalFortSave, totalRefSave, totalWillSave,
    classSkills, abilityModifiers, weightLimit
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
          <a-form-item label="体型">
            <a-select v-model:value="form.size">
              <a-select-option v-for="a in sizes" :key="a.value" :value="a.value">{{a.label}}</a-select-option>
            </a-select>
          </a-form-item>
          <a-form-item label="性别"><a-input v-model:value="form.sex"/></a-form-item>
          <a-form-item label="年龄"><a-input v-model:value="form.age"/></a-form-item>
          <a-form-item label="身高"><a-input-number v-model:value="form.height" step="0.1" />尺</a-form-item>
          <a-form-item label="体重"><a-input-number v-model:value="form.selfWeight" />磅</a-form-item>
          <a-form-item label="阵营">
            <a-select v-model:value="form.align">
              <a-select-option v-for="a in aligns" :key="a.value" :value="a.value">{{a.label}}</a-select-option>
            </a-select>
          </a-form-item>
          <a-form-item label="信仰"><a-input v-model:value="form.religion"/></a-form-item>
          <a-form-item label="语言"><a-input v-model:value="form.language"/></a-form-item>
          <a-form-item label="经验"><a-input v-model:value="form.exp"/>/{{levelUpExp}}</a-form-item>
        </a-form>
      </a-collapse-panel>
      <a-collapse-panel key="class" header="职业">
        <class
          v-model="form.class" :custom-class="customClass"
          @select="resetClassSkills"></class>
      </a-collapse-panel>
      <a-collapse-panel key="abilities" header="属性">
        <a-form :model="form">
          <a-form-item label="生命值">
            {{hitPoint}}=
            <a-input-number v-model:value="form.classHitPoint"></a-input-number>{{
              characterClasses.length
              ? '(' + characterClasses
                .reduce((p,c) => p + `${c.level}d${c.hitDice}+`, '')
                .slice(0, -1) + ')'
              : ''
            }}{{form.CONSTITUTION.modify ? `+${form.CONSTITUTION.modify}*${level}` : ''}}
          </a-form-item>
          <a-form-item label="力量">
            {{form.STRENGTH.ability}}=
            <a-input-number v-model:value="form.STRENGTH.base"/>初始值
            + <a-input-number v-model:value="form.STRENGTH.race" />种族调整
            + <a-input-number v-model:value="form.STRENGTH.other"/>其它调整
          </a-form-item>
          <a-form-item label="敏捷">
            {{form.DEXTERITY.ability}}=
            <a-input-number v-model:value="form.DEXTERITY.base"/>初始值
            + <a-input-number v-model:value="form.DEXTERITY.race" />种族调整
            + <a-input-number v-model:value="form.DEXTERITY.other"/>其它调整
          </a-form-item>
          <a-form-item label="体质">
            {{form.CONSTITUTION.ability}}=
            <a-input-number v-model:value="form.CONSTITUTION.base"/>初始值
            + <a-input-number v-model:value="form.CONSTITUTION.race" />种族调整
            + <a-input-number v-model:value="form.CONSTITUTION.other"/>其它调整
          </a-form-item>
          <a-form-item label="智力">
            {{form.INTELLIGENCE.ability}}=
            <a-input-number v-model:value="form.INTELLIGENCE.base"/>初始值
            + <a-input-number v-model:value="form.INTELLIGENCE.race" />种族调整
            + <a-input-number v-model:value="form.INTELLIGENCE.other"/>其它调整
          </a-form-item>
          <a-form-item label="感知">
            {{form.WISDOM.ability}}=
            <a-input-number v-model:value="form.WISDOM.base"/>初始值
            + <a-input-number v-model:value="form.WISDOM.race" />种族调整
            + <a-input-number v-model:value="form.WISDOM.other"/>其它调整
          </a-form-item>
          <a-form-item label="魅力">
            {{form.CHARISMA.ability}}=
            <a-input-number v-model:value="form.CHARISMA.base"/>初始值
            + <a-input-number v-model:value="form.CHARISMA.race" />种族调整
            + <a-input-number v-model:value="form.CHARISMA.other"/>其它调整
          </a-form-item>
        
          <a-form-item label="bab">{{bab}}</a-form-item>
          <a-form-item label="ac">
            {{totalAc}} = 10+
              <a-input-number v-model:value="form.ac.armor"></a-input-number>盔甲及盾牌+
              <a-input-number v-model:value="form.ac.dex"></a-input-number>敏捷+
              <a-input-number v-model:value="form.ac.other"></a-input-number>其它
              <br />
            接触：{{touchAc}} 措手不及：{{flatFootAc}}
          </a-form-item>
          <a-form-item label="先攻">
            {{init}}={{form.DEXTERITY.modify}}敏捷
            +<a-input-number v-model:value="form.otherInit"></a-input-number>其它
          </a-form-item>
          <a-form-item label="擒抱">
            {{grab}}={{bab}}bab+{{form.STRENGTH.modify}}力量+{{sizeModifyMap[form.size] * 4}}体型+
          <a-input-number v-model:value="form.otherGrab"></a-input-number>其它
          </a-form-item>
          <a-form-item label="强韧豁免">
            {{totalFortSave}}={{fortSave}}基础 + <a-input-number v-model:value="form.otherFortSave"></a-input-number>其它
          </a-form-item>
          <a-form-item label="反射豁免">
            {{totalRefSave}}={{refSave}}基础 + <a-input-number v-model:value="form.otherRefSave"></a-input-number>其它</a-form-item>
          <a-form-item label="意志豁免">
            {{totalWillSave}}={{willSave}}基础 + <a-input-number v-model:value="form.otherWillSave"></a-input-number>其它</a-form-item>
          <a-form-item label="速度">
            <a-input-number v-model:value="form.speed"></a-input-number>
            奔跑<a-input-number v-model:value="form.runSpeed"></a-input-number>
          </a-form-item>
        </a-form>
      </a-collapse-panel>
      <a-collapse-panel key="attacks" header="攻击">
        <a-form-item v-for="(a, i) in form.attacks" :key="i">
          <a-input placeholder="武器" v-model:value="a.name" />
          <a-input placeholder="攻击检定" v-model:value="a.attackRoll" />
          <a-input placeholder="伤害骰" v-model:value="a.damage" />
          <a-input placeholder="重击" v-model:value="a.critical" />
          <a-input-number placeholder="射程" v-model:value="a.range" />
        </a-form-item>
      </a-collapse-panel>
      <a-collapse-panel key="armors" header="盔甲">
          <a-form-item v-for="(a, i) in form.armors" :key="i">
            <a-input placeholder="名称" v-model:value="a.name" />
            <a-input-number v-model:value="a.bonus" />盔甲和盾牌加值
            <a-input-number v-model:value="a.maxDex" />最大敏捷加值
            <a-input-number v-model:value="a.checkPenalty" />防具检定减值
            <a-input-number v-model:value="a.arcaneFailure" />% 奥术失败几率
            <a-input-number v-model:value="a.speed" />速度
          </a-form-item>
      </a-collapse-panel>
      <a-collapse-panel key="skills" header="技能">
        <a-form-item label="种族奖励技能点">
            <a-input-number
              v-model:value="form.raceSkillPoint"
              :min="0"
              ></a-input-number>
        </a-form-item>
        <a-form-item label="盔甲减值">
            <a-input-number
              v-model:value="form.armorSkillModify"
              :min="0"
            ></a-input-number>
        </a-form-item>
        <a-form-item>剩余技能点数：{{skillPoints - usedSkillPoints}}/{{skillPoints}}</a-form-item>
        <a-form-item v-for="s in allSkills" :key="s.name" :label="s.name">
            <a-checkbox v-model:checked="classSkills[s.name]">本职技能</a-checkbox>
            <span>{{s.getPoint(
              abilityModifiers,
              form.skills[s.name],
              classSkills[s.name],
              form.armorSkillModify
            )}}</span> =
            <a-input-number
              v-model:value="form.skills[s.name].point"
              @change="v => handleSkillInputChange(v, s)"
              :max="skillMax"
              :min="0"
              ></a-input-number>
              <span v-if="form.skills[s.name].point">({{s.name in classSkills && classSkills[s.name]
                  ? form.skills[s.name].point
                  : Math.floor(form.skills[s.name].point / 2)}})</span>
            + {{abilityModifiers[s.baseAbility]}}{{AbilityNameMap[s.baseAbility]}}
            + <a-input-number v-model:value="form.skills[s.name].other"></a-input-number>其它
            {{s.armor ? `- ${s.armor * form.armorSkillModify}盔甲减值` : ''}}

        </a-form-item>
      </a-collapse-panel>
      <a-collapse-panel key="fates" header="专长">
        <a-form-item v-for="(f, i) in form.fates" :key="i">
          <a-input placeholder="专长名" v-model:value="f.name" />
          <a-textarea placeholder="专长描述(非必填)" v-model:value="f.describe"></a-textarea>
        </a-form-item>
      </a-collapse-panel>
      <a-collapse-panel key="traits" header="种族特性与职业能力">
        <a-form-item v-for="(t, i) in form.traits" :key="i">
          <a-input placeholder="特性" v-model:value="t.name" />
          <a-textarea placeholder="描述(非必填)" v-model:value="t.describe"></a-textarea>
        </a-form-item>
      </a-collapse-panel>
      <a-collapse-panel key="items" header="物品">
        <a-form-item v-for="(it, i) in form.items" :key="i">
          <a-input placeholder="物品名称" v-model:value="it.name" />
          <a-input-number v-model:value="it.count" />数量
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
          轻载：{{'<' + weightLimit[0]}} 中载：{{'<' + (weightLimit[1] + 1)}} 重载：{{'<' + (weightLimit[2] + 1)}}
        </a-form-item>

      </a-collapse-panel>
      <a-collapse-panel key="spells" header="法术">
        <a-form-item v-for="(f, i) in form.spells" :key="i">
          {{i}}环：<a-textarea v-model:value="f.spell"></a-textarea>
        </a-form-item>
      </a-collapse-panel>
    </a-collapse>
</template>
