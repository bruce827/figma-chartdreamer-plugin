import { DataFormat } from '../types/sankey.types';

/**
 * 验证结果接口
 */
export interface ValidationResult {
  isValid: boolean;
  error?: string;
  suggestion?: string;
}

/**
 * 验证JSON格式的数据
 */
export function validateJSON(input: string): ValidationResult {
  if (!input.trim()) {
    return { 
      isValid: false, 
      error: '请输入JSON数据',
      suggestion: '输入包含nodes和links的JSON对象' 
    };
  }

  try {
    const data = JSON.parse(input);
    
    // 检查是否有nodes和links
    if (!data.nodes || !data.links) {
      return {
        isValid: false,
        error: '缺少必需的字段',
        suggestion: 'JSON数据必须包含 "nodes" 和 "links" 数组'
      };
    }

    // 检查nodes是否为数组
    if (!Array.isArray(data.nodes)) {
      return {
        isValid: false,
        error: '"nodes" 必须是数组',
        suggestion: '请确保 nodes 字段是一个数组'
      };
    }

    // 检查links是否为数组
    if (!Array.isArray(data.links)) {
      return {
        isValid: false,
        error: '"links" 必须是数组',
        suggestion: '请确保 links 字段是一个数组'
      };
    }

    // 检查nodes是否为空
    if (data.nodes.length === 0) {
      return {
        isValid: false,
        error: '节点列表不能为空',
        suggestion: '至少添加一个节点'
      };
    }

    // 检查links是否为空
    if (data.links.length === 0) {
      return {
        isValid: false,
        error: '连接列表不能为空',
        suggestion: '至少添加一个连接'
      };
    }

    // 验证每个节点的结构
    for (let i = 0; i < data.nodes.length; i++) {
      const node = data.nodes[i];
      if (!node.id && !node.name) {
        return {
          isValid: false,
          error: `节点 ${i + 1} 缺少 id 或 name 字段`,
          suggestion: '每个节点必须有 id 或 name 字段'
        };
      }
    }

    // 验证每个连接的结构
    for (let i = 0; i < data.links.length; i++) {
      const link = data.links[i];
      if (!link.source) {
        return {
          isValid: false,
          error: `连接 ${i + 1} 缺少 source 字段`,
          suggestion: '每个连接必须有 source 字段'
        };
      }
      if (!link.target) {
        return {
          isValid: false,
          error: `连接 ${i + 1} 缺少 target 字段`,
          suggestion: '每个连接必须有 target 字段'
        };
      }
      if (link.value === undefined || link.value === null) {
        return {
          isValid: false,
          error: `连接 ${i + 1} 缺少 value 字段`,
          suggestion: '每个连接必须有 value 字段'
        };
      }
      if (typeof link.value !== 'number' || link.value <= 0) {
        return {
          isValid: false,
          error: `连接 ${i + 1} 的 value 必须是正数`,
          suggestion: 'value 字段必须是大于0的数字'
        };
      }
    }

    return { isValid: true };
  } catch (e) {
    // 尝试提供更具体的JSON语法错误提示
    const errorMessage = e instanceof Error ? e.message : '未知错误';
    
    // 解析常见的JSON错误
    if (errorMessage.includes('Unexpected token')) {
      const match = errorMessage.match(/position (\d+)/);
      const position = match ? parseInt(match[1]) : null;
      
      if (errorMessage.includes('Unexpected token }')) {
        return {
          isValid: false,
          error: 'JSON语法错误：多余的 }',
          suggestion: '检查是否有多余的右花括号或缺少逗号'
        };
      } else if (errorMessage.includes('Unexpected token ]')) {
        return {
          isValid: false,
          error: 'JSON语法错误：多余的 ]',
          suggestion: '检查是否有多余的右方括号或缺少逗号'
        };
      } else if (errorMessage.includes('Unexpected token ,')) {
        return {
          isValid: false,
          error: 'JSON语法错误：多余的逗号',
          suggestion: '检查是否在最后一个元素后面添加了逗号'
        };
      }
    }
    
    if (errorMessage.includes('Unexpected end of JSON input')) {
      return {
        isValid: false,
        error: 'JSON格式不完整',
        suggestion: '检查是否缺少闭合的括号或引号'
      };
    }

    if (errorMessage.includes('Unterminated string')) {
      return {
        isValid: false,
        error: 'JSON语法错误：字符串未闭合',
        suggestion: '检查是否有未闭合的引号'
      };
    }

    return {
      isValid: false,
      error: `JSON格式错误`,
      suggestion: '请确保输入的是有效的JSON格式'
    };
  }
}

