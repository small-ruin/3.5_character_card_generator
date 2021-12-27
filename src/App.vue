<script setup>
import { ref, computed } from '@vue/reactivity'
import Card from './views/Card.vue'
import PC from './core/Character'
import T from './core/template/index.js'
import LZUTF8 from 'lzutf8';
import { message } from 'ant-design-vue';


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
{% for a in attacks %}{{a.name}} 攻击：{{a.attackRoll}} 伤害：{{a.damage}} 重击：{{a.critical}} 射程：{{a.range}}

{% endfor %}
****************************************************************************
专长：
{% for fate in fates %}{{fate.name}}
{{fate.describe}}

{% endfor %}
***************************************************************************
盔甲：
{% for a in armors %}{{a.name}} 加值：{{a.bonus}}, 最大敏捷：{{a.maxDex}}, 防具减值：{{a.checkPenalty}}, 奥败：{{a.arcaneFailure}}, 速度：{{a.speed}}
{% endfor %}
****************************************************************************
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
{% if spells.length %}
***************************************************************************
法术：
{% for i in spells %}{{i.name}}：{{i.spell}}

{% endfor %}
***************************************************************************
{% endif %}
`
let t = ref(new T(template))

const card = computed(() => t.value && t.value.render(pc.value.print()))

let history = ref([])
try {
  history.value = JSON.parse(localStorage.getItem('history')) || []
} catch(e) {
  console.log('读取历史信息失败！')
}
function deleteHistory(i) {
  history.value.splice(i, 1)
  saveHistory()
}
function saveHistory() {
  localStorage.setItem('history', JSON.stringify(history.value))
}
function addHistory(value) {
  history.value.push(value)
  saveHistory()
}

const fingerprint = computed(() => LZUTF8.compress(
      new TextEncoder('utf-8').encode(JSON.stringify(pc.value), 'utf8'),
      {outputEncoding: 'Base64'}
  ))

function handleCreate() {
  const blob = new Blob(
    [
      t.value.render(pc.value.print()),
      '\n-------- 指纹 --------\n',
      fingerprint.value
    ],
    { type: "text/plain;charset=utf-8" }
  )
  const a = document.createElement('a')
  a.href = URL.createObjectURL(blob);
  a.download = pc.value.name + '.txt';

  try {
    addHistory(pc.value)
  } catch(e) {
    message.warn('储存失败!')
  }

  a.click()
}

const importDialogVisible = ref(false)
const historyDialogVisible = ref(false)

const importFingerprint = ref('')
function importCard(fingerprint) {
  const data = LZUTF8.decompress(
      importFingerprint.value,
      {inputEncoding: 'Base64'}
  )

  pc.value.import(JSON.parse(data))

  console.log(data)
}
</script>

<template>
  <div>
    <a-button @click="handleCreate">生成人物卡</a-button>
    <a-button @click="() => importDialogVisible=true">从指纹导入人物卡</a-button>
    <a-button @click="() => historyDialogVisible=true">历史人物卡</a-button>
  </div>
  <div class="wrapper">
    <div>
      <card v-model="pc"></card>
    </div>
    <pre>
{{ card }}
-------- 指纹 --------
{{ fingerprint }}
    </pre>
  </div>
  <div><a-button @click="handleCreate">生成人物卡</a-button></div>
  <a-modal
    v-model:visible="importDialogVisible"
    title="从指纹导入"
    @ok="importCard"
  >
    <a-textarea v-model:value="importFingerprint"></a-textarea>
  </a-modal>
  <a-modal
    v-model:visible="historyDialogVisible"
    title="历史人物卡"
    @ok="() => historyDialogVisible = false"
  >
    <div>最多保存20张。一旦清除游览器缓存便会清空</div>
    <div v-if="!history.length">还没有创建人物卡</div>
    <div v-for="(c, i) in history" :key="i">
      {{c.name}}
      <a-button size="small" @click="() => pc.import(c)">恢复</a-button>
      <a-popconfirm
        title="确认删除吗？"
        ok-text="是"
        cancel-text="否"
        @confirm="() => deleteHistory(i)"
      >
        <a-button size="small" danger>删除</a-button>
      </a-popconfirm>
    </div>
  </a-modal>
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
pre {
  max-width: 50%;
  white-space: pre-wrap;
  word-wrap: break-word;
}
</style>
