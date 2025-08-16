/**
 * Figma渲染引擎
 * 将D3计算的桑基图数据渲染到Figma画布
 */

import { ComputedSankeyData } from './sankeyEngine';
import { ChartConfig, NodeShape, LinkStyle, ColorScheme, FrameSize } from '../types/sankey.types';
import { getNodeColor, COLOR_SCHEMES, adjustBrightness } from './colorSchemes';

/**
 * 渲染选项
 */
export interface RenderOptions {
  x?: number;
  y?: number;
  createFrame?: boolean;
  frameSize?: FrameSize; // 新增：Frame尺寸信息，用于智能尺寸适配
}

/**
 * 渲染桑基图到Figma
 * @param computedData D3计算后的数据
 * @param config 图表配置
 * @param options 渲染选项
 */
export async function renderSankeyToFigma(
  computedData: ComputedSankeyData,
  config: ChartConfig,
  options: RenderOptions = {}
): Promise<void> {
  try {
    // 默认位置
    const startX = options.x ?? 0;
    const startY = options.y ?? 0;
    
    // 智能尺寸适配：根据frame尺寸调整图表尺寸
    let targetWidth = computedData.width;
    let targetHeight = computedData.height;
    let scaleFactor = 1;
    
    if (options.frameSize) {
      // 根据frame尺寸计算最佳图表尺寸
      const { width: frameWidth, height: frameHeight } = options.frameSize;
      const margin = 40; // 边距，根据bugChecklist建议
      
      const availableWidth = frameWidth - margin * 2;
      const availableHeight = frameHeight - margin * 2;
      
      // 保持宽高比，计算最佳适配尺寸
      const aspectRatio = computedData.width / computedData.height;
      const frameAspectRatio = availableWidth / availableHeight;
      
      if (frameAspectRatio > aspectRatio) {
        // frame更宽，以高度为准
        targetHeight = availableHeight;
        targetWidth = targetHeight * aspectRatio;
      } else {
        // frame更高，以宽度为准
        targetWidth = availableWidth;
        targetHeight = targetWidth / aspectRatio;
      }
      
      // 计算缩放因子
      scaleFactor = Math.min(targetWidth / computedData.width, targetHeight / computedData.height);
      
      console.log('智能尺寸适配:', {
        originalSize: `${computedData.width}x${computedData.height}`,
        frameSize: `${frameWidth}x${frameHeight}`,
        targetSize: `${targetWidth}x${targetHeight}`,
        scaleFactor: scaleFactor.toFixed(2)
      });
    }
    
    // 创建容器框架
    let container: FrameNode | PageNode;
    let targetContainer: FrameNode | null = null; // 目标frame容器
    
    if (options.createFrame !== false) {
      container = figma.createFrame();
      container.name = '📊 Sankey Diagram';
      container.x = startX;
      container.y = startY;
      // 增加额外的空间以确保内容不被裁切
      // 考虑阴影效果(~10px)、文本溢出(~20px)等因素
      const paddingExtra = 30;
      container.resize(
        targetWidth + paddingExtra, 
        targetHeight + paddingExtra
      );
      
      // 设置框架背景
      container.fills = [{
        type: 'SOLID',
        color: config.theme === 'dark' 
          ? { r: 0.1, g: 0.1, b: 0.1 } 
          : { r: 1, g: 1, b: 1 }
      }];
      
      // 添加到当前页面
      figma.currentPage.appendChild(container);
    } else {
      // 如果有frameSize，说明要适配到选中的frame
      if (options.frameSize) {
        // 查找选中的frame作为目标容器
        const selection = figma.currentPage.selection;
        const selectedFrame = selection.find(node => node.type === 'FRAME') as FrameNode | undefined;
        
        if (selectedFrame) {
          targetContainer = selectedFrame;
          container = selectedFrame; // 使用选中的frame作为容器
          console.log('使用选中的frame作为容器:', selectedFrame.name);
        } else {
          // 如果找不到选中的frame，回退到页面
          container = figma.currentPage;
          console.warn('未找到选中的frame，回退到页面容器');
        }
      } else {
        container = figma.currentPage;
      }
    }
    
    // 创建节点和链接的组
    const nodesGroup = figma.createFrame();
    nodesGroup.name = 'Nodes';
    nodesGroup.clipsContent = false;
    nodesGroup.fills = [];
    // 设置组的大小以包含所有内容
    nodesGroup.resize(targetWidth, targetHeight);
    
    const linksGroup = figma.createFrame();
    linksGroup.name = 'Links';
    linksGroup.clipsContent = false;
    linksGroup.fills = [];
    // 设置组的大小以包含所有内容
    linksGroup.resize(targetWidth, targetHeight);
    
    // 渲染链接（先渲染，这样它们会在节点下方）
    console.log('开始渲染链接...');
    // 当创建了Frame容器时，不需要额外的偏移，因为组本身会有偏移
    const renderOffsetX = options.createFrame !== false ? 0 : startX;
    const renderOffsetY = options.createFrame !== false ? 0 : startY;
    await renderLinks(linksGroup, computedData, config, renderOffsetX, renderOffsetY, scaleFactor);
    
    // 渲染节点
    console.log('开始渲染节点...');
    await renderNodes(nodesGroup, computedData, config, renderOffsetX, renderOffsetY, scaleFactor);
    
    // 将组添加到容器（如果没有在frame适配中已经添加）
    if (!targetContainer || options.createFrame !== false) {
      container.appendChild(linksGroup);
      container.appendChild(nodesGroup);
    }
    
    // 如果创建了框架，调整其位置以适应内容
    if (options.createFrame !== false && container.type === 'FRAME') {
      // 为组添加一些偏移，使内容在框架内居中并留有边距
      const frameOffset = 15;
      linksGroup.x = frameOffset;
      linksGroup.y = frameOffset;
      nodesGroup.x = frameOffset;
      nodesGroup.y = frameOffset;
      
      // 自动缩放视图以显示整个图表
      figma.viewport.scrollAndZoomIntoView([container]);
    } else if (targetContainer && options.frameSize) {
      // 智能尺寸适配：将组放置到选中的frame中
      const { width: frameWidth, height: frameHeight } = options.frameSize;
      const margin = 40;
      
      // 计算居中位置（相对于frame的左上角）
      const centerX = margin;
      const centerY = margin;
      
      // 设置组的位置
      linksGroup.x = centerX;
      linksGroup.y = centerY;
      nodesGroup.x = centerX;
      nodesGroup.y = centerY;
      
      console.log('已适配到Frame:', { 
        frameName: targetContainer.name,
        centerX, 
        centerY, 
        targetWidth, 
        targetHeight,
        frameSize: `${frameWidth}x${frameHeight}`
      });
      
      // 将组添加到选中的frame中，而不是页面
      targetContainer.appendChild(linksGroup);
      targetContainer.appendChild(nodesGroup);
      
      // 更新container引用，因为组现在在frame中
      container = targetContainer;
    } else if (options.frameSize) {
      // 智能尺寸适配：将组放置在frame内的合适位置
      const { width: frameWidth, height: frameHeight } = options.frameSize;
      const margin = 40;
      
      // 计算居中位置
      const centerX = (frameWidth - targetWidth) / 2;
      const centerY = (frameHeight - targetHeight) / 2;
      
      linksGroup.x = centerX;
      linksGroup.y = centerY;
      nodesGroup.x = centerX;
      nodesGroup.y = centerY;
      
      console.log('已适配到Frame:', { centerX, centerY, targetWidth, targetHeight });
    }
    
    // 选中生成的图表（只有当container不是页面节点时才选择）
    if (container.type !== 'PAGE') {
      figma.currentPage.selection = [container as SceneNode];
    } else {
      // 如果container是页面，选择生成的组
      const groupsToSelect: SceneNode[] = [];
      if (linksGroup) groupsToSelect.push(linksGroup);
      if (nodesGroup) groupsToSelect.push(nodesGroup);
      
      if (groupsToSelect.length > 0) {
        figma.currentPage.selection = groupsToSelect;
      }
    }
    
    console.log('渲染完成！');
    
  } catch (error) {
    console.error('渲染失败:', error);
    throw error;
  }
}

