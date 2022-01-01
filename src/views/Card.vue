<script setup>
import { ref, computed, watch, watchEffect, nextTick } from "vue";
import { message } from 'ant-design-vue';
import { getWeightByStr, aligns, sizes, sizeModifyMap, SaveType, allSkills, AbilityNameMap, LocalStorage  } from '../core'
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
const customClass = ref(new LocalStorage('customClass'))

function safeGetClass(c) {
    if (!c.name) return null
    const level = c.level
    if (!(c instanceof CharacterClass)) {
        let cc = customClass.value.data.find(cc => cc.name === c.name)
          || form.value.customClass.find(cc => cc.name === c.name)
        if (cc) {
          c = cc
        } else {
          c = getClassByName(c.name)
        }
    }
    if (!c) {
      message.error('获取职业信息失败！请联系开发者')
    }
    c.level = level
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
      c.skills.forEach(s => {
        if (typeof s !== 'string') s = s.name
        !(s in classSkills.value) && (classSkills.value[s] = true)
      })
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
    return Math.round(500*level*level + 500*level)
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
const totalAc = computed(() => form.value.ac.armor + form.value.DEXTERITY.modify + form.value.ac.other + 10)
const touchAc = computed(() => form.value.DEXTERITY.modify + 10)
const flatFootAc = computed(() => form.value.ac.armor + 10 + form.value.ac.other)
const init = computed(() => form.value.otherInit + form.value.DEXTERITY.modify)
const grab = computed(() => sizeModifyMap[form.value.size] * 4 + form.value.STRENGTH.modify + bab.value + form.value.otherGrab)

watchEffect(() => {
  // 挂入需要的数据
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

  // 挂入职业模版
  const customClass = characterClasses.value.filter(i => i.isCustom)
  if (customClass.length) {
    form.value.customClass = customClass
  }
})
</script>

<template>
    <a-collapse v-model:activeKey="activeKey">
      <a-collapse-panel key="base" header="基础信息">
        <a-form :model="form" layout="inline">
          <a-form-item label="姓名" class="cg-input__base"><a-input v-model:value="form.name"/></a-form-item>
          <a-form-item label="种族" class="cg-input__base"><a-input v-model:value="form.race"/></a-form-item>
          <a-form-item label="体型" class="cg-input__fix">
            <a-select v-model:value="form.size">
              <a-select-option v-for="a in sizes" :key="a.value" :value="a.value">{{a.label}}</a-select-option>
            </a-select>
          </a-form-item>
          <a-form-item label="性别" class="cg-input__base"><a-input v-model:value="form.sex"/></a-form-item>
          <a-form-item label="年龄" class="cg-input__base"><a-input v-model:value="form.age"/></a-form-item>
          <a-form-item label="阵营" class="cg-input__fix">
            <a-select v-model:value="form.align">
              <a-select-option v-for="a in aligns" :key="a.value" :value="a.value">{{a.label}}</a-select-option>
            </a-select>
          </a-form-item>
          <a-form-item label="经验" class="cg-input__base exp"><a-input v-model:value="form.exp"/>/{{levelUpExp}}</a-form-item>
          <a-form-item label="身高"><a-input-number v-model:value="form.height" step="0.1" />尺</a-form-item>
          <a-form-item label="体重"><a-input-number v-model:value="form.selfWeight" />磅</a-form-item>
          <a-form-item label="信仰" class="cg-input__base"><a-input v-model:value="form.religion"/></a-form-item>
          <a-form-item label="语言" class="cg-input__base_long"><a-input v-model:value="form.language"/></a-form-item>
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
            <span class="number__result">{{hitPoint}}</span>=
            <a-input-number v-model:value="form.classHitPoint"></a-input-number>{{
              characterClasses.length
              ? '(' + characterClasses
                .reduce((p,c) => p + `${c.level}d${c.hitDice}+`, '')
                .slice(0, -1) + ')'
              : ''
            }}{{form.CONSTITUTION.modify ? `+${form.CONSTITUTION.modify}*${level}` : ''}}
          </a-form-item>
          <a-form-item label="力量">
            <span class="number__result">{{form.STRENGTH.ability}}</span>=
            <a-input-number v-model:value="form.STRENGTH.base"/>初始值
            + <a-input-number v-model:value="form.STRENGTH.race" />种族调整
            + <a-input-number v-model:value="form.STRENGTH.other"/>其它调整
          </a-form-item>
          <a-form-item label="敏捷">
            <span class="number__result">{{form.DEXTERITY.ability}}</span>=
            <a-input-number v-model:value="form.DEXTERITY.base"/>初始值
            + <a-input-number v-model:value="form.DEXTERITY.race" />种族调整
            + <a-input-number v-model:value="form.DEXTERITY.other"/>其它调整
          </a-form-item>
          <a-form-item label="体质">
            <span class="number__result">{{form.CONSTITUTION.ability}}</span>=
            <a-input-number v-model:value="form.CONSTITUTION.base"/>初始值
            + <a-input-number v-model:value="form.CONSTITUTION.race" />种族调整
            + <a-input-number v-model:value="form.CONSTITUTION.other"/>其它调整
          </a-form-item>
          <a-form-item label="智力">
            <span class="number__result">{{form.INTELLIGENCE.ability}}</span>=
            <a-input-number v-model:value="form.INTELLIGENCE.base"/>初始值
            + <a-input-number v-model:value="form.INTELLIGENCE.race" />种族调整
            + <a-input-number v-model:value="form.INTELLIGENCE.other"/>其它调整
          </a-form-item>
          <a-form-item label="感知">
            <span class="number__result">{{form.WISDOM.ability}}</span>=
            <a-input-number v-model:value="form.WISDOM.base"/>初始值
            + <a-input-number v-model:value="form.WISDOM.race" />种族调整
            + <a-input-number v-model:value="form.WISDOM.other"/>其它调整
          </a-form-item>
          <a-form-item label="魅力">
            <span class="number__result">{{form.CHARISMA.ability}}</span>=
            <a-input-number v-model:value="form.CHARISMA.base"/>初始值
            + <a-input-number v-model:value="form.CHARISMA.race" />种族调整
            + <a-input-number v-model:value="form.CHARISMA.other"/>其它调整
          </a-form-item>
        
          <a-form-item label="bab"><span class="number__result">{{bab}}</span></a-form-item>
          <a-form-item label="ac">
            <span class="number__result">{{totalAc}}</span> = <span class="number__common">10</span>+
              <a-input-number v-model:value="form.ac.armor"></a-input-number>盔甲及盾牌+
              <span class="number__common">{{form.DEXTERITY.modify}}</span>敏捷+
              <a-input-number v-model:value="form.ac.other"></a-input-number>其它
              <br />
            接触：<span class="number__common">{{touchAc}}</span> 措手不及：<span class="number__common">{{flatFootAc}}</span>
          </a-form-item>
          <a-form-item label="先攻">
            <span class="number__result">{{init}}</span>=<span class="number__common">{{form.DEXTERITY.modify}}</span>敏捷
            +<a-input-number v-model:value="form.otherInit"></a-input-number>其它
          </a-form-item>
          <a-form-item label="擒抱">
            <span class="number__result">{{grab}}</span>
            = <span class="number__common">{{bab}}</span>bab
            + <span class="number__common">{{form.STRENGTH.modify}}</span>力量
            + <span class="number__common">{{sizeModifyMap[form.size] * 4}}</span>体型
            + <a-input-number v-model:value="form.otherGrab"></a-input-number>其它
          </a-form-item>
          <a-form-item label="强韧豁免">
            <span class="number__result">{{totalFortSave}}</span>
            = <span class="number__common">{{fortSave}}</span>基础
            + <a-input-number v-model:value="form.otherFortSave"></a-input-number>其它
          </a-form-item>
          <a-form-item label="反射豁免">
            <span class="number__result">{{totalRefSave}}</span>
            = <span class="number__common">{{refSave}}</span>基础
            + <a-input-number v-model:value="form.otherRefSave"></a-input-number>其它</a-form-item>
          <a-form-item label="意志豁免">
            <span class="number__result">{{totalWillSave}}</span>
            = <span class="number__common">{{willSave}}</span>基础
            + <a-input-number v-model:value="form.otherWillSave"></a-input-number>其它</a-form-item>
          <a-form-item label="速度">
            <a-input-number v-model:value="form.speed"></a-input-number>
            奔跑<a-input-number v-model:value="form.runSpeed"></a-input-number>
          </a-form-item>
        </a-form>
      </a-collapse-panel>
      <a-collapse-panel key="attacks" header="攻击">
        <a-form layout="inline" v-for="(a, i) in form.attacks" :key="i">
          <a-form-item class="cg-input__base" label="武器"><a-input placeholder="武器" v-model:value="a.name" /></a-form-item>
          <a-form-item class="cg-input__base" label="攻击检定"><a-input placeholder="攻击检定" v-model:value="a.attackRoll" /></a-form-item>
          <a-form-item class="cg-input__base" label="伤害骰"><a-input placeholder="伤害骰" v-model:value="a.damage" /></a-form-item>
          <a-form-item class="cg-input__base" label="重击"><a-input placeholder="重击" v-model:value="a.critical" /></a-form-item>
          <a-form-item label="射程"><a-input-number v-model:value="a.range" /></a-form-item>
        </a-form>
      </a-collapse-panel>
      <a-collapse-panel key="armors" header="盔甲" class="section__armor">
          <a-form layout="inline" v-for="(a, i) in form.armors" :key="i">
            <a-form-item label="名称"><a-input v-model:value="a.name" style="width: 6rem" /></a-form-item>
            <a-form-item label="盔甲和盾牌加值"><a-input-number v-model:value="a.bonus" /></a-form-item>
            <a-form-item label="最大敏捷加值"><a-input-number v-model:value="a.maxDex" /></a-form-item>
            <a-form-item label="防具检定减值"><a-input-number v-model:value="a.checkPenalty" /></a-form-item>
            <a-form-item label="奥术失败几率"><a-input-number v-model:value="a.arcaneFailure" />%</a-form-item>
            <a-form-item label="速度"><a-input-number v-model:value="a.speed" />尺</a-form-item>
          </a-form>
      </a-collapse-panel>
      <a-collapse-panel class="section__skills" key="skills" header="技能">
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
            <span class="number__result">{{s.getPoint(
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
              <span class="number__common" v-if="form.skills[s.name].point">({{s.name in classSkills && classSkills[s.name]
                  ? form.skills[s.name].point
                  : Math.floor(form.skills[s.name].point / 2)}})</span>
            + <span class="number__common">{{abilityModifiers[s.baseAbility]}}</span>{{AbilityNameMap[s.baseAbility]}}
            + <a-input-number v-model:value="form.skills[s.name].other"></a-input-number>其它
            <span class="number__common">{{s.armor ? `- ${s.armor * form.armorSkillModify}` : ''}}</span>{{s.armor ? '盔甲减值' : '' }}
        </a-form-item>
      </a-collapse-panel>
      <a-collapse-panel key="fates" header="专长">
        <a-form-item class="section-content__item" v-for="(f, i) in form.fates" :key="i">
          <a-input placeholder="专长名" v-model:value="f.name" />
          <a-textarea placeholder="专长描述(非必填)" v-model:value="f.describe"></a-textarea>
        </a-form-item>
      </a-collapse-panel>
      <a-collapse-panel key="traits" header="种族特性与职业能力">
        <a-form-item class="section-content__item" v-for="(t, i) in form.traits" :key="i">
          <a-input placeholder="特性" v-model:value="t.name" />
          <a-textarea placeholder="描述(非必填)" v-model:value="t.describe"></a-textarea>
        </a-form-item>
      </a-collapse-panel>
      <a-collapse-panel key="items" header="物品">
        <a-form layout="inline" v-for="(it, i) in form.items" :key="i">
          <a-form-item label="物品名称"><a-input v-model:value="it.name" /></a-form-item>
          <a-form-item label="数量"><a-input-number v-model:value="it.count" /></a-form-item>
          <a-form-item label="价格"><a-input v-model:value="it.price"></a-input></a-form-item>
          <a-form-item label="重量"><a-input v-model:value="it.weight"></a-input></a-form-item>
          <a-form-item label="备注" style="width:100%"><a-textarea v-model:value="it.remark"></a-textarea></a-form-item>
        </a-form>
        <a-form-item style="margin-top:1rem" :label="p" :key="p" v-for="p in ['pp', 'gp', 'sp', 'cp']">
          <a-input-number :min="0" v-model:value="form[p]"></a-input-number>
        </a-form-item>
        <a-form-item label="货币">
          <span class="number__result">{{form.pp + form.gp + form.sp + form.cp}}</span>枚，
          <span class="number__result">{{(form.pp * 10 + form.gp + form.sp / 10 + form.cp / 100).toFixed(2)}}</span>gp，
          <span class="number__result">{{coinWeight}}</span>磅
        </a-form-item>
        <a-form-item label="负重">
          <span class="number__result">{{weight}}磅, {{weightDetail}}</span><br />
        </a-form-item>
        <a-form-item>
          轻载：<span class="number__common">{{'<' + weightLimit[0]}}</span>
          中载：<span class="number__common">{{'<' + (weightLimit[1] + 1)}}</span>
          重载：<span class="number__common">{{'<' + (weightLimit[2] + 1)}}</span>
        </a-form-item>

      </a-collapse-panel>
      <a-collapse-panel key="spells" header="法术">
        <a-form-item v-for="(f, i) in form.spells" :key="i">
          {{i}}环：<a-textarea v-model:value="f.spell"></a-textarea>
        </a-form-item>
      </a-collapse-panel>
    </a-collapse>
</template>

<style>
.cg-input__base {
  width: 30%
}
.cg-input__base_short {
  width: 20%
}
.cg-input__base_long {
  width: 100%
}
.cg-input__fix {
  width: 15rem
}
.ant-form-inline .ant-form-item {
  margin: 1rem 0;
}
.number__result {
  color: #2E5C6E;
  font-weight: 600;
  font-size: 14px;
}
.number__common {
  color: #3A8FB7;
  font-weight: 600;
  font-size: 14px;
}
#app .ant-input-number {
  width: 4rem;
}
#app .ant-form-item-control-input-content, #app .ant-input, #app .ant-form-item-label > label,
#app .ant-select, #app .ant-btn {
  font-size: 12px;
}
#app .ant-form-item-label > label {
  min-width: 4rem;
  justify-content: right;
}
.exp .ant-form-item-control-input-content {
  display: flex;
  align-items: center;
}
.button-group .ant-btn{
  margin-right: 1rem;
}
#app .section__armor .ant-form-item-label label {
  min-width: 2rem;
}
#app .section__armor .ant-form-inline .ant-form-item {
  margin-right: 0.3rem;
}
#app .section__skills .ant-form-item-label label {
  min-width: 7rem;
}
#app .section-content__item input {
  margin-bottom: 0.5rem;
}
</style>