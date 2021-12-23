<script setup>
import { ref, computed } from '@vue/reactivity'
import Card from './views/Card.vue'
import PC from './core/Character'
import T from './core/template/index.js'

const pc = ref(new PC())
const template = `
{{name}}
****************************************************************************
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
HP {{hitPoint}}
防御等级 {{totalAc}}，接触 {{touchAc}}，措手不及 {{flatFootAc}}

先攻调整      {{init}}
基本攻击加值  {{bab}}
擒抱          {{grab}}

平常速度{{speed}}尺 奔跑速度{{runSpeed}}尺
****************************************************************************
强韧豁免    {{totalFortSave}} （{{CONSTITUTION.modify}}体质修正+{{fortSave}}职业+{{otherFortSave}}其它）

反射豁免    {{totalRefSave}} （{{DEXTERITY.modify}}敏捷修正+{{refSave}}职业+{{otherRefSave}}其它）

意志豁免    {{totalWillSave}} （{{WISDOM.modify}}感知修正+{{willSave}}职业+{{otherWIllSave}}其它）
****************************************************************************
攻击：

歌利亚大型巨锤 攻击：d20+6+3+1 伤害：3d6+9 重击：X4

歌利亚大型巨锤猛力 攻击：d20+6+1 伤害：3d6+9+6 重击：X4

戟 攻击：d20+6+3+1 伤害：2d6+9 重击：X3

戟猛力 攻击：d20+6+1 伤害：2d6+9+6 重击：X3
****************************************************************************
专长：
{% for fate in fates %}{{fate.name}}
{{fate.describe}}

{% endfor %}
***************************************************************************
种族特性与职业能力：
{% for t in traits %}{{t.name}}
{{t.describe}}

{% endfor %}
***************************************************************************
技能点：{{skillPoints}}
技能  分配点数  最终值{% for s in skills %}
{{s.isClassSkill}}{{s.name}}{{s.canUseUntrained}}  （{{s.point}}）      {{s.total}}{% endfor %}

* 非受训技能
√ 本职技能
***************************************************************************
随身物品：
{% for i in items %}
{{i.name}}*{{i.count}} {{i.price}}gp {{i.weight}}磅
{% endfor %}

货币：
{{pp}}pp {{gp}}gp {{sp}}sp {{cp}}cp, 货币总重：{{coinWeight}}磅

负重：{{weight}}磅, {{weightDetail}} 
轻载：< {{weightLimit.0}} 中载 < {{weightLimit.1}} 重载 < {{weightLimit.2}}

特殊物品：
{% for mi in magicItems %}{{mi.name}}
{{mi.remark}}

{% endfor %}
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