/**
 * 渲染节点
 */
async function renderNodes(
  container: FrameNode,
  computedData: ComputedSankeyData,
  config: ChartConfig,
  offsetX: number,
  offsetY: number,
  scaleFactor: number
): Promise<void> {
  // 加载字体
  await figma.loadFontAsync({ family: "Inter", style: "Regular" });
  await figma.loadFontAsync({ family: "Inter", style: "Medium" });
  
  computedData.nodes.forEach((node, index) => {
    if (node.x0 === undefined || node.x1 === undefined || 
        node.y0 === undefined || node.y1 === undefined) {
      console.warn('节点位置无效，跳过:', node);
      return;
    }
    
    // 根据节点形状创建不同的图形
    let nodeShape: SceneNode;
    const nodeWidth = node.x1 - node.x0;
    const nodeHeight = node.y1 - node.y0;
    
    switch (config.nodeShape) {
      case NodeShape.CIRCLE:
        // 创建椭圆（如果宽高相等则为圆形）
        const ellipse = figma.createEllipse();
        ellipse.name = `Node: ${node.name}`;
        ellipse.x = node.x0;
        ellipse.y = node.y0;
        ellipse.resize(nodeWidth, nodeHeight);
        nodeShape = ellipse;
        break;
        
      case NodeShape.ROUNDED_RECTANGLE:
        const roundedRect = figma.createRectangle();
        roundedRect.name = `Node: ${node.name}`;
        roundedRect.x = node.x0;
        roundedRect.y = node.y0;
        roundedRect.resize(nodeWidth, nodeHeight);
        roundedRect.cornerRadius = config.nodeRadius || 4;
        nodeShape = roundedRect;
        break;
        
      case NodeShape.RECTANGLE:
      default:
        const rect = figma.createRectangle();
        rect.name = `Node: ${node.name}`;
        rect.x = node.x0;
        rect.y = node.y0;
        rect.resize(nodeWidth, nodeHeight);
        nodeShape = rect;
        break;
    }
    
    // 设置节点颜色（支持颜色方案）
    const nodeColor = getNodeColorRGB(config, index);
    
    // 设置节点填充
    if ('fills' in nodeShape) {
      // Figma 暂不支持直接设置渐变，我们使用单色
      // 如果启用渐变，我们可以用稍暗的颜色
      const fillColor = config.useGradient 
        ? adjustNodeColor(nodeColor, -20)
        : nodeColor;
      
      nodeShape.fills = [{
        type: 'SOLID',
        color: fillColor
      }];
    }
    
    // 添加阴影效果（如果启用）
    if (config.showShadow && 'effects' in nodeShape) {
      nodeShape.effects = [{
        type: 'DROP_SHADOW',
        color: { r: 0, g: 0, b: 0, a: 0.15 },
        offset: { x: 0, y: 2 },
        radius: 6,
        spread: 0,
        visible: true,
        blendMode: 'NORMAL'
      }];
    }
    
    container.appendChild(nodeShape);
    
    // 创建文本标签
    const text = figma.createText();
    text.name = `Label: ${node.name}`;
    
    // 设置文本内容和样式
    text.characters = node.name;
    text.fontSize = 12;
    text.fontName = { family: "Inter", style: "Medium" };
    
    // 设置文本颜色（根据背景色自动调整）
    const isLightBg = (nodeColor.r + nodeColor.g + nodeColor.b) / 3 > 0.5;
    text.fills = [{
      type: 'SOLID',
      color: isLightBg 
        ? { r: 0.2, g: 0.2, b: 0.2 } 
        : { r: 1, g: 1, b: 1 }
    }];
    
    // 文本居中对齐
    text.textAlignHorizontal = 'CENTER';
    text.textAlignVertical = 'CENTER';
    
    // 定位文本
    
    // 调整文本框大小以适应节点
    text.resize(nodeWidth - 8, nodeHeight);
    text.x = node.x0 + 4;
    text.y = node.y0 + (nodeHeight - text.height) / 2;
    
    container.appendChild(text);
  });
}

