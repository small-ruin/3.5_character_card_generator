<script setup>
import { computed, ref } from "@vue/reactivity";
import PC from '../src/core/Character'
import LZUTF8 from 'lzutf8';
import {message} from 'ant-design-vue'

const pcs = ref(loadPcFromLS())
const monsters = ref(loadMonsterFromLS())
const currentPc = ref('')
const mems = ref([])
const checkedPcs = ref([])
const checkedMonsters = ref([])
const gOption = ref({
    autoReminder: true,
    autoAt: true,
    autoJump: true,
    autoJumpTime: 5,
    silent: true
})
const command = ref('')
const commandHistory = ref([])
const leftTime = ref(5 * 60)
const timer = setInterval(() => {
   leftTime.value--
}, 1000)
const formatTime = computed(() => {
    const m = Math.floor(leftTime.value / 60 % 60)
    const s = Math.round(leftTime.value % 60)
    if (m === 0 && s === 0)
        leftTime.value = 5 * 60
    return m + ': ' + s
})

function loadPcFromLS () {
    return JSON.parse(localStorage.getItem('pc')) || []
}
function loadMonsterFromLS() {
    return JSON.parse(localStorage.getItem('monster')) || []
}
function addPc(pc) {
    pcs.value.push(pc)
    const hpcs = loadPcFromLS()
    hpcs.push(pc)
    hps = hps.filter(h => h)
    localStorage.setItem('pc', JSON.stringify(hpcs))
}
function addMonster(m) {
    m.monster = true
    monsters.value.push(m)
    const hms = loadMonsterFromLS()
    hms.push(m)
    hms = hms.filter(h => h)
    localStorage.setItem('monster', JSON.stringify(hms))
}

function importCard() {
  try {
    const data = LZUTF8.decompress(
        currentPc.value.trim(),
        {inputEncoding: 'Base64'}
    )

    const pc = new PC()
    pc.import(JSON.parse(data))
    return pc
  } catch(e) {
    message.error('导入出错!该指纹无效')
    console.log(e, currentPc.value)
  }
}
function createMonster() {
    addMonster(importCard())
}
function createPc() {
    addPc(importCard())
}
function formatPc(pc) {
    return {
        name: pc.name,
        init: 0,
        hp: pc.hp,
        temHp: 0,
        nd: 0,
        pc: null,
        conditions: [],
        monster: !!pc.monster
    }
}
function addMem() {
    const toAddPcs = pcs.value.filter(p => p.checked).map(formatPc)
    const toAddMs = monsters.value.filter(m => m.checked).map(formatPc)
    mems.value = [
        ...mems.value,
        ...toAddPcs,
        ...toAddMs
    ]
    console.log('mems:', mems)
}

function log(e) {
    console.log(e)
}

function gAddCommand(m) {
    let rst = `sb member add ${m.name} -h${m.hp}`
    if (Number.isInteger(m.init)) rst += ` -i${m.init}`
    if (m.pc) rst += ` -q${m.pc}`
    if (Number.isInteger(m.temHp) && m.temHp > 0) rst += ` -t${m.temHp}`
    if (gOption.value.silent) rst += ' -s'
    if (m.monster) rst += ' -e'
    rst = [rst]
    if (Number.isInteger(m.nd) && m.nd > 0) rst.push(`sb member nd ${m.name} ${m.nd}`)
    if (m.conditions)
    rst = [...rst, ...m.conditions.map(c => `sb member condition ${m.name} -c ${c.name} -r ${c.round}`)].filter(i => i)
    return rst
}

function gCommand() {
    const { autoReminder, autoAt, autoJump, autoJumpTime } = gOption.value
    let rst =  'sb row \n' + mems.value.reduce((p, c) => p.concat(gAddCommand(c)), []).join('\n')
    rst += '\nsb on'
    if (autoReminder) rst += ' -r'
    else rst += ' -R'

    if (autoJump) rst += ' -j'
    else rst += ' -J'

    if (autoAt) rst += ' -a'
    else rst += ' -A'

    rst += ` -t${autoJumpTime}`

    command.value = rst

    commandHistory.value.push(rst)
}

</script>
<template>
<div class="board">
    <section class="pool">
        <div class="btn-group">
            <a-textarea v-model:value="currentPc"></a-textarea>
            <a-button @click="createPc">导入人物卡</a-button>
            <a-button @click="createMonster">导入怪物卡</a-button>
        </div>
        <div class="pc">
            <div v-for="pc in pcs" :key="pc.name">
                <a-checkbox v-model:checked="pc.checked">{{pc.name}}</a-checkbox>
                <a-button>删除</a-button>
            </div>
        </div>
        <div class="monster">
            <div v-for="m in monsters" :key="m.name">
                <a-checkbox v-model:checked="m.checked">{{m.name}}</a-checkbox>
                <a-button>删除</a-button>
            </div>
        </div>
    </section>
    <section class="run">
        <div class="btn-group">
            <a-button @click="addMem">参战</a-button>
        </div>
        <div class="mem">
            <a-form>
                <a-form-item v-for="(m, i) in mems" :key="i">
                    <a-button @click="m.conditions.push({name: '', round: 0})">增加状态</a-button>
                    <a-input-number v-model:value="m.hp"></a-input-number> 血量
                    <a-input-number v-model:value="m.init"></a-input-number> 先攻
                    <a-input-number v-model:value="m.temHp"></a-input-number> 临时生命
                    <a-input-number v-model:value="m.nd"></a-input-number> 淤伤
                    <a-input v-model:value="m.pc"></a-input> pc
                    <div v-for="(c, i) in m.conditions" :key="i"><a-input v-model:value="c.name"></a-input> 状态 <a-input-number v-model:value="c.round"/> 轮数</div>
                </a-form-item>
            </a-form>
        </div>
        <div class="commander">
            <a-button @click="gCommand">生成命令</a-button>
            <div>
                <a-checkbox v-model:checked="gOption.autoJump">自动跳过回合</a-checkbox>
                <a-checkbox v-model:checked="gOption.autoReminder">自动提醒</a-checkbox>
                <a-checkbox v-model:checked="gOption.autoAt">自动@</a-checkbox>
                <a-input-number v-model:value="gOption.autoJumpTime"></a-input-number>
            </div>
            <pre>{{command}}</pre>
        </div>
    </section>
    <section class="result">
        <a-button @click="leftTime = 5*60">下回合</a-button>
        <div class="timer">
            {{formatTime}}
        </div>
        <div class="log">
            <pre v-for="(c, i) in commandHistory" :key="i">{{c}}</pre>
        </div>
    </section>
</div>
</template>