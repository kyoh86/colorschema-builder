export function getLuminance(color: string): number {
  const r = Number.parseInt(color.slice(1, 3), 16) / 255;
  const g = Number.parseInt(color.slice(3, 5), 16) / 255;
  const b = Number.parseInt(color.slice(5, 7), 16) / 255;

  const [R, G, B] = [r, g, b].map((v) =>
    v <= 0.03928 ? v / 12.92 : (v + 0.055) / 1.055 ** 2.4
  );

  return 0.2126 * R + 0.7152 * G + 0.0722 * B;
}

export function getContrastRatio(color1: string, color2: string): number {
  const luminance1 = getLuminance(color1);
  const luminance2 = getLuminance(color2);
  const brighter = Math.max(luminance1, luminance2);
  const darker = Math.min(luminance1, luminance2);

  return (brighter + 0.05) / (darker + 0.05);
}

// パレットの初期定義
export const defaultPalette = {
  Black: "#000000",
  BrightBlack: "#808080",
  Red: "#800000",
  BrightRed: "#ff0000",
  Green: "#008000",
  BrightGreen: "#00ff00",
  Yellow: "#808000",
  BrightYellow: "#ffff00",
  Blue: "#000080",
  BrightBlue: "#0000ff",
  Magenta: "#800080",
  BrightMagenta: "#ff00ff",
  Cyan: "#008080",
  BrightCyan: "#00ffff",
  White: "#c0c0c0",
  BrightWhite: "#ffffff"
};

// パレットの型定義
export type Palette = typeof defaultPalette;
export type PaletteKey = keyof Palette;

