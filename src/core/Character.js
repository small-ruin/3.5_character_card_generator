import { isObject } from '@vue/shared'
import { Abilities, alignMap, sizeMap, canUseUntrainedSkills, allSkillsMap } from '.'
import { allSkills } from './Class'

class Ability {
    constructor(name) {
        this.name = name
    }
    base = 10
    race = 0
    other = 0

    get ability() {
        return this.base + this.race + this.other
    }

    get modify() {
        return Math.floor((this.ability - 10) / 2)
    }

    print() {
        return {
            name: this.name,
            base: this.base,
            race: this.race,
            other: this.other,
            ability: this.ability,
            modify: this.modify
        }
    }

    inject({ base, race, other }) {
        this.base = base
        this.race = race
        this.other = other
    }
}
export default class Character {
    race = null
    align = null
    size = 'medium'
    level = 0
    classHitPoint = 0
    height = 5
    selfWeight = 100
    STRENGTH = new Ability(Abilities.STR)
    DEXTERITY = new Ability(Abilities.DEX)
    CONSTITUTION = new Ability(Abilities.CON)
    INTELLIGENCE = new Ability(Abilities.INT)
    WISDOM = new Ability(Abilities.WIS)
    CHARISMA = new Ability(Abilities.CHA)
    skillPoints = 0
    raceSkillPoint = 0
    usedSkillPoints = 0
    levelUpExp = 0
    weightLimit = []
    coinWeight = 0
    weight = 0
    weightDetail = '轻载'
    skills = {}
    classSkills = {}
    armorSkillModify = 0
    class = [{ level: 1 }]
    customClass = []
    fates = [{}]
    items = [{}]
    spells = [{}]
    pp = 0
    gp = 0
    sp = 0
    cp = 0
    exp = 0
    hitPoint = 0
    fortSave = 0
    otherFortSave = 0
    refSave = 0
    otherRefSave = 0
    willSave = 0
    otherWillSave = 0
    bab = 0
    ac = {
        armor: 0,
        other: 0,
    }
    attacks = [{}]
    armors = [{}]
    traits = [{}]
    init = 0
    otherInit = 0
    grab = 0
    otherGrab = 0
    speed = 30
    runSpeed = 120
    constructor() {
        allSkills.forEach(s => this.skills[s.name] = {
            point: 0,
            other: 0
        })
    }
    set(key, value) {
        this[key] = value
    }
    print() {
        const rst = Object.assign({}, this)
        const {
             align, size, traits, fates, skills,
            classSkills, abilityModifiers, armorSkillModify,
            items, weightLimit, attacks, armors, spells,
        } = rst
        if (align) {
            rst.align = alignMap[align]
        }
        if (size) {
            rst.size = sizeMap[size]
        }
        rst.fates = fates.filter(i => i.name || i.describe)
        rst.traits = traits.filter(i => i.name || i.describe)
        rst.attacks = attacks.filter(i => i.name || i.describe)
        rst.armors = armors.filter(i => i.name || i.describe)
        rst.class = rst.class.filter(i => i.name)
        rst.class = rst.class
            .map((c) => `${c.name}*${c.level}`)
            .join(' | ')
        rst.items = items.filter(i => i.name)
        rst.magicItems = items.filter(i => i.remark)
        rst.skills = Object.keys(skills).map(s => {
            const i = allSkillsMap[s]
            const isClassSkill = s in (classSkills || {})

            return {
                name: s,
                ...skills[s],
                isClassSkill: isClassSkill ? '√' : '',
                canUseUntrained: i.canUseUntrained ? '' : '*',
                modify: this[
                    allSkillsMap[s].baseAbility
                ]?.modify,
                total: i.getPoint(abilityModifiers || {}, skills[s], isClassSkill, armorSkillModify)
            }
        })
        rst.weightLimit = [weightLimit[0], weightLimit[1]+1, weightLimit[2]+1]

        rst.spells = spells.filter(s => s.spell).map((sp, i) => ({name: i + '环', spell: sp.spell}))

        Object.values(Abilities).forEach(n => {
            rst[n] = rst[n].print()
        })

        // console.log(rst)
        return rst
    }
    import(o) {
        Object.values(Abilities).forEach(n => {
            const origin = o[n]
            o[n] = new Ability(n)
            o[n].inject(origin)
        })
        function deepClone(origin, n) {
            Object.keys(n).forEach(k => {
                if (isObject(n[k]) && origin[k]) {
                    deepClone(origin[k], n[k])
                } else {
                    origin[k] = n[k]
                }
            })
        }
        deepClone(this, o)
    }
}