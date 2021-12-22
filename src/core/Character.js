import { alignMap, sizeMap } from '.'
import { allSkills } from './Class'

export default class Character {
    race = null
    align = null
    size = 'medium'
    level = 0
    height = 0
    selfWeight = 0
    STRENGTH = 10
    DEXTERITY = 10
    CONSTITUTION = 10
    INTELLIGENCE = 10
    WISDOM = 10
    CHARISMA = 10
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
    attacks = []
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
        rst.level = rst.class.reduce((p, c) => p + c.level, 0)
        rst.class = rst.class
            .map((c) => `${c.name}*${c.level}`)
            .join(' | ')
        return rst
    }
}