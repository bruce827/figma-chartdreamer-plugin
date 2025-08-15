/** @jsx h */
import { h, Fragment } from 'preact';
import { memo } from 'preact/compat';
import { useState, useCallback, useEffect, useMemo } from 'preact/hooks';
import {
  TextboxMultiline,
  Text,
  Bold,
  VerticalSpace,
  SegmentedControl,
  SegmentedControlOption,
  Muted,
  IconInfo16,
  IconWarning16,
  Banner
} from '@create-figma-plugin/ui';
import { DataFormat } from '../types/sankey.types';
import { validateInput, ValidationResult } from '../utils/validation';
import { useDebouncedCallback } from '../hooks/usePerformance';

interface DataInputOptimizedProps {
  value: string;
  format: DataFormat;
  onDataChange: (data: string) => void;
  onFormatChange: (format: DataFormat) => void;
  onValidationChange?: (result: ValidationResult) => void;
  error?: string | null;
}

/**
 * 性能监控组件
 */
const PerformanceWarning = memo(({ nodeCount, linkCount }: { nodeCount: number; linkCount: number }) => {
  const totalElements = nodeCount + linkCount;
  const showWarning = totalElements > 100;
  const showError = totalElements > 500;
  
  if (!showWarning) return null;
  
  return (
    <>
      <VerticalSpace space="small" />
      <Banner 
        icon={<IconWarning16 />} 
        variant="warning"
      >
        {showError ? (
          <Text>
            <Bold>性能警告：</Bold> 数据量较大（{nodeCount}个节点，{linkCount}条连接），
            生成可能需要较长时间。建议减少数据量以获得更好的性能。
          </Text>
        ) : (
          <Text>
            <Muted>
              提示：当前有{nodeCount}个节点和{linkCount}条连接，数据量适中。
            </Muted>
          </Text>
        )}
      </Banner>
    </>
  );
});

/**
 * 优化的数据输入组件
 * 使用 memo 和防抖优化性能
 */