/**
 * 渲染链接
 */
async function renderLinks(
  container: FrameNode,
  computedData: ComputedSankeyData,
  config: ChartConfig,
  offsetX: number,
  offsetY: number,
  scaleFactor: number
): Promise<void> {
  // 打印详细的链接数据以便调试
  console.log('Links data structure:', computedData.links.map((link, idx) => ({
    index: idx,
    source: (link.source as any).name,
    sourceId: (link.source as any).id,
    target: (link.target as any).name,
    targetId: (link.target as any).id,
    value: link.value,
    width: link.width,
    y0: link.y0,
    y1: link.y1,
    sourceNode: {
      x0: (link.source as any).x0,
      x1: (link.source as any).x1,
      y0: (link.source as any).y0,
      y1: (link.source as any).y1
    },
    targetNode: {
      x0: (link.target as any).x0,
      x1: (link.target as any).x1,
      y0: (link.target as any).y0,
      y1: (link.target as any).y1,
      targetLinksCount: (link.target as any).targetLinks ? (link.target as any).targetLinks.length : 0
    }
  })));
  
  // 打印节点的targetLinks信息
  console.log('Node targetLinks info:', computedData.nodes.map(node => ({
    name: node.name,
    id: node.id,
    targetLinksCount: node.targetLinks ? node.targetLinks.length : 0,
    targetLinks: node.targetLinks ? node.targetLinks.map((tl: any) => ({
      sourceId: (tl.source as any).id,
      sourceName: (tl.source as any).name,
      value: tl.value,
      width: tl.width
    })) : []
  })));
  
  computedData.links.forEach((link, index) => {
    const source = link.source as any;
    const target = link.target as any;
    
    // 检查必需的属性
    if (!source.x1 || !target.x0 || link.y0 === undefined || !link.width) {
      console.warn('链接数据无效，跳过:', link);
      return;
    }
    
    // 根据链接样式生成路径
    const path = generateLinkPath(source, target, link, config.linkStyle || LinkStyle.BEZIER);
    
    if (!path) {
      return;
    }
    
    // 创建矢量节点
    const vector = figma.createVector();
    vector.name = `Link: ${source.name || source.id} → ${target.name || target.id}`;
    
    // 设置路径
    vector.vectorPaths = [{
      windingRule: 'NONZERO',
      data: path
    }];
    
    // 设置链接颜色和透明度
    const linkColor = getLinkColorRGB(config);
    const opacity = config.linkOpacity !== undefined ? config.linkOpacity : 0.3;
    
    // 设置链接填充
    // 由于Figma API的限制，我们简化渐变实现
    if (config.linkStyle === LinkStyle.GRADIENT) {
      // 使用混合颜色模拟渐变效果
      const sourceColor = getNodeColorRGB(config, index % computedData.nodes.length);
      const targetColor = getNodeColorRGB(config, (index + 1) % computedData.nodes.length);
      const mixedColor = {
        r: (sourceColor.r + targetColor.r) / 2,
        g: (sourceColor.g + targetColor.g) / 2,
        b: (sourceColor.b + targetColor.b) / 2
      };
      vector.fills = [{
        type: 'SOLID',
        color: mixedColor,
        opacity: opacity
      }];
    } else {
      // 单色填充
      vector.fills = [{
        type: 'SOLID',
        color: linkColor,
        opacity: opacity
      }];
    }
    
    // 移除描边
    vector.strokes = [];
    
    // 设置位置
    vector.x = 0;
    vector.y = 0;
    
    container.appendChild(vector);
  });
}

