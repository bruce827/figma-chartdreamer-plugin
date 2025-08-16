/**
 * 桑基图数据结构的TypeScript类型定义
 */

/**
 * 桑基图节点接口
 */
export interface SankeyNode {
  /** 节点唯一标识符 */
  id: string;
  /** 节点显示名称 */
  name: string;
  /** 节点数值 */
  value: number;
  /** 节点x坐标（由D3计算后填充） */
  x0?: number;
  /** 节点x结束坐标（由D3计算后填充） */
  x1?: number;
  /** 节点y坐标（由D3计算后填充） */
  y0?: number;
  /** 节点y结束坐标（由D3计算后填充） */
  y1?: number;
}

/**
 * 桑基图链接接口
 */
export interface SankeyLink {
  /** 源节点ID */
  source: string;
  /** 目标节点ID */
  target: string;
  /** 链接流量值 */
  value: number;
  /** 链接宽度（由D3计算后填充） */
  width?: number;
}

/**
 * Frame尺寸接口 - 用于智能尺寸适配
 */
export interface FrameSize {
  /** Frame宽度 */
  width: number;
  /** Frame高度 */
  height: number;
  /** Frame X坐标 */
  x: number;
  /** Frame Y坐标 */
  y: number;
}

/**
 * 节点形状类型
 */
export enum NodeShape {
  RECTANGLE = 'rectangle',
  ROUNDED_RECTANGLE = 'rounded_rectangle',
  CIRCLE = 'circle'
}

/**
 * 链接样式类型
 */
export enum LinkStyle {
  STRAIGHT = 'straight',
  BEZIER = 'bezier',
  GRADIENT = 'gradient'
}

/**
 * 预设颜色方案
 */
export enum ColorScheme {
  DEFAULT = 'default',
  OCEAN = 'ocean',
  SUNSET = 'sunset',
  FOREST = 'forest',
  NEON = 'neon',
  PASTEL = 'pastel',
  MONOCHROME = 'monochrome',
  CUSTOM = 'custom'
}

/**
 * 图表配置接口
 */
export interface ChartConfig {
  /** 节点颜色 */
  nodeColor: string;
  /** 链接颜色 */
  linkColor: string;
  /** 主题模式 */
  theme: 'light' | 'dark' | 'custom';
  /** 节点宽度 */
  nodeWidth?: number;
  /** 节点间距 */
  nodePadding?: number;
  /** 图表宽度 */
  width?: number;
  /** 图表高度 */
  height?: number;
  
  // 新增样式选项
  /** 节点形状 */
  nodeShape?: NodeShape;
  /** 链接样式 */
  linkStyle?: LinkStyle;
  /** 颜色方案 */
  colorScheme?: ColorScheme;
  /** 节点圆角半径（仅在rounded_rectangle时有效） */
  nodeRadius?: number;
  /** 是否显示阴影 */
  showShadow?: boolean;
  /** 链接透明度 (0-1) */
  linkOpacity?: number;
  /** 是否使用渐变色 */
  useGradient?: boolean;
  /** 自定义颜色数组（用于多色方案） */
  customColors?: string[];
  /** 是否自动调整布局 */
  autoLayout?: boolean;
  
  // 智能尺寸适配相关字段
  /** 是否启用智能尺寸适配 */
  useFrameSize?: boolean;
  /** Frame尺寸信息 */
  frameSize?: FrameSize;
}

/**
 * 桑基图数据格式
 */
export interface SankeyData {
  /** 节点列表 */
  nodes: SankeyNode[];
  /** 链接列表 */
  links: SankeyLink[];
}

/**
 * 数据输入格式枚举
 */
export enum DataFormat {
  JSON = 'json',
  CSV = 'csv',
  TSV = 'tsv'
}

/**
 * 生成请求接口
 */
export interface GenerateSankeyRequest {
  /** 输入数据（字符串格式） */
  data: string;
  /** 数据格式 */
  format: DataFormat;
  /** 图表配置 */
  config: ChartConfig;
  /** Frame尺寸信息（可选） */
  frameSize?: FrameSize;
}

/**
 * 错误信息接口
 */
export interface ErrorMessage {
  /** 错误类型 */
  type: 'parse' | 'validation' | 'render' | 'unknown';
  /** 错误消息 */
  message: string;
  /** 错误详情 */
  details?: unknown;
}
