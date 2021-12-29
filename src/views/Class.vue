<script setup>
import { computed, ref } from "@vue/reactivity";
import { message } from "ant-design-vue";
import Class, { allSkills, BabType, SaveType, classes, allSkillsMap } from '../core/Class'
import { useModelWrapper } from '../hooks/useModelWrapper'

const props = defineProps({
    modelValue: Object,
    customClass: Object,
})
const emit = defineEmits([
    'update:modelValue',
    'addClass',
    'select'
])

const customClass = props.customClass

const createClassDialogVisible = ref(false)
const classTemplateDialogVisible = ref(false)
const classImportDialogVisible = ref(false)
const currentAddingClass = ref({})
const currentImportClass = ref('')

const classOptions = computed(
    () => Object.values(classes)
        .map(cl => ({label: cl.name, value: cl.name}))
        .concat(customClass ? customClass.data.map(i => ({label: i.name, value: i.name})) : [])
)

useModelWrapper(props, emit)

function createClass() {
    currentAddingClass.value.isCustom = true
    const newClass = new Class(currentAddingClass.value.name, currentAddingClass.value)
    customClass.add(newClass)

    currentAddingClass.value = { level: 1 }
    createClassDialogVisible.value = false
}
function addClass() {
    props.modelValue.push({ level: 1 })
    emit('addClass')
}
function exportClass() {
    try {
        const blob = new Blob(
            [JSON.stringify(customClass.data)],
            { type: "text/plain;charset=utf-8" }
        )
        const a = document.createElement('a')
        a.href = URL.createObjectURL(blob);
        a.download = '职业模版.txt';
        a.click()
    } catch(e) {
        message.error('导出失败！')
        console.log(e, JSON.stringify(customClass.data))
    }
}
function importClass() {
    try {
        const data = JSON.parse(currentImportClass.value)
        const alreadyHaveClass = customClass.data.map(c => c.name)
        data.forEach(c => {
            if (!alreadyHaveClass.includes(c.name))
                customClass.add(c)
        })
        classImportDialogVisible.value = false
    } catch(e) {
        message.error('导入失败！')
        console.log(e, currentImportClass.value)
    }
}
</script>

<template>
    <div class="button-group">
        <a-button type="primary" @click="addClass">添加人物职业</a-button>
        <a-button @click="() => createClassDialogVisible = true">添加职业模版</a-button>
        <a-button @click="() => classTemplateDialogVisible = true">查看已有职业模版</a-button>
        <a-button @click="() => exportClass()">导出职业模版</a-button>
        <a-button @click="() => classImportDialogVisible = true">导入职业模版</a-button>
    </div>

    <div v-for="(c, i) in props.modelValue" :key="i">
        <a-form layout="inline">
            <a-form-item class="cg-input__fix">
                <a-select @change="emit('select')" v-model:value="c.name" show-search :options="classOptions">
                </a-select>
            </a-form-item>
            <a-form-item label="职业等级" class="cg-input__base_short">
                <a-input-number v-model:value="c.level"></a-input-number>
            </a-form-item>
            <a-form-item>
                <a-button @click="props.modelValue.splice(i, 1)">删除</a-button>
            </a-form-item>
        </a-form>
    </div>

    <a-modal
        v-model:visible="createClassDialogVisible"
        title="新增职业模版"
        @ok="createClass">
        <a-form :model="currentAddingClass">
            <a-form-item label="名称"><a-input v-model:value="currentAddingClass.name"/></a-form-item>
            <a-form-item label="生命骰面数">
                <a-select
                    v-model:value="currentAddingClass.hitDice"
                    :options="[
                        { label: 'd12', value: 12 },
                        { label: 'd10', value: 10 },
                        { label: 'd8', value: 8 },
                        { label: 'd6', value: 6 },
                        { label: 'd4', value: 4 },
                    ]"
                ></a-select>
            </a-form-item>
            <a-form-item label="bab">
                <a-select
                    v-model:value="currentAddingClass.bab"
                    :options="[
                            { label: '满Bab', value: BabType.STRONG },
                            { label: '0.75Bab', value: BabType.MIDDLE },
                            { label: '0.5Bab', value: BabType.WEAK },
                    ]">
                </a-select>
            </a-form-item>
            <a-form-item v-for="save in [
                    ['强韧豁免', 'fortSave'],
                    ['反射豁免', 'refSave'],
                    ['意志豁免', 'willSave'],
                ]"
                :key="save[1]"
                :label="save[0]">
                <a-select
                    v-model:value="currentAddingClass[save[1]]"
                    :options="[
                            { label: '强豁免', value: SaveType.STRONG },
                            { label: '弱豁免', value: SaveType.WEAK },
                        ]"
                >
                </a-select>
            </a-form-item>
            <a-form-item label="本职技能">
                <a-checkbox-group
                    v-model:value="currentAddingClass.skills"
                    :options="allSkills.map(s => ({ label: s.name, value: s.name }))">
                </a-checkbox-group>
            </a-form-item>
            <a-form-item label="每级技能点数（不含智力加值）">
                <a-input-number v-model:value="currentAddingClass.skillPointsEachLevel"></a-input-number>
            </a-form-item>
        </a-form>
    </a-modal>
    <a-modal
        v-model:visible="classTemplateDialogVisible"
        title="职业模版"
        @ok="classTemplateDialogVisible = false">
        <div>清除游览器缓存也会清空职业模版，记得导出。</div>
        <div style="margin-bottom: 1rem" v-if="!customClass.data.length">没有职业模版</div>
        <div class="history-row" v-for="(c, i) in customClass.data" :key="i">
            {{c.name}}
            <div class="button-group">
                <a-popconfirm
                    title="确认删除吗？"
                    ok-text="是"
                    cancel-text="否"
                    @confirm="() => customClass.delete(i)"
                >
                    <a-button size="small" danger>删除</a-button>
                </a-popconfirm>
            </div>
        </div>
    </a-modal>
    <a-modal
        v-model:visible="classImportDialogVisible"
        title="导入职业模版"
        @ok="importClass"
        @cancel="currentImportClass = ''"
    >
        <a-textarea v-model:value="currentImportClass"></a-textarea>
    </a-modal>
</template>