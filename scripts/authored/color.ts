// Just enough colour maths for the build's contrast report: read a CSS colour with its alpha,
// paint a translucent one over what sits beneath it, and get the WCAG contrast of the result.
// OKLCH is the working space because a theme may write `oklch()` values.

export interface Oklch {
    l: number;
    c: number;
    h: number;
}

type Vec3 = [number, number, number];

const toOklab = ({ l, c, h }: Oklch): Vec3 => {
    const radians = (h * Math.PI) / 180;

    return [l, c * Math.cos(radians), c * Math.sin(radians)];
};

const fromOklab = ([l, a, b]: Vec3): Oklch => {
    const c = Math.hypot(a, b);
    const h = (Math.atan2(b, a) * 180) / Math.PI;

    return { l, c, h: h < 0 ? h + 360 : h };
};

const toLinearSrgb = (color: Oklch): Vec3 => {
    const [l, a, b] = toOklab(color);
    const lp = (l + 0.3963377774 * a + 0.2158037573 * b) ** 3;
    const mp = (l - 0.1055613458 * a - 0.0638541728 * b) ** 3;
    const sp = (l - 0.0894841775 * a - 1.291485548 * b) ** 3;

    return [
        4.0767416621 * lp - 3.3077115913 * mp + 0.2309699292 * sp,
        -1.2684380046 * lp + 2.6097574011 * mp - 0.3413193965 * sp,
        -0.0041960863 * lp - 0.7034186147 * mp + 1.707614701 * sp,
    ];
};

const toLinear = (channel: number): number => (channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4);

const fromSrgb = (red: number, green: number, blue: number): Oklch => {
    const [r, g, b] = [red, green, blue].map(toLinear);
    const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
    const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
    const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);

    return fromOklab([
        0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s,
        1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s,
        0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s,
    ]);
};

export interface ParsedColor {
    color: Oklch;
    alpha: number;
}

const alphaOf = (raw: string | undefined): number => {
    if (raw === undefined) {
        return 1;
    }

    return raw.endsWith('%') ? Number(raw.slice(0, -1)) / 100 : Number(raw);
};

/** Reads the first `#hex`, `rgb()`/`rgba()` or `oklch()` colour in a CSS value, with its alpha. */
export const parseColor = (value: string): ParsedColor | null => {
    const hex = value.match(/#([0-9a-f]{3}|[0-9a-f]{6})([0-9a-f]{2})?\b/i);

    if (hex !== null) {
        const digits = hex[1].length === 3 ? [...hex[1]].map(digit => digit + digit).join('') : hex[1];
        const [red, green, blue] = [0, 2, 4].map(i => parseInt(digits.slice(i, i + 2), 16) / 255);

        return { color: fromSrgb(red, green, blue), alpha: hex[2] === undefined ? 1 : parseInt(hex[2], 16) / 255 };
    }

    const rgb = value.match(/rgba?\(\s*([\d.]+)[\s,]+([\d.]+)[\s,]+([\d.]+)(?:\s*[,/]\s*([\d.]+%?))?/i);

    if (rgb !== null) {
        return { color: fromSrgb(Number(rgb[1]) / 255, Number(rgb[2]) / 255, Number(rgb[3]) / 255), alpha: alphaOf(rgb[4]) };
    }

    const oklch = value.match(/oklch\(\s*([\d.]+)(%?)\s+([\d.]+)\s+([\d.]+)(?:\s*\/\s*([\d.]+%?))?/i);

    return oklch === null
        ? null
        : { color: { l: Number(oklch[1]) / (oklch[2] === '%' ? 100 : 1), c: Number(oklch[3]), h: Number(oklch[4]) }, alpha: alphaOf(oklch[5]) };
};

const toGamma = (channel: number): number => {
    const clamped = Math.min(1, Math.max(0, channel));

    return clamped <= 0.0031308 ? clamped * 12.92 : 1.055 * clamped ** (1 / 2.4) - 0.055;
};

/** What a (possibly translucent) colour looks like painted over an opaque one, blended in sRGB as browsers do. */
export const over = (top: ParsedColor, base: Oklch): Oklch => {
    if (top.alpha >= 1) {
        return top.color;
    }

    const upper = toLinearSrgb(top.color).map(toGamma);
    const lower = toLinearSrgb(base).map(toGamma);
    const [red, green, blue] = upper.map((channel, i) => channel * top.alpha + lower[i] * (1 - top.alpha));

    return fromSrgb(red, green, blue);
};

const luminance = (color: Oklch): number => {
    const [r, g, b] = toLinearSrgb(color).map(channel => Math.min(1, Math.max(0, channel)));

    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};

export const contrast = (a: Oklch, b: Oklch): number => {
    const [lighter, darker] = [luminance(a), luminance(b)].sort((x, y) => y - x);

    return (lighter + 0.05) / (darker + 0.05);
};
