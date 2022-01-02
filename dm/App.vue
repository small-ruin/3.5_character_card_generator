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
const damageToTake = ref(0)
const healToTake = ref(0)
const ndToTake = ref(0)
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
    if (!pc) return
    pcs.value.push(pc)
    localStorage.setItem('pc', JSON.stringify(pcs.value))
}
function deletePc(i) {
    pcs.value.splice(i, 1)
    localStorage.setItem('pc', JSON.stringify(pcs.value))
}
function addMonster(m) {
    if (!m) return
    m.monster = true
    monsters.value.push(m)
    localStorage.setItem('monster', JSON.stringify(monster.value))
}
function deleteMonster(i) {
    monsters.value.splice(i, 1)
    localStorage.setItem('monster', JSON.stringify(monster.value))
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
        hp: pc.hitPoint,
        temHp: 0,
        nd: 0,
        pc: null,
        conditions: [],
        monster: !!pc.monster,
        checked: false,
        origin: pc,
    }
}
function addMem() {
    const toAddPcs = pcs.value.filter(p => p.checked).map(formatPc)
    const toAddMs = monsters.value.filter(m => m.checked).map(formatPc)
    const memNames = mems.value.map(m => m.name)

    const multiple = toAddMs.filter(mon => memNames.includes(mon.name))
    multiple.forEach(mon => {
        let n = 0;
        const originName = mon.name
        while(memNames.includes(mon.name)) {
            mon.name = originName + ++n
        }
        memNames.push(mon.name)
    })
    mems.value = [
        ...mems.value,
        ...toAddPcs,
        ...toAddMs
    ]
}

