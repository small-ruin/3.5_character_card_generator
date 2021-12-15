export const STRENGTH_WEIGHT_MAP = {
    1: [4, 6, 10],
    2: [7, 13, 20],
    3: [11, 20, 30],
    4: [14, 26, 40],
    5: [17, 33, 50],
    6: [21, 40, 60],
    7: [24, 46, 70],
    8: [27, 53, 80],
    9: [31, 60, 90],
    10: [34, 66, 100],
    11: [39, 76, 115],
    12: [44, 86, 130],
    13: [51, 100, 150],
    14: [59, 116, 175],
    15: [67, 133, 200],
    16: [77, 153, 230],
    17: [87, 173, 260],
    18: [101, 200, 300],
    19: [117, 233, 350],
    20: [134, 266, 400],
    21: [154, 306, 460],
    22: [174, 346, 520],
    23: [201, 400, 600],
    24: [234, 466, 700],
    25: [267, 533, 800],
    26: [307, 613, 920],
    27: [347, 693, 1040],
    28: [401, 800, 1200],
    29: [467, 933, 1400],
}

export function getWeightByStr(str) {
    if (str < 30) {
        return STRENGTH_WEIGHT_MAP[str]
    }
    const count = str % 10
    const tenCount = Math.floor(str / 10) % 10

    return STRENGTH_WEIGHT_MAP['2' + count].map(w => w * 4 * tenCount)
}