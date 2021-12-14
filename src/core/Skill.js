
export class Skill {
    constructor(name, baseAbility, untrained, {
        sub,
        subs,
        armor = false,
    } = {}) {
        this.name = name
        this.baseAbility = baseAbility
        this.canUseUntrained = untrained
        this.sub = sub
        this.subs = subs
        this.armor = armor
    }

    getPoint(abilities, point, isClassSkill, armor=0) {
        if (!this.canUseUntrained && point === 0) {
            return '-'
        }
        if (!isClassSkill) {
            point = Math.floor(point / 2)
        }
        point += abilities[this.baseAbility]
        if (armor) {
            point -= armor * this.armor
        }

        return point
    }
}




