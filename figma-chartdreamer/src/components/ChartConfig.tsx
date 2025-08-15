/** @jsx h */
import { h, Fragment } from 'preact';
import { useCallback, useState } from 'preact/hooks';
import {
  Text,
  Bold,
  VerticalSpace,
  Textbox,
  Columns,
  Muted,
  SegmentedControl,
  SegmentedControlOption,
  Toggle,
  Dropdown,
  DropdownOption,
  Divider,
  IconChevronDown16
} from '@create-figma-plugin/ui';
import { 
  ChartConfig as ChartConfigType,
  NodeShape,
  LinkStyle,
  ColorScheme 
} from '../types/sankey.types';
import { COLOR_SCHEMES } from '../utils/colorSchemes';

interface ChartConfigProps {
  config: ChartConfigType;
  onChange: (config: Partial<ChartConfigType>) => void;
}

/**
 * 图表配置组件
 * 用于设置图表的颜色、主题等配置
 */
export function ChartConfig({ config, onChange }: ChartConfigProps) {
  // 控制高级选项的展开状态
  const [showAdvanced, setShowAdvanced] = useState(false);
  
  // 主题选项
  const themeOptions: SegmentedControlOption[] = [
    { value: 'light', children: '浅色' },
    { value: 'dark', children: '深色' },
    { value: 'custom', children: '自定义' }
  ];
  
  // 节点形状选项
  const nodeShapeOptions: DropdownOption[] = [
    { value: NodeShape.RECTANGLE, text: '矩形' },
    { value: NodeShape.ROUNDED_RECTANGLE, text: '圆角矩形' },
    { value: NodeShape.CIRCLE, text: '圆形' }
  ];
  
  // 链接样式选项
  const linkStyleOptions: DropdownOption[] = [
    { value: LinkStyle.STRAIGHT, text: '直线' },
    { value: LinkStyle.BEZIER, text: '贝塞尔曲线' },
    { value: LinkStyle.GRADIENT, text: '渐变' }
  ];
  
  // 颜色方案选项
  const colorSchemeOptions: DropdownOption[] = Object.entries(COLOR_SCHEMES).map(
    ([key, value]) => ({ value: key, text: value.name })
  );

  // 处理颜色变化
  const handleNodeColorChange = useCallback((value: string) => {
    onChange({ nodeColor: value });
  }, [onChange]);

  const handleLinkColorChange = useCallback((value: string) => {
    onChange({ linkColor: value });
  }, [onChange]);

  // 处理主题变化
  const handleThemeChange = useCallback((event: any) => {
    const theme = event.currentTarget.value as 'light' | 'dark' | 'custom';
    
    // 根据主题自动设置颜色
    if (theme === 'light') {
      onChange({
        theme,
        nodeColor: '#6366F1',
        linkColor: '#E5E7EB',
        colorScheme: ColorScheme.DEFAULT
      });
    } else if (theme === 'dark') {
      onChange({
        theme,
        nodeColor: '#818CF8',
        linkColor: '#4B5563',
        colorScheme: ColorScheme.NEON
      });
    } else {
      onChange({ theme });
    }
  }, [onChange]);
  
  // 处理颜色方案变化
  const handleColorSchemeChange = useCallback((event: any) => {
    const scheme = event.currentTarget.value as ColorScheme;
    const schemeConfig = COLOR_SCHEMES[scheme];
    
    if (scheme !== ColorScheme.CUSTOM) {
      onChange({
        colorScheme: scheme,
        nodeColor: schemeConfig.nodeColors[0] || '#6366F1',
        linkColor: schemeConfig.linkColor
      });
    } else {
      onChange({ colorScheme: scheme });
    }
  }, [onChange]);
  
  // 处理节点形状变化
  const handleNodeShapeChange = useCallback((event: any) => {
    onChange({ nodeShape: event.currentTarget.value as NodeShape });
  }, [onChange]);
  
  // 处理链接样式变化
  const handleLinkStyleChange = useCallback((event: any) => {
    onChange({ linkStyle: event.currentTarget.value as LinkStyle });
  }, [onChange]);
  
  // 处理开关选项
  const handleToggleChange = useCallback((key: string) => (value: boolean) => {
    onChange({ [key]: value });
  }, [onChange]);

  // 处理尺寸变化
  const handleWidthChange = useCallback((value: string) => {
    const width = parseInt(value) || 800;
    onChange({ width });
  }, [onChange]);

  const handleHeightChange = useCallback((value: string) => {
    const height = parseInt(value) || 600;
    onChange({ height });
  }, [onChange]);

  const handleNodeWidthChange = useCallback((value: string) => {
    const nodeWidth = parseInt(value) || 15;
    onChange({ nodeWidth });
  }, [onChange]);

  const handleNodePaddingChange = useCallback((value: string) => {
    const nodePadding = parseInt(value) || 10;
    onChange({ nodePadding });
  }, [onChange]);

  return (
    <div>
      <Text>
        <Bold>图表配置</Bold>
      </Text>
      <VerticalSpace space="medium" />

      {/* 主题选择 */}
      <Text>
        <Muted>主题</Muted>
      </Text>
      <VerticalSpace space="extraSmall" />
      <SegmentedControl
        onChange={handleThemeChange}
        options={themeOptions}
        value={config.theme}
      />
      
      <VerticalSpace space="medium" />

      {/* 颜色配置 - 仅在自定义主题时显示 */}
      {config.theme === 'custom' && (
        <>
          <Columns space="medium">
            <div>
              <Text>
                <Muted>节点颜色</Muted>
              </Text>
              <VerticalSpace space="extraSmall" />
              <Textbox
                onValueInput={handleNodeColorChange}
                placeholder="#6366F1"
                value={config.nodeColor}
              />
            </div>
            <div>
              <Text>
                <Muted>链接颜色</Muted>
              </Text>
              <VerticalSpace space="extraSmall" />
              <Textbox
                onValueInput={handleLinkColorChange}
                placeholder="#E5E7EB"
                value={config.linkColor}
              />
            </div>
          </Columns>
          
          <VerticalSpace space="medium" />
        </>
      )}

      {/* 尺寸配置 */}
      <Text>
        <Muted>画布尺寸</Muted>
      </Text>
      <VerticalSpace space="extraSmall" />
      <Columns space="medium">
        <div>
          <Textbox
            onValueInput={handleWidthChange}
            placeholder="800"
            value={String(config.width || 800)}
          />
        </div>
        <div>
          <Textbox
            onValueInput={handleHeightChange}
            placeholder="600"
            value={String(config.height || 600)}
          />
        </div>
      </Columns>

      <VerticalSpace space="medium" />

      {/* 节点配置 */}
      <Text>
        <Muted>节点设置</Muted>
      </Text>
      <VerticalSpace space="extraSmall" />
      <Columns space="medium">
        <div>
          <Textbox
            onValueInput={handleNodeWidthChange}
            placeholder="15"
            value={String(config.nodeWidth || 15)}
          />
          <VerticalSpace space="extraSmall" />
          <Text>
            <Muted>节点宽度</Muted>
          </Text>
        </div>
        <div>
          <Textbox
            onValueInput={handleNodePaddingChange}
            placeholder="10"
            value={String(config.nodePadding || 10)}
          />
          <VerticalSpace space="extraSmall" />
          <Text>
            <Muted>节点间距</Muted>
          </Text>
        </div>
      </Columns>
      
      <VerticalSpace space="large" />
      
      {/* 高级选项折叠区域 */}
      <div 
        onClick={() => setShowAdvanced(!showAdvanced)}
        style={{ 
          cursor: 'pointer', 
          display: 'flex', 
          alignItems: 'center',
          justifyContent: 'space-between'
        }}
      >
        <Text>
          <Bold>高级样式选项 {showAdvanced ? '▲' : '▼'}</Bold>
        </Text>
      </div>
      
      {showAdvanced && (
        <>
          <VerticalSpace space="medium" />
          <Divider />
          <VerticalSpace space="medium" />
          
          {/* 颜色方案 */}
          <Text>
            <Muted>颜色方案</Muted>
          </Text>
          <VerticalSpace space="extraSmall" />
          <Dropdown
            onChange={handleColorSchemeChange}
            options={colorSchemeOptions}
            value={config.colorScheme || ColorScheme.DEFAULT}
          />
          
          <VerticalSpace space="medium" />
          
          {/* 节点形状 */}
          <Columns space="medium">
            <div>
              <Text>
                <Muted>节点形状</Muted>
              </Text>
              <VerticalSpace space="extraSmall" />
              <Dropdown
                onChange={handleNodeShapeChange}
                options={nodeShapeOptions}
                value={config.nodeShape || NodeShape.RECTANGLE}
              />
            </div>
            <div>
              <Text>
                <Muted>链接样式</Muted>
              </Text>
              <VerticalSpace space="extraSmall" />
              <Dropdown
                onChange={handleLinkStyleChange}
                options={linkStyleOptions}
                value={config.linkStyle || LinkStyle.BEZIER}
              />
            </div>
          </Columns>
          
          <VerticalSpace space="medium" />
          
          {/* 节点圆角（仅在圆角矩形时显示） */}
          {config.nodeShape === NodeShape.ROUNDED_RECTANGLE && (
            <>
              <Text>
                <Muted>节点圆角半径</Muted>
              </Text>
              <VerticalSpace space="extraSmall" />
              <Textbox
                onValueInput={(value: string) => onChange({ nodeRadius: parseInt(value) || 4 })}
                placeholder="4"
                value={String(config.nodeRadius || 4)}
              />
              <VerticalSpace space="medium" />
            </>
          )}
          
          {/* 链接透明度 */}
          <Text>
            <Muted>链接透明度</Muted>
          </Text>
          <VerticalSpace space="extraSmall" />
          <Textbox
            onValueInput={(value: string) => {
              const opacity = parseFloat(value);
              if (!isNaN(opacity) && opacity >= 0 && opacity <= 1) {
                onChange({ linkOpacity: opacity });
              }
            }}
            placeholder="0.5"
            value={String(config.linkOpacity || 0.5)}
          />
          
          <VerticalSpace space="medium" />
          
          {/* 开关选项 */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <Toggle
              onValueChange={handleToggleChange('showShadow')}
              value={config.showShadow || false}
            >
              <Text>显示阴影效果</Text>
            </Toggle>
            
            <Toggle
              onValueChange={handleToggleChange('useGradient')}
              value={config.useGradient || false}
            >
              <Text>使用渐变色</Text>
            </Toggle>
            
            <Toggle
              onValueChange={handleToggleChange('autoLayout')}
              value={config.autoLayout || false}
            >
              <Text>自动调整布局</Text>
            </Toggle>
          </div>
        </>
      )}
    </div>
  );
}