export const DataInputOptimized = memo(function DataInputOptimized({
  value,
  format,
  onDataChange,
  onFormatChange,
  onValidationChange,
  error
}: DataInputOptimizedProps) {
  // 本地验证状态
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [dataStats, setDataStats] = useState({ nodeCount: 0, linkCount: 0 });
  
  // 格式选项
  const formatOptions: SegmentedControlOption[] = useMemo(() => [
    { value: DataFormat.JSON, children: 'JSON' },
    { value: DataFormat.CSV, children: 'CSV' },
    { value: DataFormat.TSV, children: 'TSV' }
  ], []);

  // 计算数据统计
  const calculateStats = useCallback((input: string, fmt: DataFormat) => {
    try {
      if (fmt === DataFormat.JSON && input.trim()) {
        const data = JSON.parse(input);
        setDataStats({
          nodeCount: data.nodes?.length || 0,
          linkCount: data.links?.length || 0
        });
      } else if ((fmt === DataFormat.CSV || fmt === DataFormat.TSV) && input.trim()) {
        const lines = input.trim().split('\n').filter(line => line.trim());
        // 减去标题行
        const linkCount = Math.max(0, lines.length - 1);
        // 估算节点数（简化计算）
        const nodeCount = Math.min(linkCount * 2, Math.ceil(linkCount * 1.5));
        setDataStats({ nodeCount, linkCount });
      } else {
        setDataStats({ nodeCount: 0, linkCount: 0 });
      }
    } catch {
      // 忽略解析错误，保持之前的统计
    }
  }, []);

  // 创建防抖验证函数
  const validateData = useCallback((input: string, fmt: DataFormat) => {
    if (!input.trim()) {
      setValidationResult(null);
      setIsValidating(false);
      setDataStats({ nodeCount: 0, linkCount: 0 });
      if (onValidationChange) {
        onValidationChange({ isValid: true });
      }
      return;
    }
    
    const result = validateInput(input, fmt);
    setValidationResult(result);
    setIsValidating(false);
    calculateStats(input, fmt);
    
    if (onValidationChange) {
      onValidationChange(result);
    }
  }, [calculateStats, onValidationChange]);

  // 使用防抖Hook
  const debouncedValidate = useDebouncedCallback(validateData, 300, []);

  // 当值或格式改变时进行验证
  useEffect(() => {
    if (value.trim()) {
      setIsValidating(true);
      debouncedValidate(value, format);
    } else {
      setValidationResult(null);
      setIsValidating(false);
      setDataStats({ nodeCount: 0, linkCount: 0 });
    }
  }, [value, format, debouncedValidate]);

  // 处理格式变化
  const handleFormatChange = useCallback((event: any) => {
    setValidationResult(null);
    setDataStats({ nodeCount: 0, linkCount: 0 });
    onFormatChange(event.currentTarget.value as DataFormat);
  }, [onFormatChange]);

  // 获取格式对应的placeholder（使用memo优化）
  const placeholder = useMemo(() => {
    switch (format) {
      case DataFormat.JSON:
        return `{
  "nodes": [
    {"id": "A", "name": "节点A"},
    {"id": "B", "name": "节点B"},
    {"id": "C", "name": "节点C"}
  ],
  "links": [
    {"source": "A", "target": "B", "value": 10},
    {"source": "A", "target": "C", "value": 5}
  ]
}`;
      case DataFormat.CSV:
        return `source,target,value
A,B,10
A,C,5
B,C,3`;
      case DataFormat.TSV:
        return `source\ttarget\tvalue
A\tB\t10
A\tC\t5
B\tC\t3`;
      default:
        return '';
    }
  }, [format]);

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Text>
          <Bold>数据输入</Bold>
          {dataStats.nodeCount > 0 && (
            <Muted> ({dataStats.nodeCount}节点, {dataStats.linkCount}连接)</Muted>
          )}
        </Text>
        {isValidating && (
          <Text>
            <Muted>验证中...</Muted>
          </Text>
        )}
      </div>
      <VerticalSpace space="small" />
      
      {/* 格式选择 */}
      <SegmentedControl
        onChange={handleFormatChange}
        options={formatOptions}
        value={format}
      />
      
      <VerticalSpace space="medium" />
      
      {/* 性能警告 */}
      {validationResult?.isValid && (
        <PerformanceWarning 
          nodeCount={dataStats.nodeCount} 
          linkCount={dataStats.linkCount} 
        />
      )}
      
      {/* 数据输入框 */}
      <div style={{ position: 'relative' }}>
        <TextboxMultiline
          onValueInput={onDataChange}
          placeholder={placeholder}
          rows={12}
          value={value}
        />
        
        {/* 验证状态指示器 */}
        {value.trim() && !isValidating && (
          <div style={{ 
            position: 'absolute', 
            top: '8px', 
            right: '8px',
            pointerEvents: 'none'
          }}>
            {validationResult?.isValid ? (
              <span style={{ color: '#10b981' }}>✓</span>
            ) : (
              validationResult && <IconWarning16 style={{ color: '#f59e0b' }} />
            )}
          </div>
        )}
      </div>
      
      {/* 验证错误提示 */}
      {validationResult && !validationResult.isValid && (
        <>
          <VerticalSpace space="small" />
          <div style={{ 
            padding: '8px', 
            backgroundColor: '#fef2f2', 
            borderRadius: '4px',
            border: '1px solid #fee2e2'
          }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
              <IconWarning16 style={{ color: '#ef4444', flexShrink: 0, marginTop: '2px' }} />
              <div style={{ flex: 1 }}>
                <Text>
                  <Muted style={{ color: '#ef4444', fontWeight: 500 }}>
                    {validationResult.error}
                  </Muted>
                </Text>
                {validationResult.suggestion && (
                  <>
                    <VerticalSpace space="extraSmall" />
                    <Text>
                      <Muted style={{ color: '#71717a', fontSize: '12px' }}>
                        💡 {validationResult.suggestion}
                      </Muted>
                    </Text>
                  </>
                )}
              </div>
            </div>
          </div>
        </>
      )}
      
      {/* 外部错误提示 */}
      {error && !validationResult && (
        <>
          <VerticalSpace space="small" />
          <div style={{ 
            padding: '8px', 
            backgroundColor: '#fef2f2', 
            borderRadius: '4px',
            border: '1px solid #fee2e2'
          }}>
            <Text>
              <Muted style={{ color: '#ef4444' }}>{error}</Muted>
            </Text>
          </div>
        </>
      )}
      
      {/* 格式提示 */}
      {!value.trim() && !error && !validationResult && (
        <>
          <VerticalSpace space="small" />
          <div style={{ 
            padding: '8px', 
            backgroundColor: '#f0f9ff', 
            borderRadius: '4px',
            border: '1px solid #e0f2fe'
          }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
              <IconInfo16 style={{ color: '#0ea5e9', flexShrink: 0, marginTop: '2px' }} />
              <Text>
                <Muted style={{ fontSize: '12px' }}>
                  {format === DataFormat.JSON && '请输入包含nodes和links的JSON数据'}
                  {format === DataFormat.CSV && '请输入CSV格式数据，第一行为标题：source,target,value'}
                  {format === DataFormat.TSV && '请输入TSV格式数据，使用Tab分隔，第一行为标题'}
                </Muted>
              </Text>
            </div>
          </div>
        </>
      )}
    </div>
  );
});

// 设置显示名称
DataInputOptimized.displayName = 'DataInputOptimized';
