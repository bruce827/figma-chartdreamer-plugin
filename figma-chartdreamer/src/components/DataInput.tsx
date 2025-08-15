/** @jsx h */
import { h, Fragment } from 'preact';
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
  IconWarning16
} from '@create-figma-plugin/ui';
import { DataFormat } from '../types/sankey.types';
import { validateInput, debounce, ValidationResult } from '../utils/validation';

interface DataInputProps {
  value: string;
  format: DataFormat;
  onDataChange: (data: string) => void;
  onFormatChange: (format: DataFormat) => void;
  onValidationChange?: (result: ValidationResult) => void;
  error?: string | null;
}

/**
 * 数据输入组件
 * 支持JSON、CSV、TSV格式的数据输入
 */
export function DataInput({
  value,
  format,
  onDataChange,
  onFormatChange,
  onValidationChange,
  error
}: DataInputProps) {
  // 本地验证状态
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  
  // 格式选项
  const formatOptions: SegmentedControlOption[] = [
    { value: DataFormat.JSON, children: 'JSON' },
    { value: DataFormat.CSV, children: 'CSV' },
    { value: DataFormat.TSV, children: 'TSV' }
  ];

  // 创建防抖验证函数
  const debouncedValidate = useMemo(
    () => debounce((input: string, fmt: DataFormat) => {
      if (!input.trim()) {
        setValidationResult(null);
        setIsValidating(false);
        if (onValidationChange) {
          onValidationChange({ isValid: true }); // 空输入不算错误
        }
        return;
      }
      
      const result = validateInput(input, fmt);
      setValidationResult(result);
      setIsValidating(false);
      
      if (onValidationChange) {
        onValidationChange(result);
      }
    }, 500),
    [onValidationChange]
  );

  // 当值或格式改变时进行验证
  useEffect(() => {
    if (value.trim()) {
      setIsValidating(true);
      debouncedValidate(value, format);
    } else {
      setValidationResult(null);
      setIsValidating(false);
    }
  }, [value, format, debouncedValidate]);

  // 处理格式变化
  const handleFormatChange = useCallback((event: any) => {
    setValidationResult(null); // 清除验证结果
    onFormatChange(event.currentTarget.value as DataFormat);
  }, [onFormatChange]);

  // 获取格式对应的placeholder
  const getPlaceholder = () => {
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
  };

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Text>
          <Bold>数据输入</Bold>
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
      
      {/* 数据输入框 */}
      <div style={{ position: 'relative' }}>
        <TextboxMultiline
          onValueInput={onDataChange}
          placeholder={getPlaceholder()}
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
      
      {/* 外部错误提示（来自主线程） */}
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
}