/**
 * 验证CSV格式的数据
 */
export function validateCSV(input: string): ValidationResult {
  if (!input.trim()) {
    return { 
      isValid: false, 
      error: '请输入CSV数据',
      suggestion: '输入包含source,target,value的CSV数据' 
    };
  }

  const lines = input.trim().split('\n').filter(line => line.trim());
  
  if (lines.length < 2) {
    return {
      isValid: false,
      error: 'CSV数据至少需要包含标题行和一行数据',
      suggestion: '添加标题行（source,target,value）和至少一行数据'
    };
  }

  // 检查标题行
  const header = lines[0].toLowerCase().replace(/\s/g, '');
  const expectedHeaders = ['source,target,value', 'from,to,value', 'source,target,weight'];
  
  if (!expectedHeaders.some(h => header.includes(h.replace(/,/g, '')))) {
    return {
      isValid: false,
      error: '标题行格式不正确',
      suggestion: '标题行应该包含 source,target,value 或类似字段'
    };
  }

  // 验证数据行
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    
    const values = line.split(',').map(v => v.trim());
    
    if (values.length < 3) {
      return {
        isValid: false,
        error: `第 ${i + 1} 行数据不完整`,
        suggestion: '每行数据必须包含三个字段：source,target,value'
      };
    }

    // 检查第三个字段是否为数字
    const value = parseFloat(values[2]);
    if (isNaN(value) || value <= 0) {
      return {
        isValid: false,
        error: `第 ${i + 1} 行的值必须是正数`,
        suggestion: 'value字段必须是大于0的数字'
      };
    }

    // 检查source和target是否为空
    if (!values[0] || !values[1]) {
      return {
        isValid: false,
        error: `第 ${i + 1} 行的source或target为空`,
        suggestion: '确保每行都有有效的source和target值'
      };
    }
  }

  return { isValid: true };
}

/**
 * 验证TSV格式的数据
 */
export function validateTSV(input: string): ValidationResult {
  if (!input.trim()) {
    return { 
      isValid: false, 
      error: '请输入TSV数据',
      suggestion: '输入包含source\\ttarget\\tvalue的TSV数据' 
    };
  }

  const lines = input.trim().split('\n').filter(line => line.trim());
  
  if (lines.length < 2) {
    return {
      isValid: false,
      error: 'TSV数据至少需要包含标题行和一行数据',
      suggestion: '添加标题行（source\\ttarget\\tvalue）和至少一行数据'
    };
  }

  // 检查标题行
  const header = lines[0].toLowerCase().replace(/\s/g, '');
  const expectedHeaders = ['source\ttarget\tvalue', 'from\tto\tvalue', 'source\ttarget\tweight'];
  
  if (!expectedHeaders.some(h => header.includes(h.replace(/\t/g, '')))) {
    return {
      isValid: false,
      error: '标题行格式不正确',
      suggestion: '标题行应该包含 source\\ttarget\\tvalue（用Tab分隔）'
    };
  }

  // 验证数据行
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    
    const values = line.split('\t').map(v => v.trim());
    
    if (values.length < 3) {
      return {
        isValid: false,
        error: `第 ${i + 1} 行数据不完整`,
        suggestion: '每行数据必须包含三个Tab分隔的字段'
      };
    }

    // 检查第三个字段是否为数字
    const value = parseFloat(values[2]);
    if (isNaN(value) || value <= 0) {
      return {
        isValid: false,
        error: `第 ${i + 1} 行的值必须是正数`,
        suggestion: 'value字段必须是大于0的数字'
      };
    }

    // 检查source和target是否为空
    if (!values[0] || !values[1]) {
      return {
        isValid: false,
        error: `第 ${i + 1} 行的source或target为空`,
        suggestion: '确保每行都有有效的source和target值'
      };
    }
  }

  return { isValid: true };
}

/**
 * 根据格式验证输入数据
 */
export function validateInput(input: string, format: DataFormat): ValidationResult {
  switch (format) {
    case DataFormat.JSON:
      return validateJSON(input);
    case DataFormat.CSV:
      return validateCSV(input);
    case DataFormat.TSV:
      return validateTSV(input);
    default:
      return { isValid: false, error: '未知的数据格式' };
  }
}

/**
 * 防抖函数
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null;
  
  return function (...args: Parameters<T>) {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => {
      func(...args);
    }, wait);
  };
}