/**
 * 生成链接的SVG路径
 * 直接使用D3-sankey计算的结果，不进行任何干预
 */
function generateLinkPath(source: any, target: any, link: any, style: LinkStyle): string {
  // 直接使用D3计算的坐标，不进行任何修改
  const x0 = source.x1;  // 源节点的右边缘
  const x1 = target.x0;  // 目标节点的左边缘
  
  // 直接使用D3计算的链接宽度和位置
  const width = link.width || 1;
  const sourceY0 = link.y0;
  const sourceY1 = link.y0 + width;
  
  // 直接使用D3计算的目标位置，不重新计算
  // D3已经正确计算了链接在目标节点中的位置
  const targetY0 = link.y1 - width; // 使用D3计算的y1减去宽度
  const targetY1 = link.y1;
  
  console.log(`Link ${source.id} -> ${target.id} (D3原始数据):`, {
    sourceY: { y0: sourceY0, y1: sourceY1 },
    targetY: { y0: targetY0, y1: targetY1 },
    linkWidth: width,
    d3Data: { y0: link.y0, y1: link.y1 }
  });
  
  let path: string;
  
  switch (style) {
    case LinkStyle.STRAIGHT:
      // 直线链接
      path = [
        `M ${x0} ${sourceY0}`,                    // 移动到起点（上边）
        `L ${x1} ${targetY0}`,                    // 直线到目标（上边）
        `L ${x1} ${targetY1}`,                    // 直线到目标（下边）
        `L ${x0} ${sourceY1}`,                    // 直线返回源（下边）
        `Z`                                       // 闭合路径
      ].join(' ');
      break;
      
    case LinkStyle.BEZIER:
    case LinkStyle.GRADIENT:
    default:
      // 贝塞尔曲线链接
      const cx = (x0 + x1) / 2;
      path = [
        `M ${x0} ${sourceY0}`,                                      // 移动到起点（上边）
        `C ${cx} ${sourceY0} ${cx} ${targetY0} ${x1} ${targetY0}`,  // 贝塞尔曲线到目标（上边）
        `L ${x1} ${targetY1}`,                                      // 直线到目标（下边）
        `C ${cx} ${targetY1} ${cx} ${sourceY1} ${x0} ${sourceY1}`,  // 贝塞尔曲线返回源（下边）
        `Z`                                                         // 闭合路径
      ].join(' ');
      break;
  }
  
  return path;
}

