import { emit, on, once, showUI } from '@create-figma-plugin/utilities'

import { 
  GenerateSankeyHandler, 
  GenerateSuccessHandler, 
  GenerateErrorHandler,
  SaveToStorageHandler,
  LoadFromStorageHandler,
  StorageDataHandler,
  LoadSettingsHandler,
  SettingsLoadedHandler,
  AddToHistoryHandler,
  ClearHistoryHandler,
  DeleteHistoryItemHandler
} from './handlers/handlers'
import { 
  GenerateSankeyRequest, 
  ErrorMessage, 
  SankeyData,
  DataFormat
} from './types/sankey.types'
import { 
  computeSankeyLayout, 
  validateComputedData,
  ComputedSankeyData 
} from './utils/sankeyEngine'
import { renderSankeyToFigma } from './utils/figmaRenderer'
import { StorageManager } from './utils/storage'

// 导入RenderOptions类型
import type { RenderOptions } from './utils/figmaRenderer'

export default function () {
  // 监听生成桑基图请求
  on<GenerateSankeyHandler>('GENERATE_SANKEY', async (request: GenerateSankeyRequest) => {
    try {
      // eslint-disable-next-line no-console
      console.log('收到生成请求:', request)

      // 解析数据
      const sankeyData = parseData(request.data, request.format)
      
      // 验证数据
      validateSankeyData(sankeyData)
      
      // 使用D3计算桑基图布局
      // eslint-disable-next-line no-console
      console.log('开始计算桑基图布局...')
      const computedData = computeSankeyLayout(sankeyData, request.config)
      
      // 验证计算结果
      if (!validateComputedData(computedData)) {
        throw {
          type: 'render',
          message: 'D3布局计算失败：生成的布局数据无效'
        }
      }
      
      // 打印计算结果
      // eslint-disable-next-line no-console
      console.log('桑基图布局计算完成：', {
        nodesCount: computedData.nodes.length,
        linksCount: computedData.links.length,
        dimensions: `${computedData.width}x${computedData.height}`
      })
      
      // 检测选中的frame尺寸（智能尺寸适配）
      let frameSize = null;
      let renderOptions: RenderOptions = {
        x: 100,
        y: 100,
        createFrame: true
      };
      
      try {
        // 获取当前选中的所有对象
        const selection = figma.currentPage.selection;
        console.log('当前选中的对象:', selection.map(node => ({
          type: node.type,
          name: node.name,
          id: node.id
        })));
        
        // 严格检测frame对象
        const selectedFrame = selection.find(node => {
          // 必须是FRAME类型
          if (node.type !== 'FRAME') {
            return false;
          }
          
          // 确保是真正的frame，不是其他形状
          const frameNode = node as FrameNode;
          
          // 验证frame的基本属性
          if (typeof frameNode.width !== 'number' || 
              typeof frameNode.height !== 'number' ||
              typeof frameNode.x !== 'number' || 
              typeof frameNode.y !== 'number') {
            console.warn('检测到无效的frame属性:', frameNode);
            return false;
          }
          
          // 确保尺寸合理（不是0或负数）
          if (frameNode.width <= 0 || frameNode.height <= 0) {
            console.warn('检测到无效的frame尺寸:', { width: frameNode.width, height: frameNode.height });
            return false;
          }
          
          console.log('验证通过的有效frame:', {
            name: frameNode.name,
            id: frameNode.id,
            width: frameNode.width,
            height: frameNode.height,
            x: frameNode.x,
            y: frameNode.y
          });
          
          return true;
        }) as FrameNode | undefined;
        
        if (selectedFrame) {
          frameSize = {
            width: selectedFrame.width,
            height: selectedFrame.height,
            x: selectedFrame.x,
            y: selectedFrame.y
          };
          
          // eslint-disable-next-line no-console
          console.log('成功检测到有效Frame:', frameSize);
          
          // 使用frame的坐标和尺寸进行渲染
          renderOptions = {
            x: selectedFrame.x,
            y: selectedFrame.y,
            createFrame: false, // 不创建新frame，直接使用选中的frame
            frameSize: frameSize
          };
        } else {
          // eslint-disable-next-line no-console
          console.log('未检测到有效的Frame，使用默认尺寸');
          console.log('请确保在Figma中选中一个Frame对象（不是形状、文本或其他元素）');
        }
      } catch (frameDetectionError) {
        // eslint-disable-next-line no-console
        console.warn('Frame检测失败，使用默认尺寸:', frameDetectionError);
        // 继续使用默认渲染选项，不中断流程
      }
      
      // 渲染到Figma画布
      // eslint-disable-next-line no-console
      console.log('开始渲染到Figma...', renderOptions);
      await renderSankeyToFigma(computedData, request.config, renderOptions);
      
      // 保存到历史记录
      const historyItem = {
        name: `桑基图 ${new Date().toLocaleTimeString()}`,
        data: request.data,
        format: request.format,
        config: request.config
      }
      await StorageManager.addToHistory(historyItem)
      
      // 保存配置
      await StorageManager.saveChartConfig(request.config)
      await StorageManager.saveLastFormat(request.format)
      
      // 发送成功消息
      emit<GenerateSuccessHandler>('GENERATE_SUCCESS', `✅ 桑基图生成成功！\n节点数：${computedData.nodes.length}\n链接数：${computedData.links.length}\n图表已渲染到Figma画布！`)
      
      // 在Figma中显示通知
      figma.notify(`🎉 桑基图生成成功！节点:${computedData.nodes.length} 链接:${computedData.links.length}`, { timeout: 3000 })
      
    } catch (error: any) {
      // eslint-disable-next-line no-console
      console.error('生成失败:', error)
      
      const errorMessage: ErrorMessage = {
        type: error.type || 'unknown',
        message: error.message || '生成桑基图失败',
        details: error
      }
      
      // 发送错误消息到UI
      emit<GenerateErrorHandler>('GENERATE_ERROR', errorMessage)
      
      // 在Figma中显示错误通知
      figma.notify(`❌ ${errorMessage.message}`, { 
        timeout: 5000,
        error: true 
      })
    }
  })

  // 监听存储请求
  on<SaveToStorageHandler>('SAVE_TO_STORAGE', async (key: string, value: unknown) => {
    try {
      await figma.clientStorage.setAsync(key, value)
      // eslint-disable-next-line no-console
      console.log(`已保存到存储: ${key}`)
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('保存失败:', error)
    }
  })

  // 监听加载请求
  on<LoadFromStorageHandler>('LOAD_FROM_STORAGE', async (key: string) => {
    try {
      const value = await figma.clientStorage.getAsync(key)
      emit<StorageDataHandler>('STORAGE_DATA', { key, value })
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('加载失败:', error)
    }
  })
  
  // 监听加载设置请求
  on<LoadSettingsHandler>('LOAD_SETTINGS', async () => {
    try {
      const config = await StorageManager.getChartConfig()
      const format = await StorageManager.getLastFormat()
      const history = await StorageManager.getHistory()
      
      emit<SettingsLoadedHandler>('SETTINGS_LOADED', {
        config,
        format,
        history
      })
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('加载设置失败:', error)
    }
  })
  
  // 监听添加历史记录请求
  on<AddToHistoryHandler>('ADD_TO_HISTORY', async (item) => {
    try {
      await StorageManager.addToHistory(item)
      // eslint-disable-next-line no-console
      console.log('已添加到历史记录')
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('添加历史记录失败:', error)
    }
  })
  
  // 监听清除历史记录请求
  on<ClearHistoryHandler>('CLEAR_HISTORY', async () => {
    try {
      await StorageManager.clearHistory()
      // eslint-disable-next-line no-console
      console.log('历史记录已清除')
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('清除历史记录失败:', error)
    }
  })
  
  // 监听删除历史记录项请求
  on<DeleteHistoryItemHandler>('DELETE_HISTORY_ITEM', async (id: string) => {
    try {
      await StorageManager.removeFromHistory(id)
      // eslint-disable-next-line no-console
      console.log('历史记录项已删除:', id)
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('删除历史记录项失败:', error)
    }
  })

  // 显示插件 UI
  showUI({
    height: 700,
    width: 440,  // 增加宽度以适应中文布局
    title: '📊 ChartDreamer - 桑基图生成器'
  })
}

