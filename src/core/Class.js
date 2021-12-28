import { Skill } from './Skill'
import { Abilities } from "."

export const SaveType = {
    STRONG: 'STRONG',
    WEAK: 'WEAK'
}

export const BabType = {
    STRONG: 1,
    MIDDLE: 0.75,
    WEAK: 0.5
}

export default class Class {
    constructor(name, {
        hitDice,
        fortSave,
        refSave,
        willSave,
        bab,
        skills,
        skillPointsEachLevel,
        isCustom = false
    }) {
        this.name = name
        this.hitDice = hitDice,
        this.fortSave = fortSave
        this.refSave = refSave
        this.willSave = willSave
        this.bab = bab
        this.skills = skills
        this.skillPointsEachLevel = skillPointsEachLevel
        this.isCustom = isCustom
    }

    toString() { return this.name }
}

const Appraise = new Skill('估价', Abilities.INT, true)
const Balance = new Skill('平衡', Abilities.DEX, true, { armor: 1 })
const Bluff = new Skill('唬骗', Abilities.CHA, true)
const Climb = new Skill('攀爬', Abilities.STR, true, { armor: 1 })
const Concentration = new Skill('专注', Abilities.CON, true)
const Craft = new Skill('手艺', Abilities.INT, true)
const DecipherScript = new Skill('文件解读', Abilities.INT, false)
const Diplomacy = new Skill('交涉', Abilities.CHA, true)
const DisableDevice = new Skill('解除装置', Abilities.INT, false)
const Disguise = new Skill('易容', Abilities.CHA, true)
const EscapeArtist = new Skill('逃脱术', Abilities.DEX, true, { armor: 1 })
const Forgery = new Skill('伪造文书', Abilities.INT, true)
const GatherInformation = new Skill('搜集信息', Abilities.CHA, true)
const HandleAnimal = new Skill('驯养动物', Abilities.CHA, false)
const Heal = new Skill('医疗', Abilities.WIS, true)
const Hide = new Skill('躲藏', Abilities.DEX, true, { armor: true })
const Intimidate = new Skill('威吓', Abilities.CHA, true)
const Jump = new Skill('跳跃', Abilities.STR, true)
const ArcanaKnowledge = new Skill('知识(神秘)', Abilities.INT, false)
const ArchitectureKnowledge = new Skill('知识(建筑与工程)', Abilities.INT, false)
const DungeoneeringKnowledge = new Skill('知识(地下城)', Abilities.INT, false)
const GeographyKnowledge = new Skill('知识(地理)', Abilities.INT, false)
const HistoryKnowledge = new Skill('知识(历史)', Abilities.INT, false)
const LocalKnowledge = new Skill('知识(地方)', Abilities.INT, false)
const NatureKnowledge = new Skill('知识(自然)', Abilities.INT, false)
const RoyalKnowledge = new Skill('知识(贵族与皇室)', Abilities.INT, false)
const ReligionKnowledge = new Skill('知识(宗教)', Abilities.INT, false)
const PlaneKnowledge = new Skill('知识(位面)', Abilities.INT, false)
const Listen = new Skill('聆听', Abilities.WIS, true)
const MoveSilently = new Skill('潜行', Abilities.DEX, true, { armor: 1 })
const OpenLock = new Skill('开锁', Abilities.DEX, false)
const Perform = new Skill('表演', Abilities.CHA, true)
const Profession = new Skill('专业', Abilities.WIS, false)
const Ride = new Skill('骑术', Abilities.DEX, true)
const Search = new Skill('搜索', Abilities.INT, true)
const SenseMotive = new Skill('察言观色', Abilities.WIS, true)
const SleightOfHand = new Skill('手上功夫', Abilities.DEX, false, { armor: 1 })
const SpeakLanguage = new Skill('语言', null, false)
const Spellcraft = new Skill('辨识法术', Abilities.INT, false)
const Spot = new Skill('侦察', Abilities.WIS, true)
const Survival = new Skill('生存', Abilities.WIS, true)
const Swim = new Skill('游泳', Abilities.STR, true, { armor: 2 })
const Tumble = new Skill('翻滚', Abilities.DEX, false, { armor: 1 })
const UseMagicDevice = new Skill('使用魔法装置', Abilities.CHA, false)
const UseRope = new Skill('绳技', Abilities.DEX, true)

const allKnowledges = [
    ArcanaKnowledge,
    ArchitectureKnowledge,
    DungeoneeringKnowledge,
    GeographyKnowledge,
    HistoryKnowledge,
    LocalKnowledge,
    NatureKnowledge,
    RoyalKnowledge,
    PlaneKnowledge,
    ReligionKnowledge
]

export const allSkills = [
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
    ArcanaKnowledge,
    ArchitectureKnowledge,
    DungeoneeringKnowledge,
    GeographyKnowledge,
    HistoryKnowledge,
    LocalKnowledge,
    NatureKnowledge,
    RoyalKnowledge,
    ReligionKnowledge,
    PlaneKnowledge,
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
    UseRope ,
]

export const canUseUntrainedSkills = allSkills.filter(s => s.canUseUntrained).map(i => i.name)
const allSkillMap = {}
allSkills.forEach(s => allSkillMap[s.name] = s)
export const allSkillsMap = allSkillMap;

