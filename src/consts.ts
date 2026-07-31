export enum TeamColors {
    YELLOW = "#ff0",
    BLUE = "#00f",
    RED = "#ff0000",
    PURPLE = "#f0f",
    CYAN = "#0ff",
    ORANGE = "#ff5400",
}

enum AmmoColor {
    Yellow = "#FFAE00",
    Green = "#039E00",
    Blue = "#0066FF",
    Red = "#FF0000",
    Purple = "#7900FF",
    Cyan = "#00FFFF",
    DarkGray = "#333333",
    Orange = "#FF5500",
    Brown = "#A56A2B",
    Black = "#1A1A1A",
    Magenta = "#FF00FF",
}

export const weaponAmmoColors: Record<string, AmmoColor> = {
    // 9mm — yellow
    MP5: AmmoColor.Yellow,
    "MAC-10": AmmoColor.Yellow,
    UMP9: AmmoColor.Yellow,
    Vector: AmmoColor.Yellow,
    "CZ-3A1": AmmoColor.Yellow,
    VSS: AmmoColor.Yellow,
    M9: AmmoColor.Yellow,
    "Dual M9": AmmoColor.Yellow,
    M93R: AmmoColor.Yellow,
    "Dual M93R": AmmoColor.Yellow,
    G18C: AmmoColor.Yellow,
    "Dual G18C": AmmoColor.Yellow,
    P30L: AmmoColor.Yellow,
    "Dual P30L": AmmoColor.Yellow,

    // 5.56mm — green
    FAMAS: AmmoColor.Green,
    M416: AmmoColor.Green,
    "M4A1-S": AmmoColor.Green,
    "Mk 12 SPR": AmmoColor.Green,
    L86A2: AmmoColor.Green,
    M249: AmmoColor.Green,
    "QBB-97": AmmoColor.Green,
    "Scout Elite": AmmoColor.Green,
    "IMD-2": AmmoColor.Green,

    // 7.62mm — blue
    "AK-47": AmmoColor.Blue,
    "SCAR-H": AmmoColor.Blue,
    "AN-94": AmmoColor.Blue,
    Groza: AmmoColor.Blue,
    "Groza-S": AmmoColor.Blue,
    "DP-28": AmmoColor.Blue,
    "BAR M1918": AmmoColor.Blue,
    "PKP Pecheneg": AmmoColor.Blue,
    "BLR 81": AmmoColor.Blue,
    "Mosin-Nagant": AmmoColor.Blue,
    "SV-98": AmmoColor.Blue,
    "M39 EMR": AmmoColor.Blue,
    "SVD-63": AmmoColor.Blue,
    "M1 Garand": AmmoColor.Blue,
    "OT-38": AmmoColor.Blue,
    "Dual OT-38": AmmoColor.Blue,
    "OTs-38": AmmoColor.Blue,
    "Dual OTs-38": AmmoColor.Blue,

    // 12 gauge — red
    M870: AmmoColor.Red,
    M1100: AmmoColor.Red,
    MP220: AmmoColor.Red,
    "Saiga-12": AmmoColor.Red,
    "SPAS-12": AmmoColor.Red,
    "SPAS-16": AmmoColor.Red,
    M1014: AmmoColor.Red,
    "USAS-12": AmmoColor.Red,

    // .45 ACP — purple
    "Model 94": AmmoColor.Purple,
    Mk45G: AmmoColor.Purple,
    Peacemaker: AmmoColor.Purple,
    "Dual Peacemaker": AmmoColor.Purple,
    M1911: AmmoColor.Purple,
    "Dual M1911": AmmoColor.Purple,
    M1A1: AmmoColor.Purple,

    // .308 Subsonic — cyan
    "AWM-S": AmmoColor.Cyan,
    "SCAR-SSR": AmmoColor.Cyan,

    // .50 AE / .50 Caliber — dark gray
    "DEagle 50": AmmoColor.DarkGray,
    "Dual DEagle 50": AmmoColor.DarkGray,
    "Barrett M107": AmmoColor.DarkGray,
    "S&W 500": AmmoColor.DarkGray,
    "ASh-12": AmmoColor.DarkGray,

    // Special ammunition
    "Flare Gun": AmmoColor.Orange,
    "Potato Cannon": AmmoColor.Brown,
    "Potato SMG": AmmoColor.Brown,
    "PMG-134": AmmoColor.Brown,
    "M9 Cursed": AmmoColor.Black,
    "Rainbow Blaster": AmmoColor.Magenta,
};
