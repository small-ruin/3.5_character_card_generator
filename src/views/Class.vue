<script setup>
import { computed, ref } from "@vue/reactivity";
import Class, { allSkills, BabType, SaveType, classes } from '../core/Class'

const addClassDialogVisible = ref(false)
const currentAddingClass = ref({})
const customClass = ref([])
const characterClasses = ref([{}])
const classOptions = computed(
    () => Object.values(classes)
        .map(cl => ({label: cl.name, value: cl.name}))
        .concat(customClass.value.map(i => ({label: i.name, value: i.name})))
)

function addClass() {
    const newClass = new Class(currentAddingClass.value.name, currentAddingClass.value)
    customClass.value.push(newClass)
    currentAddingClass.value = {}
    addClassDialogVisible.value = false
}
</script>

<template>
    <a-button @click="() => addClassDialogVisible = true">添加职业模版</a-button>
    <a-button @click="() => characterClasses.push({})">添加人物职业</a-button>

    <div v-for="(c, i) in characterClasses" :key="i">
        <a-form-item>
            <a-select v-model:value="c.name" show-search :options="classOptions">
            </a-select>
        </a-form-item>
        <a-form-item label="职业等级">
            <a-input-number v-model:value="c.level"></a-input-number>
        </a-form-item>
    </div>

    <a-modal
        v-model:visible="addClassDialogVisible"
        title="新增职业模版"
        @ok="addClass">
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
</template>