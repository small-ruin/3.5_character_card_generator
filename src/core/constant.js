function gMap(list) {
    const r = {}
    list.forEach(l => r[l.value] = l.label)
    return r
}
export const aligns = [
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
export const alignMap = gMap(aligns)

export const sizes = [
    { value: 'fine', label: '超微型'},
    { value: 'diminutive', label: '微型'},
    { value: 'tiny', label: '超小型'},
    { value: 'small', label: '小型'},
    { value: 'medium', label: '中型'},
    { value: 'large', label: '大型'},
    { value: 'huge', label: '超大型'},
    { value: 'gargantuan', label: '巨型'},
    { value: 'colossal', label: '超巨型'},
]
export const sizeMap = gMap(sizes)
export const sizeModifyMap = {
    fine: -4,
    diminutive: -3,
    tiny: -2,
    small: -1,
    medium: 0,
    large: 1,
    huge: 2,
    gargantuan: 3,
    colossal: 4,
}

export const Abilities = {
    STR: 'STRENGTH',
    DEX: 'DEXTERITY',
    CON: 'CONSTITUTION',
    INT: 'INTELLIGENCE',
    WIS: 'WISDOM',
    CHA: 'CHARISMA'
}

export const AbilityNameMap = {
    [Abilities.STR]: '力量',
    [Abilities.DEX]: '敏捷',
    [Abilities.CON]: '体质',
    [Abilities.INT]: '智力',
    [Abilities.WIS]: '感知',
    [Abilities.CHA]: '魅力'
}