export const classes = {
    barbarian: new Class('野蛮人', {
        hitDice: 12,
        fortSave: SaveType.STRONG,
        refSave: SaveType.WEAK,
        willSave: SaveType.WEAK,
        bab: 1,
        skills: [
            Climb, Craft, HandleAnimal, Intimidate, Jump, Listen, Ride, Survival, Swim
        ],
        skillPointsEachLevel: 4
    }),
    bard: new Class('吟游诗人', {
        hitDice: 6,
        fortSave: SaveType.WEAK,
        refSave: SaveType.STRONG,
        willSave: SaveType.STRONG,
        bab: 0.75,
        skills: [
            Appraise, Balance, Bluff, Climb, Concentration, Craft, DecipherScript,
            Diplomacy, Disguise, EscapeArtist, GatherInformation, Hide,
            Jump, Listen, MoveSilently, Perform, Profession,
            SenseMotive, SleightOfHand, SpeakLanguage, Spellcraft,
            Swim, Tumble, UseMagicDevice, ...allKnowledges,
        ],
        skillPointsEachLevel: 6
    }),
    circle: new Class('牧师', {
        hitDice: 8,
        fortSave: SaveType.STRONG,
        refSave: SaveType.WEAK,
        willSave: SaveType.STRONG,
        bab: 0.75,
        skills: [
            Concentration, Craft, Diplomacy, Heal, ArcanaKnowledge, HistoryKnowledge,
            ReligionKnowledge, PlaneKnowledge, Profession, Spellcraft
        ],
        skillPointsEachLevel: 2
    }),
    druid: new Class('德鲁伊', {
        hitDice: 8,
        fortSave: SaveType.STRONG,
        refSave: SaveType.WEAK,
        willSave: SaveType.STRONG,
        bab: 0.75,
        skills: [
            Concentration, Craft, Diplomacy, HandleAnimal, Heal, NatureKnowledge,
            Listen, Profession, Ride, Spellcraft, Spot, Survival, Swim
        ],
        skillPointsEachLevel: 4
    }),
    fighter: new Class('战士', {
        hitDice: 10,
        fortSave: SaveType.STRONG,
        refSave: SaveType.WEAK,
        willSave: SaveType.WEAK,
        bab: 1,
        skills: [Climb, Craft, HandleAnimal, Intimidate, Jump, Ride, Swim],
        skillPointsEachLevel: 2
    }),
    monk: new Class('武僧', {
        hitDice: 8,
        fortSave: SaveType.STRONG,
        refSave: SaveType.STRONG,
        willSave: SaveType.STRONG,
        bab: 0.75,
        skillPointsEachLevel: 4,
        skills: [
            Balance, Climb, Concentration, Craft, Diplomacy, EscapeArtist,
            Hide, Jump, ArcanaKnowledge, ReligionKnowledge, Listen, MoveSilently,
            Perform, Profession, SenseMotive, Spot, Swim, Tumble
        ]
    }),
    paladin: new Class('圣武士', {
        hitDice: 10,
        fortSave: SaveType.STRONG,
        refSave: SaveType.WEAK,
        willSave: SaveType.WEAK,
        bab: 1,
        skills: [
            Concentration, Craft, Diplomacy, HandleAnimal,
            Heal, RoyalKnowledge, ReligionKnowledge, Profession, Ride, SenseMotive
        ],
        skillPointsEachLevel: 2
    }),
    ranger: new Class('巡林客', {
        hitDice: 8,
        fortSave: SaveType.STRONG,
        refSave: SaveType.STRONG,
        willSave: SaveType.WEAK,
        bab: 1,
        skillPointsEachLevel: 6,
        skills: [
            Climb, Concentration, Craft, HandleAnimal, Heal, Hide, Jump,
            DungeoneeringKnowledge, GeographyKnowledge, NatureKnowledge,
            Listen, MoveSilently, Profession, Ride, Search, Spot, Survival, Swim, UseRope
        ]
    }),
    rouge: new Class('游荡者', {
        hitDice: 6,
        fortSave: SaveType.WEAK,
        refSave: SaveType.STRONG,
        willSave: SaveType.WEAK,
        bab: 0.75,
        skillPointsEachLevel: 8,
        skills: [
            Appraise, Balance, Bluff, Climb, Craft, DecipherScript, Diplomacy,
            DisableDevice, Disguise, EscapeArtist, Forgery, GatherInformation,
            Hide, Intimidate, Jump, LocalKnowledge, Listen, MoveSilently, OpenLock,
            Perform, Profession, Search, SenseMotive, SleightOfHand, Spot, Swim,
            Tumble, UseMagicDevice, UseRope
        ]
    }),
    sorcerer: new Class('术士', {
        hitDice: 4,
        fortSave: SaveType.WEAK,
        refSave: SaveType.WEAK,
        willSave: SaveType.STRONG,
        bab: 0.5,
        skillPointsEachLevel: 2,
        skills: [
            Bluff, Concentration, Craft, ArcanaKnowledge, Profession, Spellcraft
        ]
    }),
    wizard: new Class('法师', {
        hitDice: 4,
        fortSave: SaveType.WEAK,
        refSave: SaveType.WEAK,
        willSave: SaveType.STRONG,
        bab: 0.5,
        skillPointsEachLevel: 2,
        skills: [
            Concentration, Craft, DecipherScript, ...allKnowledges, Profession,
        ]
    })
}

export function getClassByName(name) {
    return Object.values(classes).find(c => c.name === name)
}