/**
 * 解析输入数据
 */
function parseData(data: string, format: DataFormat): SankeyData {
  try {
    switch (format) {
      case DataFormat.JSON:
        return parseJsonData(data)
      case DataFormat.CSV:
        return parseCsvData(data)
      case DataFormat.TSV:
        return parseTsvData(data)
      default:
        throw { type: 'parse', message: '不支持的数据格式' }
    }
  } catch (error: any) {
    throw {
      type: 'parse',
      message: `数据解析失败: ${error.message || '格式错误'}`,
      details: error
    }
  }
}

/**
 * 解析JSON格式数据
 */
function parseJsonData(data: string): SankeyData {
  const parsed = JSON.parse(data)
  
  if (!parsed.nodes || !parsed.links) {
    throw new Error('JSON数据必须包含nodes和links字段')
  }
  
  return {
    nodes: parsed.nodes,
    links: parsed.links
  }
}

/**
 * 解析CSV格式数据
 */
function parseCsvData(data: string): SankeyData {
  const lines = data.trim().split('\n')
  
  if (lines.length < 2) {
    throw new Error('CSV数据至少需要包含表头和一行数据')
  }
  
  const headers = lines[0].split(',').map(h => h.trim())
  
  if (!headers.includes('source') || !headers.includes('target') || !headers.includes('value')) {
    throw new Error('CSV表头必须包含source, target, value字段')
  }
  
  const sourceIdx = headers.indexOf('source')
  const targetIdx = headers.indexOf('target')
  const valueIdx = headers.indexOf('value')
  
  const links: any[] = []
  const nodeSet = new Set<string>()
  
  for (let i = 1; i < lines.length; i++) {
    const cells = lines[i].split(',').map(c => c.trim())
    
    if (cells.length >= 3) {
      const source = cells[sourceIdx]
      const target = cells[targetIdx]
      const value = parseFloat(cells[valueIdx])
      
      if (source && target && !isNaN(value)) {
        links.push({ source, target, value })
        nodeSet.add(source)
        nodeSet.add(target)
      }
    }
  }
  
  const nodes = Array.from(nodeSet).map(id => ({
    id,
    name: id,
    value: 0 // 将在D3计算中更新
  }))
  
  return { nodes, links }
}

