import { AbilityNames, alignMap, sizeMap } from '.'
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
    height = 0
    selfWeight = 0
    STRENGTH = new Ability('STRENGTH')
    DEXTERITY = new Ability('DEXTERITY')
    CONSTITUTION = new Ability('CONSTITUTION')
    INTELLIGENCE = new Ability('INTELLIGENCE')
    WISDOM = new Ability('WISDOM')
    CHARISMA = new Ability('CHARISMA')
    skillPoints = 0
    raceSkillPoint = 0
    usedSkillPoints = 0
    levelUpExp = 0
    weightLimit = 0
    coinWeight = 0
    weight = 0
    weightDetail = '轻载'
    skills = {}
    class = [{ level: 1 }]
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
    refSave = 0
    willSave = 0
    bab = 0
    ac = {
        armor: 0,
        dex: 0,
        other: 0,
    }
    attacks = []
    init = 0
    otherInit = 0
    otherGrab = 0
    constructor() {
        allSkills.forEach(s => this.skills[s.name] = 0)
    }
    set(key, value) {
        this[key] = value
    }
    print() {
        const rst = Object.assign({}, this)
        if (rst.align) {
            rst.align = alignMap[rst.align]
        }
        if (rst.size) {
            rst.size = sizeMap[rst.size]
        }
        rst.class = rst.class.filter(i => i.name)
        rst.class = rst.class
            .map((c) => `${c.name}*${c.level}`)
            .join(' | ')
        
        Object.values(AbilityNames).forEach(n => {
            rst[n] = rst[n].print()
        })

        console.log(rst)
        return rst
    }
}