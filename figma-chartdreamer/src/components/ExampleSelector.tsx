/** @jsx h */
import { h } from 'preact';
import { useCallback } from 'preact/hooks';
import {
  Button,
  Dropdown,
  DropdownOption,
  Text,
  Muted,
  VerticalSpace
} from '@create-figma-plugin/ui';
import { DataFormat } from '../types/sankey.types';
import { 
  exampleDataTemplates, 
  getExampleDataAsJson, 
  getExampleDataAsCsv, 
  getExampleDataAsTsv 
} from '../utils/exampleData';

interface ExampleSelectorProps {
  format: DataFormat;
  onSelect: (data: string) => void;
}

/**
 * 示例数据选择器组件
 */
export function ExampleSelector({ format, onSelect }: ExampleSelectorProps) {
  // 创建下拉选项
  const options: DropdownOption[] = exampleDataTemplates.map(example => ({
    value: example.id,
    text: example.name
  }));

  // 添加一个空选项作为提示
  const allOptions: DropdownOption[] = [
    { value: '', text: '选择示例数据...' },
    ...options
  ];

  // 处理选择事件
  const handleSelection = useCallback((event: any) => {
    const selectedId = event.currentTarget.value;
    
    if (!selectedId) {
      return;
    }

    let data = '';
    switch (format) {
      case DataFormat.JSON:
        data = getExampleDataAsJson(selectedId);
        break;
      case DataFormat.CSV:
        data = getExampleDataAsCsv(selectedId);
        break;
      case DataFormat.TSV:
        data = getExampleDataAsTsv(selectedId);
        break;
    }

    onSelect(data);
    
    // 重置选择器
    event.currentTarget.value = '';
  }, [format, onSelect]);

  return (
    <div>
      <Dropdown
        onChange={handleSelection}
        options={allOptions}
        placeholder="选择示例数据..."
        value=""
      />
      
      <VerticalSpace space="small" />
      
      {/* 示例说明 */}
      <div style={{ paddingLeft: '4px' }}>
        {exampleDataTemplates.map(example => (
          <div key={example.id} style={{ marginBottom: '8px' }}>
            <Text>
              <Muted>
                <strong>{example.name}</strong>: {example.description}
              </Muted>
            </Text>
          </div>
        ))}
      </div>
    </div>
  );
}
