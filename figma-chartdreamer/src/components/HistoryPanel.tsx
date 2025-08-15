/** @jsx h */
import { h, Fragment } from 'preact';
import { useState, useEffect } from 'preact/hooks';
import {
  Text,
  Bold,
  Muted,
  Button,
  VerticalSpace,
  IconFrame16,
  Divider
} from '@create-figma-plugin/ui';
import { HistoryItem } from '../utils/storage';
import { ChartConfig, DataFormat } from '../types/sankey.types';

interface HistoryPanelProps {
  history: HistoryItem[];
  onLoad: (item: HistoryItem) => void;
  onDelete: (id: string) => void;
  onClear: () => void;
}

/**
 * 历史记录面板组件
 */
export function HistoryPanel({ history, onLoad, onDelete, onClear }: HistoryPanelProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // 格式化时间戳
  const formatTimestamp = (timestamp: number): string => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    
    // 小于1分钟
    if (diff < 60000) {
      return '刚刚';
    }
    
    // 小于1小时
    if (diff < 3600000) {
      const minutes = Math.floor(diff / 60000);
      return `${minutes}分钟前`;
    }
    
    // 小于24小时
    if (diff < 86400000) {
      const hours = Math.floor(diff / 3600000);
      return `${hours}小时前`;
    }
    
    // 小于7天
    if (diff < 604800000) {
      const days = Math.floor(diff / 86400000);
      return `${days}天前`;
    }
    
    // 显示具体日期
    return date.toLocaleDateString();
  };

  // 切换展开状态
  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  // 格式标签
  const getFormatLabel = (format: DataFormat): string => {
    switch (format) {
      case DataFormat.JSON:
        return 'JSON';
      case DataFormat.CSV:
        return 'CSV';
      case DataFormat.TSV:
        return 'TSV';
      default:
        return '未知';
    }
  };

  if (history.length === 0) {
    return (
      <div style={{ 
        padding: '16px', 
        textAlign: 'center',
        backgroundColor: '#f9fafb',
        borderRadius: '4px'
      }}>
        <IconFrame16 style={{ color: '#9ca3af', marginBottom: '8px' }} />
        <Text>
          <Muted>暂无历史记录</Muted>
        </Text>
        <VerticalSpace space="small" />
        <Text>
          <Muted style={{ fontSize: '12px' }}>
            生成图表后会自动保存到历史记录
          </Muted>
        </Text>
      </div>
    );
  }

  return (
    <div>
      {/* 标题栏 */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '12px'
      }}>
        <Text>
          <Bold>历史记录</Bold>
          <Muted> ({history.length}/10)</Muted>
        </Text>
        {history.length > 0 && (
          <Button 
            onClick={onClear}
            secondary
            style={{ fontSize: '12px', padding: '4px 8px' }}
          >
            清除全部
          </Button>
        )}
      </div>

      {/* 历史记录列表 */}
      <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
        {history.map((item, index) => (
          <Fragment key={item.id}>
            {index > 0 && <Divider />}
            <div style={{ 
              padding: '8px',
              backgroundColor: expandedId === item.id ? '#f3f4f6' : 'transparent',
              borderRadius: '4px',
              transition: 'background-color 0.2s'
            }}>
              {/* 记录头部 */}
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                cursor: 'pointer'
              }}
              onClick={() => toggleExpand(item.id)}
              >
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Text>
                      <Bold>{item.name}</Bold>
                    </Text>
                    <span style={{ 
                      padding: '2px 6px',
                      backgroundColor: '#e5e7eb',
                      borderRadius: '3px',
                      fontSize: '11px',
                      color: '#6b7280'
                    }}>
                      {getFormatLabel(item.format)}
                    </span>
                  </div>
                  <Text>
                    <Muted style={{ fontSize: '12px' }}>
                      {formatTimestamp(item.timestamp)}
                    </Muted>
                  </Text>
                </div>
                
                {/* 操作按钮 */}
                <div style={{ display: 'flex', gap: '4px' }}>
                  <Button
                    onClick={(e: Event) => {
                      e.stopPropagation();
                      onLoad(item);
                    }}
                    secondary
                    style={{ fontSize: '12px', padding: '4px 8px' }}
                  >
                    加载
                  </Button>
                  <Button
                    onClick={(e: Event) => {
                      e.stopPropagation();
                      onDelete(item.id);
                    }}
                    secondary
                    style={{ fontSize: '12px', padding: '4px 8px' }}
                  >
                    删除
                  </Button>
                </div>
              </div>

              {/* 展开的详细信息 */}
              {expandedId === item.id && (
                <>
                  <VerticalSpace space="small" />
                  <div style={{ 
                    padding: '8px',
                    backgroundColor: 'white',
                    borderRadius: '4px',
                    fontSize: '12px'
                  }}>
                    {/* 配置信息 */}
                    <div style={{ marginBottom: '8px' }}>
                      <Text>
                        <Muted>配置信息：</Muted>
                      </Text>
                      <div style={{ 
                        display: 'grid', 
                        gridTemplateColumns: 'repeat(2, 1fr)',
                        gap: '4px',
                        marginTop: '4px'
                      }}>
                        <Text>
                          <Muted>• 节点颜色: </Muted>
                          <span style={{ 
                            display: 'inline-block',
                            width: '12px',
                            height: '12px',
                            backgroundColor: item.config.nodeColor,
                            borderRadius: '2px',
                            verticalAlign: 'middle'
                          }} />
                        </Text>
                        <Text>
                          <Muted>• 连接颜色: </Muted>
                          <span style={{ 
                            display: 'inline-block',
                            width: '12px',
                            height: '12px',
                            backgroundColor: item.config.linkColor,
                            borderRadius: '2px',
                            verticalAlign: 'middle'
                          }} />
                        </Text>
                        <Text>
                          <Muted>• 尺寸: {item.config.width}×{item.config.height}</Muted>
                        </Text>
                        <Text>
                          <Muted>• 主题: {item.config.theme}</Muted>
                        </Text>
                      </div>
                    </div>

                    {/* 数据预览 */}
                    <div>
                      <Text>
                        <Muted>数据预览：</Muted>
                      </Text>
                      <div style={{ 
                        marginTop: '4px',
                        padding: '4px',
                        backgroundColor: '#f9fafb',
                        borderRadius: '2px',
                        fontFamily: 'monospace',
                        fontSize: '11px',
                        maxHeight: '60px',
                        overflowY: 'auto',
                        whiteSpace: 'pre-wrap',
                        wordBreak: 'break-all'
                      }}>
                        {item.data.substring(0, 150)}
                        {item.data.length > 150 && '...'}
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </Fragment>
        ))}
      </div>
    </div>
  );
}