/**
 * 获取节点颜色（RGB格式）
 */
function getNodeColorRGB(config: ChartConfig, index: number): RGB {
  // 使用颜色方案
  let hexColor: string;
  
  if (config.colorScheme && config.colorScheme !== ColorScheme.CUSTOM) {
    hexColor = getNodeColor(config.colorScheme, index, config.customColors);
  } else if (config.customColors && config.customColors.length > 0) {
    hexColor = config.customColors[index % config.customColors.length];
  } else {
    hexColor = config.nodeColor || '#6366F1';
  }
  
  return hexToRGB(hexColor);
}

/**
 * 调整节点颜色亮度
 */
function adjustNodeColor(color: RGB, amount: number): RGB {
  const adjust = (value: number) => {
    const adjusted = value + (amount / 255);
    return Math.max(0, Math.min(1, adjusted));
  };
  
  return {
    r: adjust(color.r),
    g: adjust(color.g),
    b: adjust(color.b)
  };
}

/**
 * 获取链接颜色（RGB格式）
 */
function getLinkColorRGB(config: ChartConfig): RGB {
  const hexColor = config.linkColor || '#9CA3AF';
  return hexToRGB(hexColor);
}

/**
 * 将十六进制颜色转换为RGB
 */
function hexToRGB(hex: string): RGB {
  // 移除#号
  hex = hex.replace('#', '');
  
  // 解析RGB值
  const r = parseInt(hex.substring(0, 2), 16) / 255;
  const g = parseInt(hex.substring(2, 4), 16) / 255;
  const b = parseInt(hex.substring(4, 6), 16) / 255;
  
  return { r, g, b };
}
