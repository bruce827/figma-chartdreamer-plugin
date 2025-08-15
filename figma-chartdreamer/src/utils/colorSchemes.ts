/**
 * 颜色方案生成工具
 */

import { ColorScheme } from '../types/sankey.types';

/**
 * 预设颜色方案定义
 */
export const COLOR_SCHEMES: Record<ColorScheme, {
  name: string;
  nodeColors: string[];
  linkColor: string;
  background?: string;
}> = {
  [ColorScheme.DEFAULT]: {
    name: '默认',
    nodeColors: ['#6366F1', '#8B5CF6', '#EC4899', '#EF4444', '#F59E0B'],
    linkColor: '#E5E7EB'
  },
  [ColorScheme.OCEAN]: {
    name: '海洋',
    nodeColors: ['#0EA5E9', '#06B6D4', '#14B8A6', '#10B981', '#22D3EE'],
    linkColor: '#E0F2FE'
  },
  [ColorScheme.SUNSET]: {
    name: '夕阳',
    nodeColors: ['#F97316', '#FB923C', '#FCD34D', '#FDE047', '#FEF3C7'],
    linkColor: '#FED7AA'
  },
  [ColorScheme.FOREST]: {
    name: '森林',
    nodeColors: ['#16A34A', '#22C55E', '#4ADE80', '#86EFAC', '#BBF7D0'],
    linkColor: '#DCFCE7'
  },
  [ColorScheme.NEON]: {
    name: '霓虹',
    nodeColors: ['#E11D48', '#F43F5E', '#EC4899', '#D946EF', '#A855F7'],
    linkColor: '#FCE7F3'
  },
  [ColorScheme.PASTEL]: {
    name: '柔和',
    nodeColors: ['#C084FC', '#F0ABFC', '#FCA5A5', '#FCD34D', '#86EFAC'],
    linkColor: '#F3E8FF'
  },
  [ColorScheme.MONOCHROME]: {
    name: '单色',
    nodeColors: ['#374151', '#4B5563', '#6B7280', '#9CA3AF', '#D1D5DB'],
    linkColor: '#E5E7EB'
  },
  [ColorScheme.CUSTOM]: {
    name: '自定义',
    nodeColors: [],
    linkColor: '#E5E7EB'
  }
};

/**
 * 根据索引获取节点颜色
 * @param scheme 颜色方案
 * @param index 节点索引
 * @param customColors 自定义颜色数组
 * @returns 颜色值
 */
export function getNodeColor(
  scheme: ColorScheme,
  index: number,
  customColors?: string[]
): string {
  if (scheme === ColorScheme.CUSTOM && customColors && customColors.length > 0) {
    return customColors[index % customColors.length];
  }
  
  const colors = COLOR_SCHEMES[scheme].nodeColors;
  if (colors.length === 0) {
    return '#6366F1'; // 默认颜色
  }
  
  return colors[index % colors.length];
}

/**
 * 生成渐变色
 * @param startColor 开始颜色
 * @param endColor 结束颜色
 * @param steps 步数
 * @returns 渐变色数组
 */
export function generateGradient(
  startColor: string,
  endColor: string,
  steps: number = 5
): string[] {
  const start = hexToRgb(startColor);
  const end = hexToRgb(endColor);
  
  if (!start || !end) {
    return [startColor];
  }
  
  const gradient: string[] = [];
  
  for (let i = 0; i < steps; i++) {
    const ratio = i / (steps - 1);
    const r = Math.round(start.r + (end.r - start.r) * ratio);
    const g = Math.round(start.g + (end.g - start.g) * ratio);
    const b = Math.round(start.b + (end.b - start.b) * ratio);
    gradient.push(rgbToHex(r, g, b));
  }
  
  return gradient;
}

/**
 * 将HEX颜色转换为RGB
 */
function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
      }
    : null;
}

/**
 * 将RGB转换为HEX
 */
function rgbToHex(r: number, g: number, b: number): string {
  return '#' + [r, g, b].map(x => {
    const hex = x.toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  }).join('');
}

/**
 * 调整颜色亮度
 * @param color HEX颜色
 * @param amount 调整量 (-100 到 100)
 */
export function adjustBrightness(color: string, amount: number): string {
  const rgb = hexToRgb(color);
  if (!rgb) return color;
  
  const adjust = (value: number) => {
    const adjusted = value + amount;
    return Math.max(0, Math.min(255, adjusted));
  };
  
  return rgbToHex(adjust(rgb.r), adjust(rgb.g), adjust(rgb.b));
}

/**
 * 生成和谐配色方案
 * @param baseColor 基础颜色
 * @param count 生成数量
 */
export function generateHarmoniousColors(baseColor: string, count: number = 5): string[] {
  const colors: string[] = [baseColor];
  
  for (let i = 1; i < count; i++) {
    // 使用色相偏移生成和谐色
    const hueShift = (360 / count) * i;
    colors.push(shiftHue(baseColor, hueShift));
  }
  
  return colors;
}

/**
 * 色相偏移
 */
function shiftHue(color: string, degrees: number): string {
  const rgb = hexToRgb(color);
  if (!rgb) return color;
  
  // 转换为HSL
  const { h, s, l } = rgbToHsl(rgb.r, rgb.g, rgb.b);
  
  // 调整色相
  const newHue = (h + degrees) % 360;
  
  // 转回RGB
  const newRgb = hslToRgb(newHue, s, l);
  return rgbToHex(newRgb.r, newRgb.g, newRgb.b);
}

/**
 * RGB转HSL
 */
function rgbToHsl(r: number, g: number, b: number): { h: number; s: number; l: number } {
  r /= 255;
  g /= 255;
  b /= 255;
  
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;
  
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    
    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
        break;
      case g:
        h = ((b - r) / d + 2) / 6;
        break;
      case b:
        h = ((r - g) / d + 4) / 6;
        break;
    }
  }
  
  return { h: h * 360, s, l };
}

/**
 * HSL转RGB
 */
function hslToRgb(h: number, s: number, l: number): { r: number; g: number; b: number } {
  h /= 360;
  
  let r, g, b;
  
  if (s === 0) {
    r = g = b = l;
  } else {
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1/6) return p + (q - p) * 6 * t;
      if (t < 1/2) return q;
      if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
      return p;
    };
    
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1/3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1/3);
  }
  
  return {
    r: Math.round(r * 255),
    g: Math.round(g * 255),
    b: Math.round(b * 255)
  };
}