/**
 * 解析TSV格式数据
 */
function parseTsvData(data: string): SankeyData {
  // 将TSV转换为CSV格式，然后复用CSV解析器
  const csvData = data.replace(/\t/g, ',')
  return parseCsvData(csvData)
}

/**
 * 验证桑基图数据
 */
function validateSankeyData(data: SankeyData): void {
  // 验证节点
  if (!data.nodes || data.nodes.length === 0) {
    throw {
      type: 'validation',
      message: '数据中没有节点'
    }
  }
  
  // 验证链接
  if (!data.links || data.links.length === 0) {
    throw {
      type: 'validation',
      message: '数据中没有链接'
    }
  }
  
  // 创建节点ID集合
  const nodeIds = new Set(data.nodes.map(n => n.id))
  
  // 验证所有链接的源和目标都存在
  for (const link of data.links) {
    if (!nodeIds.has(link.source)) {
      throw {
        type: 'validation',
        message: `链接的源节点 "${link.source}" 不存在`
      }
    }
    
    if (!nodeIds.has(link.target)) {
      throw {
        type: 'validation',
        message: `链接的目标节点 "${link.target}" 不存在`
      }
    }
    
    if (typeof link.value !== 'number' || link.value <= 0) {
      throw {
        type: 'validation',
        message: `链接的值必须是正数，当前值: ${link.value}`
      }
    }
  }
  
  // 检查是否有自循环
  for (const link of data.links) {
    if (link.source === link.target) {
      throw {
        type: 'validation',
        message: `检测到自循环: ${link.source} -> ${link.target}`
      }
    }
  }
}
