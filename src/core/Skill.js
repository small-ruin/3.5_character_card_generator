
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
}




