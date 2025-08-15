/**
 * 示例数据模板
 * 提供多个预设的桑基图数据示例
 */

import { SankeyData } from '../types/sankey.types';

export interface ExampleData {
  id: string;
  name: string;
  description: string;
  data: SankeyData;
}

export const exampleDataTemplates: ExampleData[] = [
  {
    id: 'energy-flow',
    name: '能源流动',
    description: '展示能源从生产到消费的流动过程',
    data: {
      nodes: [
        { id: 'coal', name: '煤炭', value: 100 },
        { id: 'gas', name: '天然气', value: 80 },
        { id: 'solar', name: '太阳能', value: 30 },
        { id: 'power', name: '电力', value: 150 },
        { id: 'industry', name: '工业', value: 70 },
        { id: 'residential', name: '居民', value: 50 },
        { id: 'commercial', name: '商业', value: 30 }
      ],
      links: [
        { source: 'coal', target: 'power', value: 100 },
        { source: 'gas', target: 'power', value: 50 },
        { source: 'gas', target: 'industry', value: 30 },
        { source: 'solar', target: 'power', value: 30 },
        { source: 'power', target: 'industry', value: 40 },
        { source: 'power', target: 'residential', value: 50 },
        { source: 'power', target: 'commercial', value: 30 }
      ]
    }
  },
  {
    id: 'user-journey',
    name: '用户路径',
    description: '展示用户在网站或应用中的行为路径',
    data: {
      nodes: [
        { id: 'homepage', name: '首页', value: 1000 },
        { id: 'product', name: '产品页', value: 600 },
        { id: 'search', name: '搜索', value: 300 },
        { id: 'cart', name: '购物车', value: 400 },
        { id: 'checkout', name: '结账', value: 200 },
        { id: 'success', name: '成功', value: 150 },
        { id: 'exit', name: '退出', value: 550 }
      ],
      links: [
        { source: 'homepage', target: 'product', value: 400 },
        { source: 'homepage', target: 'search', value: 300 },
        { source: 'homepage', target: 'exit', value: 300 },
        { source: 'product', target: 'cart', value: 300 },
        { source: 'product', target: 'exit', value: 100 },
        { source: 'search', target: 'product', value: 200 },
        { source: 'search', target: 'exit', value: 100 },
        { source: 'cart', target: 'checkout', value: 200 },
        { source: 'cart', target: 'exit', value: 100 },
        { source: 'checkout', target: 'success', value: 150 },
        { source: 'checkout', target: 'exit', value: 50 }
      ]
    }
  },
  {
    id: 'budget-flow',
    name: '预算分配',
    description: '展示公司或组织的预算分配流向',
    data: {
      nodes: [
        { id: 'revenue', name: '总收入', value: 1000 },
        { id: 'sales', name: '销售部', value: 300 },
        { id: 'rd', name: '研发部', value: 400 },
        { id: 'marketing', name: '市场部', value: 200 },
        { id: 'admin', name: '行政部', value: 100 },
        { id: 'salaries', name: '工资', value: 500 },
        { id: 'equipment', name: '设备', value: 200 },
        { id: 'operations', name: '运营', value: 300 }
      ],
      links: [
        { source: 'revenue', target: 'sales', value: 300 },
        { source: 'revenue', target: 'rd', value: 400 },
        { source: 'revenue', target: 'marketing', value: 200 },
        { source: 'revenue', target: 'admin', value: 100 },
        { source: 'sales', target: 'salaries', value: 200 },
        { source: 'sales', target: 'operations', value: 100 },
        { source: 'rd', target: 'salaries', value: 250 },
        { source: 'rd', target: 'equipment', value: 150 },
        { source: 'marketing', target: 'operations', value: 150 },
        { source: 'marketing', target: 'salaries', value: 50 },
        { source: 'admin', target: 'equipment', value: 50 },
        { source: 'admin', target: 'operations', value: 50 }
      ]
    }
  },
  {
    id: 'supply-chain',
    name: '供应链流程',
    description: '展示从原材料到最终产品的供应链流程',
    data: {
      nodes: [
        { id: 'raw-materials', name: '原材料', value: 500 },
        { id: 'supplier-a', name: '供应商A', value: 200 },
        { id: 'supplier-b', name: '供应商B', value: 300 },
        { id: 'manufacturer', name: '制造商', value: 450 },
        { id: 'warehouse', name: '仓库', value: 400 },
        { id: 'distributor', name: '分销商', value: 350 },
        { id: 'retailer', name: '零售商', value: 300 },
        { id: 'customer', name: '最终客户', value: 280 }
      ],
      links: [
        { source: 'raw-materials', target: 'supplier-a', value: 200 },
        { source: 'raw-materials', target: 'supplier-b', value: 300 },
        { source: 'supplier-a', target: 'manufacturer', value: 180 },
        { source: 'supplier-b', target: 'manufacturer', value: 270 },
        { source: 'manufacturer', target: 'warehouse', value: 400 },
        { source: 'warehouse', target: 'distributor', value: 350 },
        { source: 'distributor', target: 'retailer', value: 300 },
        { source: 'retailer', target: 'customer', value: 280 },
        { source: 'supplier-a', target: 'warehouse', value: 20 },
        { source: 'supplier-b', target: 'distributor', value: 30 },
        { source: 'warehouse', target: 'retailer', value: 50 },
        { source: 'distributor', target: 'customer', value: 20 }
      ]
    }
  },
  {
    id: 'content-spread',
    name: '内容传播路径',
    description: '展示内容在不同平台和渠道的传播路径',
    data: {
      nodes: [
        { id: 'original', name: '原创内容', value: 1000 },
        { id: 'website', name: '官网', value: 400 },
        { id: 'social-media', name: '社交媒体', value: 600 },
        { id: 'email', name: '邮件营销', value: 200 },
        { id: 'wechat', name: '微信', value: 350 },
        { id: 'weibo', name: '微博', value: 250 },
        { id: 'video-platform', name: '视频平台', value: 300 },
        { id: 'engagement', name: '用户互动', value: 500 },
        { id: 'conversion', name: '转化', value: 200 }
      ],
      links: [
        { source: 'original', target: 'website', value: 400 },
        { source: 'original', target: 'social-media', value: 400 },
        { source: 'original', target: 'email', value: 200 },
        { source: 'social-media', target: 'wechat', value: 200 },
        { source: 'social-media', target: 'weibo', value: 150 },
        { source: 'social-media', target: 'video-platform', value: 250 },
        { source: 'website', target: 'engagement', value: 200 },
        { source: 'wechat', target: 'engagement', value: 150 },
        { source: 'weibo', target: 'engagement', value: 100 },
        { source: 'video-platform', target: 'engagement', value: 150 },
        { source: 'email', target: 'engagement', value: 100 },
        { source: 'engagement', target: 'conversion', value: 200 },
        { source: 'website', target: 'conversion', value: 50 },
        { source: 'wechat', target: 'conversion', value: 50 },
        { source: 'email', target: 'conversion', value: 50 },
        { source: 'video-platform', target: 'conversion', value: 50 }
      ]
    }
  }
];

/**
 * 将示例数据转换为JSON字符串
 */
export function getExampleDataAsJson(id: string): string {
  const example = exampleDataTemplates.find(e => e.id === id);
  if (!example) {
    return '';
  }
  return JSON.stringify(example.data, null, 2);
}

/**
 * 将示例数据转换为CSV字符串
 */
export function getExampleDataAsCsv(id: string): string {
  const example = exampleDataTemplates.find(e => e.id === id);
  if (!example) {
    return '';
  }
  
  const lines = ['source,target,value'];
  example.data.links.forEach(link => {
    lines.push(`${link.source},${link.target},${link.value}`);
  });
  
  return lines.join('\n');
}

/**
 * 将示例数据转换为TSV字符串
 */
export function getExampleDataAsTsv(id: string): string {
  const example = exampleDataTemplates.find(e => e.id === id);
  if (!example) {
    return '';
  }
  
  const lines = ['source\ttarget\tvalue'];
  example.data.links.forEach(link => {
    lines.push(`${link.source}\t${link.target}\t${link.value}`);
  });
  
  return lines.join('\n');
}
