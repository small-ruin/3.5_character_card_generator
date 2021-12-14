export class Character {
    hitPoint = 0
    fortSave = 0
    refSave = 0
    willSave = 0
    bab = 0
    attacks = []
    skills = {
        Appraise,
        Balance,
        Bluff,
        Climb,
        Concentration,
        Craft,
        DecipherScript,
        Diplomacy,
        DisableDevice,
        Disguise,
        EscapeArtist,
        Forgery,
        GatherInformation,
        HandleAnimal,
        Heal,
        Hide,
        Intimidate,
        Jump,
        ArcanaKnowledge ,
        ArchitectureKnowledge ,
        DungeoneeringKnowledge ,
        GeographyKnowledge ,
        HistoryKnowledge ,
        LocalKnowledge ,
        NatureKnowledge ,
        RoyalKnowledge ,
        ReligionKnowledge ,
        PlaneKnowledge ,
        Listen,
        MoveSilently,
        OpenLock,
        Perform,
        Profession,
        Ride,
        Search,
        SenseMotive,
        SleightOfHand,
        SpeakLanguage,
        Spellcraft,
        Spot,
        Survival,
        Swim,
        Tumble,
        UseMagicDevice,
        UseRope,
    }
    constructor() {}
    set(key, value) {
        this.key = value
    }
}