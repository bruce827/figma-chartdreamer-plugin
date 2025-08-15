/**
 * D3桑基图计算引擎
 * 使用d3-sankey库计算桑基图的布局
 */

import { sankey, sankeyLinkHorizontal } from 'd3-sankey';
import { SankeyData, SankeyNode, SankeyLink, ChartConfig } from '../types/sankey.types';

/**
 * D3桑基图节点接口
 */
interface D3Node {
  id: string;
  name: string;
  value: number;
  x0?: number;
  x1?: number;
  y0?: number;
  y1?: number;
  index?: number;
  sourceLinks?: D3Link[];
  targetLinks?: D3Link[];
}

/**
 * D3桑基图链接接口
 */
interface D3Link {
  source: D3Node | string | number;
  target: D3Node | string | number;
  value: number;
  width?: number;
  y0?: number;
  y1?: number;
  index?: number;
}

/**
 * 计算后的桑基图数据
 */
export interface ComputedSankeyData {
  nodes: D3Node[];
  links: D3Link[];
  width: number;
  height: number;
}

/**
 * 计算桑基图布局
 * @param data 原始桑基图数据
 * @param config 图表配置
 * @returns 计算后的桑基图数据
 */
export function computeSankeyLayout(
  data: SankeyData,
  config: ChartConfig
): ComputedSankeyData {
  // 设置画布尺寸
  const width = config.width || 800;
  const height = config.height || 600;
  const nodeWidth = config.nodeWidth || 15;
  const nodePadding = config.nodePadding || 10;
  
  // 边距设置 - 增加更多空间以避免内容被裁切
  const margin = { top: 30, right: 40, bottom: 30, left: 30 };
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;

  // 创建节点映射（id -> 节点对象）
  const nodeMap = new Map<string, D3Node>();
  
  // 转换节点数据为D3格式
  const d3Nodes: D3Node[] = data.nodes.map(node => {
    const d3Node: D3Node = {
      id: node.id,
      name: node.name,
      value: node.value
    };
    nodeMap.set(node.id, d3Node);
    return d3Node;
  });

  // 转换链接数据为D3格式
  const d3Links: D3Link[] = data.links.map(link => {
    return {
      source: nodeMap.get(link.source)!,
      target: nodeMap.get(link.target)!,
      value: link.value
    };
  });

  // 创建桑基图生成器
  const sankeyGenerator = sankey<any, any>()
    .nodeId((d: any) => d.id)
    .nodeWidth(nodeWidth)
    .nodePadding(nodePadding)
    .extent([[margin.left, margin.top], [innerWidth, innerHeight]]);

  // 计算布局
  const graph = {
    nodes: d3Nodes,
    links: d3Links
  };

  // 执行布局计算
  sankeyGenerator(graph as any);

  // 更新节点值（基于链接的总流量）
  d3Nodes.forEach(node => {
    // 计算入流量
    const inFlow = d3Links
      .filter(link => (link.target as D3Node).id === node.id)
      .reduce((sum, link) => sum + link.value, 0);
    
    // 计算出流量
    const outFlow = d3Links
      .filter(link => (link.source as D3Node).id === node.id)
      .reduce((sum, link) => sum + link.value, 0);
    
    // 节点值为入流量和出流量的最大值
    node.value = Math.max(inFlow, outFlow, node.value || 0);
  });

  // 添加调试信息
  console.log('D3 Sankey Layout Computed:', {
    nodesCount: d3Nodes.length,
    linksCount: d3Links.length,
    nodes: d3Nodes.map(n => ({
      id: n.id,
      name: n.name,
      value: n.value,
      x0: n.x0,
      x1: n.x1,
      y0: n.y0,
      y1: n.y1
    })),
    links: d3Links.map(l => ({
      source: (l.source as D3Node).id,
      target: (l.target as D3Node).id,
      value: l.value,
      width: l.width,
      y0: l.y0,
      y1: l.y1
    }))
  });

  return {
    nodes: d3Nodes,
    links: d3Links,
    width,
    height
  };
}


/**
 * 生成链接路径
 * @param link 链接数据
 * @returns SVG路径字符串
 */
export function generateLinkPath(link: D3Link): string {
  const source = link.source as D3Node;
  const target = link.target as D3Node;
  
  if (!source.x1 || !target.x0 || link.y0 === undefined || link.y1 === undefined) {
    return '';
  }

  // 使用贝塞尔曲线生成平滑的链接路径
  const curvature = 0.5;
  const x0 = source.x1!;
  const x1 = target.x0!;
  const xi = (x0 + x1) / 2;
  
  const y0Source = link.y0!;
  const y1Source = (link as any).y1 || link.y0!;
  const y0Target = (link.target as any).y0 || link.y0!;
  const y1Target = (link.target as any).y1 || link.y0!;

  // 创建路径
  const path = `
    M ${x0} ${y0Source}
    C ${xi} ${y0Source}, ${xi} ${y0Target}, ${x1} ${y0Target}
    L ${x1} ${y1Target}
    C ${xi} ${y1Target}, ${xi} ${y1Source}, ${x0} ${y1Source}
    Z
  `.replace(/\s+/g, ' ').trim();

  return path;
}

/**
 * 获取节点颜色
 * @param node 节点
 * @param config 配置
 * @param index 节点索引
 * @returns 颜色值
 */
export function getNodeColor(node: D3Node, config: ChartConfig, index: number): string {
  // 如果配置了节点颜色，直接使用
  if (config.nodeColor) {
    return config.nodeColor;
  }

  // 默认颜色方案
  const colors = [
    '#6366F1', // Indigo
    '#8B5CF6', // Purple
    '#EC4899', // Pink
    '#EF4444', // Red
    '#F59E0B', // Amber
    '#10B981', // Emerald
    '#06B6D4', // Cyan
    '#3B82F6', // Blue
  ];

  return colors[index % colors.length];
}

/**
 * 获取链接颜色
 * @param link 链接
 * @param config 配置
 * @returns 颜色值
 */
export function getLinkColor(link: D3Link, config: ChartConfig): string {
  // 如果配置了链接颜色，直接使用
  if (config.linkColor) {
    return config.linkColor;
  }

  // 默认使用半透明灰色
  return '#E5E7EB';
}

/**
 * 验证计算结果
 * @param computed 计算后的数据
 * @returns 是否有效
 */
export function validateComputedData(computed: ComputedSankeyData): boolean {
  // 检查节点是否有有效的位置
  for (const node of computed.nodes) {
    if (
      node.x0 === undefined ||
      node.x1 === undefined ||
      node.y0 === undefined ||
      node.y1 === undefined ||
      isNaN(node.x0) ||
      isNaN(node.x1) ||
      isNaN(node.y0) ||
      isNaN(node.y1)
    ) {
      console.error('节点位置无效:', node);
      return false;
    }
  }

  // 检查链接是否有有效的数据
  for (const link of computed.links) {
    if (
      link.width === undefined ||
      isNaN(link.width) ||
      link.width <= 0
    ) {
      console.error('链接宽度无效:', link);
      return false;
    }
  }

  return true;
}