function gAddCommand(m, isUpdate = false) {
    let rst = `sb member ${isUpdate ? 'set' : 'add'} ${m.name} -h${m.hp}`
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

function gBattleCommand() {
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

    gCommand(rst)
}

function takeDamage(m) {
    gCommand(`sb member damage ${m.name} ${damageToTake.value}`)
}
function takeHeal(m) {
    gCommand(`sb member heal ${m.name} ${damageToTake.value}`)
}
function takeNd(m) {
    gCommand(`sb member nd ${m.name} ${damageToTake.value}`)
}
function updateMember(m) {
    gCommand(gAddCommand(m, true))
}
function updateCondition(m, c) {
    gCommand(`sb member condition ${m.name} -c ${c.name} -r ${c.round}`)
}
function deleteMember(m, i) {
    this.mems.splice(i, 1)
    gCommand(`sb member delete ${m.name}`)
}
function gCommand(cmd) {
    if (Array.isArray(cmd)) {
        cmd = cmd.join('\n')
    }
    command.value = cmd
    commandHistory.value.push(cmd)
}
function exchangeSwitch() {
    const [one, two] = mems.value.filter(i => i.checked)
    gCommand([`sb init switch ${one.name} ${two.name}`,
        `sb init switch ${two.name} ${one.name}`])
}
function delay() {
    const [one, two] = mems.value.filter(i => i.checked)
    gCommand([`sb member delay ${one.name} ${two.name}`,
        `sb member delay ${two.name} ${one.name}`])
}

function allCheck() {
    pcs.value.forEach(i => i.checked = true)
    monsters.value.forEach(i => i.checked = true)
}
function allNotCheck() {
    pcs.value.forEach(i => i.checked = false)
    monsters.value.forEach(i => i.checked = false)
}
function copy(t) {
    navigator.clipboard.writeText(t)
}

</script>
<template>
<div class="board">
    <section class="pool">
        <a-textarea v-model:value="currentPc"></a-textarea>
        <div class="btn-group">
            <a-button @click="createPc">导入人物卡</a-button>
            <a-button @click="createMonster">导入怪物卡</a-button>
        </div>
        <div class="pc">
            人物卡池：
            <div v-for="(pc, i) in pcs" :key="pc.name">
                <a-checkbox v-model:checked="pc.checked">{{pc.name}}</a-checkbox>
                <a-button @click="deletePc(i)" size="small">删除</a-button>
            </div>
        </div>
        <div class="monster">
            怪物池：
            <div v-for="(m, i) in monsters" :key="m.name">
                <a-checkbox v-model:checked="m.checked">{{m.name}}</a-checkbox>
                <a-button @click="deleteMonster(i)" size="small">删除</a-button>
            </div>
        </div>
        <div class="btn-group">
            <a-button @click="addMem" type="primary">参战</a-button>
            <a-button @click="allCheck">全选</a-button>
            <a-button @click="allNotCheck">全不选</a-button>
        </div>
        <div>
            其他可能会用到的指令：
            <pre @click="() => copy('sb member list')">sb member list -a</pre>
            <pre @click="() => copy('sb init list -a')">sb init list -a</pre>
            <pre @click="() => copy('sb on')">sb on</pre>
            <pre @click="() => copy('sb next')">sb next</pre>
            <pre @click="() => copy('sb pause')">sb pause</pre>
            <pre @click="() => copy('sb end')">sb end</pre>
        </div>
    </section>
    <section class="run">
        <div class="mem">
            <a-form>
                <a-form-item v-for="(m, i) in mems" :key="i">
                    <div class="label"><b>{{m.name}}</b> <a-checkbox v-model:checked="m.checked" /></div>
                    血量: <a-input-number v-model:value="m.hp"></a-input-number>
                    先攻: <a-input-number v-model:value="m.init"></a-input-number> 
                    临时生命: <a-input-number v-model:value="m.temHp"></a-input-number> 
                    淤伤: <a-input-number v-model:value="m.nd"></a-input-number> 
                    pc: <a-input style="width:200px" v-model:value="m.pc"></a-input>
                    <a-button style="margin-left: 10px" @click="m.conditions.push({name: '', round: 0})" type="primary">增加状态</a-button>
                    <div class="damage" style="margin: 10px 0">
                        生成指令：
                        <a-input-number v-model:value="damageToTake" /><a-button @click="() => takeDamage(m)">受伤</a-button>
                        <a-input-number v-model:value="healToTake" /><a-button @click="() => takeHeal(m)">治疗</a-button>
                        <a-input-number v-model:value="ndToTake" /><a-button @click="() => takeNd(m)">受淤伤</a-button>
                        <a-button @click="() => updateMember(m)">更新</a-button>
                        <a-button danger @click="() => deleteMember(m, i)">删除</a-button>
                    </div>
                    <div style="margin: 10px 0" v-for="(c, i) in m.conditions" :key="i">
                        状态: <a-input style="width:200px" v-model:value="c.name"></a-input>
                        轮数: <a-input-number v-model:value="c.round"/>
                        <a-button type="primary" style="margin-left: 10px" @click="m.conditions.splice(i, 1)">-</a-button>
                        <a-button type="primary" style="margin-left: 10px" @click="() => updateCondition(m, c)">更新</a-button>
                    </div>
                </a-form-item>
            </a-form>
        </div>
        <div class="commander">
            <a-button @click="gBattleCommand">生成命令</a-button>
            <a-button @click="exchangeSwitch">交换先攻</a-button>
            <a-button @click="delay">延迟</a-button>
            <div>
                <a-checkbox v-model:checked="gOption.autoJump">自动跳过回合</a-checkbox>
                <a-checkbox v-model:checked="gOption.autoReminder">自动提醒</a-checkbox>
                <a-checkbox v-model:checked="gOption.autoAt">自动@</a-checkbox>
                <a-input-number v-model:value="gOption.autoJumpTime"></a-input-number>
            </div>
            <pre @click="() => copy(command)">{{command}}</pre>
        </div>
    </section>
    <section class="result">
        <div class="timer">
            {{formatTime}}
        </div>
        <a-button @click="leftTime = 5*60">下回合</a-button>
        <div class="log">
            <pre @click="() => copy(c)" v-for="(c, i) in commandHistory" :key="i">{{c}}</pre>
        </div>
    </section>
</div>
</template>

<style>
.board {
    display: flex;
    padding: 10px;
}
.board > section {
    min-width: 30vw;
    min-height: calc(100vh - 20px);
    display: flex;
    flex-direction: column;
    padding: 0 20px;
    border-left: 1px solid #eee;
}
.board > section > div {
    margin-bottom: 20px;
}
.btn-group {
    margin: 10px 0;
}
.ant-btn {
    margin-right: 10px
}
.board textarea.ant-input {
    width: 30vw;
    height: 30vh;
}
.timer {
    font-size: 10rem;
}
.log {
    margin-top: 30px;
    max-height: 600px;
    overflow: auto;
}
.label {
    margin-bottom: 10px;
}
.damage button {
    margin-left: 2px;
}
</style>