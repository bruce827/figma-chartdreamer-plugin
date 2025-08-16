import {
  Button,
  Container,
  render,
  VerticalSpace,
  Text,
  Bold,
  Divider,
  LoadingIndicator,
  Banner,
  IconWarning16
} from '@create-figma-plugin/ui'
import { emit, on } from '@create-figma-plugin/utilities'
/** @jsx h */
import { h, Fragment } from 'preact'
import { useState, useCallback, useEffect } from 'preact/hooks'

// 导入自定义hooks
import { useUndoRedo } from './hooks/useUndoRedo'
import { useKeyboardShortcuts, defaultShortcuts, formatShortcut } from './hooks/useKeyboardShortcuts'

// 导入类型
import { 
  ChartConfig as ChartConfigType, 
  DataFormat, 
  GenerateSankeyRequest,
  NodeShape,
  LinkStyle,
  ColorScheme 
} from './types/sankey.types'
import { 
  GenerateSankeyHandler, 
  GenerateSuccessHandler, 
  GenerateErrorHandler,
  LoadSettingsHandler,
  SettingsLoadedHandler,
  ClearHistoryHandler,
  DeleteHistoryItemHandler
} from './handlers/handlers'
import { ValidationResult } from './utils/validation'
import { HistoryItem } from './utils/storage'

// 导入组件
import { DataInputOptimized } from './components/DataInputOptimized'
import { ChartConfig } from './components/ChartConfig'
import { ExampleSelector } from './components/ExampleSelector'
import { HistoryPanel } from './components/HistoryPanel'
import { exampleDataTemplates, getExampleDataAsJson, getExampleDataAsCsv, getExampleDataAsTsv } from './utils/exampleData'

function Plugin() {
  // 撤销/重做状态管理
  const undoRedoState = useUndoRedo({
    jsonInput: '',
    dataFormat: DataFormat.JSON,
    chartConfig: {
      nodeColor: '#6366F1',
      linkColor: '#E5E7EB',
      theme: 'light',
      nodeWidth: 15,
      nodePadding: 10,
      width: 800,
      height: 600,
      nodeShape: NodeShape.RECTANGLE,
      linkStyle: LinkStyle.BEZIER,
      colorScheme: ColorScheme.DEFAULT,
      nodeRadius: 4,
      showShadow: false,
      linkOpacity: 0.5,
      useGradient: false,
      autoLayout: false
    } as ChartConfigType
  });
  
  // 从撤销/重做状态中提取当前值
  const { jsonInput, dataFormat, chartConfig } = undoRedoState.current;
  
  // 状态管理
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [showShortcuts, setShowShortcuts] = useState(false);

  // 监听主线程的消息
  useEffect(() => {
    // 监听生成成功消息
    on<GenerateSuccessHandler>('GENERATE_SUCCESS', (message) => {
      setIsLoading(false);
      setSuccessMessage(message);
      setError(null);
      
      // 3秒后清除成功消息
      setTimeout(() => setSuccessMessage(null), 3000);
      
      // 重新加载历史记录
      emit<LoadSettingsHandler>('LOAD_SETTINGS');
    });

    // 监听生成错误消息
    on<GenerateErrorHandler>('GENERATE_ERROR', (error) => {
      setIsLoading(false);
      setError(error.message);
      setSuccessMessage(null);
    });
    
    // 监听设置加载消息
    on<SettingsLoadedHandler>('SETTINGS_LOADED', (settings) => {
      if (settings.config || settings.format) {
        undoRedoState.set({
          jsonInput: undoRedoState.current.jsonInput,
          dataFormat: settings.format || dataFormat,
          chartConfig: settings.config || chartConfig
        }, false);
      }
      if (settings.history) {
        setHistory(settings.history);
      }
    });
    
    // 初始加载设置
    emit<LoadSettingsHandler>('LOAD_SETTINGS');
  }, []);

  // 处理数据输入变化
  const handleDataChange = useCallback((data: string) => {
    undoRedoState.set({
      ...undoRedoState.current,
      jsonInput: data
    });
    // 清除服务器端错误，但保留本地验证结果
    if (error && !error.includes('格式')) {
      setError(null);
    }
    setSuccessMessage(null);
  }, [error, undoRedoState]);

  // 处理格式变化
  const handleFormatChange = useCallback((format: DataFormat) => {
    undoRedoState.set({
      ...undoRedoState.current,
      dataFormat: format,
      jsonInput: '' // 清空输入
    });
    setError(null);
    setSuccessMessage(null);
  }, [undoRedoState]);

  // 处理配置变化
  const handleConfigChange = useCallback((config: Partial<ChartConfigType>) => {
    undoRedoState.set({
      ...undoRedoState.current,
      chartConfig: { ...chartConfig, ...config }
    });
  }, [undoRedoState, chartConfig]);

  // 处理示例数据选择
  const handleExampleSelect = useCallback((data: string) => {
    undoRedoState.set({
      ...undoRedoState.current,
      jsonInput: data
    });
    setError(null);
    setSuccessMessage(null);
    setValidationResult(null); // 清除验证结果，让新数据重新验证
  }, [undoRedoState]);

  // 处理验证结果变化
  const handleValidationChange = useCallback((result: ValidationResult) => {
    setValidationResult(result);
    // 如果验证失败，清除生成按钮可能产生的错误
    if (!result.isValid && error === '请输入数据') {
      setError(null);
    }
  }, [error]);

  // 处理历史记录加载
  const handleHistoryLoad = useCallback((item: HistoryItem) => {
    undoRedoState.set({
      jsonInput: item.data,
      dataFormat: item.format,
      chartConfig: item.config
    });
    setShowHistory(false);
    setSuccessMessage('已加载历史记录');
    setTimeout(() => setSuccessMessage(null), 2000);
  }, [undoRedoState]);
  
  // 处理历史记录删除
  const handleHistoryDelete = useCallback((id: string) => {
    emit<DeleteHistoryItemHandler>('DELETE_HISTORY_ITEM', id);
    setHistory(prev => prev.filter(item => item.id !== id));
  }, []);
  
  // 处理历史记录清除
  const handleHistoryClear = useCallback(() => {
    emit<ClearHistoryHandler>('CLEAR_HISTORY');
    setHistory([]);
    setSuccessMessage('历史记录已清除');
    setTimeout(() => setSuccessMessage(null), 2000);
  }, []);

  // 生成桑基图
  const handleGenerate = useCallback(() => {
    // 验证输入
    if (!jsonInput.trim()) {
      setError('请输入数据');
      return;
    }

    // 检查验证结果
    if (validationResult && !validationResult.isValid) {
      setError('请先修正数据格式错误');
      return;
    }

    // 构建请求
    const request: GenerateSankeyRequest = {
      data: jsonInput,
      format: dataFormat,
      config: chartConfig
    };

    // 设置加载状态
    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);

    // 发送消息到主线程
    emit<GenerateSankeyHandler>('GENERATE_SANKEY', request);
  }, [jsonInput, dataFormat, chartConfig, validationResult]);
  
  // 清除所有输入
  const handleClear = useCallback(() => {
    undoRedoState.set({
      jsonInput: '',
      dataFormat: DataFormat.JSON,
      chartConfig: {
        nodeColor: '#6366F1',
        linkColor: '#E5E7EB',
        theme: 'light',
        nodeWidth: 15,
        nodePadding: 10,
        width: 800,
        height: 600,
        nodeShape: NodeShape.RECTANGLE,
        linkStyle: LinkStyle.BEZIER,
        colorScheme: ColorScheme.DEFAULT,
        nodeRadius: 4,
        showShadow: false,
        linkOpacity: 0.5,
        useGradient: false,
        autoLayout: false
      } as ChartConfigType
    });
    setError(null);
    setSuccessMessage('已清除所有输入');
    setTimeout(() => setSuccessMessage(null), 2000);
  }, [undoRedoState]);
  
  // 格式化JSON
  const handleFormatJson = useCallback(() => {
    if (dataFormat === DataFormat.JSON && jsonInput) {
      try {
        const parsed = JSON.parse(jsonInput);
        const formatted = JSON.stringify(parsed, null, 2);
        undoRedoState.set({
          ...undoRedoState.current,
          jsonInput: formatted
        });
        setSuccessMessage('JSON已格式化');
        setTimeout(() => setSuccessMessage(null), 2000);
      } catch (e) {
        setError('无法格式化：JSON格式错误');
      }
    }
  }, [dataFormat, jsonInput, undoRedoState]);
  
  // 加载示例数据
  const loadExample = useCallback((index: number) => {
    const example = exampleDataTemplates[index];
    if (example) {
      let data = '';
      switch (dataFormat) {
        case DataFormat.JSON:
          data = getExampleDataAsJson(example.id);
          break;
        case DataFormat.CSV:
          data = getExampleDataAsCsv(example.id);
          break;
        case DataFormat.TSV:
          data = getExampleDataAsTsv(example.id);
          break;
      }
      handleExampleSelect(data);
      setSuccessMessage(`已加载示例：${example.name}`);
      setTimeout(() => setSuccessMessage(null), 2000);
    }
  }, [dataFormat, handleExampleSelect]);

  // 配置键盘快捷键
  useKeyboardShortcuts([
    {
      ...defaultShortcuts.generate,
      action: handleGenerate,
      enabled: !isLoading && !!jsonInput.trim() && (!validationResult || validationResult.isValid)
    },
    {
      ...defaultShortcuts.clear,
      action: handleClear
    },
    {
      ...defaultShortcuts.history,
      action: () => setShowHistory(!showHistory)
    },
    {
      ...defaultShortcuts.format,
      action: handleFormatJson,
      enabled: dataFormat === DataFormat.JSON
    },
    {
      ...defaultShortcuts.example1,
      action: () => loadExample(0)
    },
    {
      ...defaultShortcuts.example2,
      action: () => loadExample(1)
    },
    {
      ...defaultShortcuts.example3,
      action: () => loadExample(2)
    },
    {
      ...defaultShortcuts.example4,
      action: () => loadExample(3)
    },
    {
      ...defaultShortcuts.example5,
      action: () => loadExample(4)
    },
    {
      key: '?',
      shift: true,
      action: () => setShowShortcuts(!showShortcuts),
      description: '显示快捷键帮助'
    }
  ], [handleGenerate, handleClear, showHistory, handleFormatJson, loadExample, 
      isLoading, jsonInput, validationResult, dataFormat, showShortcuts]);

  return (
    <Container space="medium">
      <VerticalSpace space="medium" />

      {/* 标题和操作按钮 */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Text>
          <Bold>📊 ChartDreamer - 桑基图生成器</Bold>
        </Text>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          {/* 撤销/重做按钮 */}
          <Button
            onClick={undoRedoState.undo}
            disabled={!undoRedoState.canUndo}
            secondary
            style={{ padding: '2px 12px' }}
            title={`撤销 (${formatShortcut({ ctrl: true, key: 'z' })})`}
          >
            ←
          </Button>
          <Button
            onClick={undoRedoState.redo}
            disabled={!undoRedoState.canRedo}
            secondary
            style={{ padding: '2px 12px' }}
            title={`重做 (${formatShortcut({ ctrl: true, key: 'y' })})`}
          >
            →
          </Button>
          <div style={{ width: '1px', height: '20px', backgroundColor: '#e5e7eb' }} />
          {/* 历史记录按钮 */}
          {history.length > 0 && (
            <span style={{ 
              padding: '2px 2px',
              backgroundColor: '#e5e7eb',
              borderRadius: '10px',
              fontSize: '12px',
              color: '#6b7280'
            }}>
              {history.length}
            </span>
          )}
          <Button
            onClick={() => setShowHistory(!showHistory)}
            secondary
            style={{ padding: '2px 2px', minWidth: '80px', whiteSpace: 'nowrap' }}
            title={`历史记录 (${formatShortcut({ ctrl: true, key: 'h' })})`}
          >
            {showHistory ? '隐藏' : '历史'}
          </Button>
          {/* 快捷键帮助 */}
          <Button
            onClick={() => setShowShortcuts(!showShortcuts)}
            secondary
            style={{ padding: '6px 12px' }}
            title={`快捷键帮助 (${formatShortcut({ shift: true, key: '?' })})`}
          >
            ?
          </Button>
        </div>
      </div>

      <VerticalSpace space="medium" />
      <Divider />
      <VerticalSpace space="medium" />

      {/* 成功消息 */}
      {successMessage && (
        <>
          <Banner icon={<div>✅</div>} variant="success">
            {successMessage}
          </Banner>
          <VerticalSpace space="medium" />
        </>
      )}

      {/* 错误消息 */}
      {error && (
        <>
          <Banner icon={<IconWarning16 />} variant="warning">
            {error}
          </Banner>
          <VerticalSpace space="medium" />
        </>
      )}
      
      {/* 快捷键帮助面板 */}
      {showShortcuts && (
        <>
          <div style={{ 
            padding: '12px',
            backgroundColor: '#f9fafb',
            borderRadius: '6px',
            fontSize: '12px'
          }}>
            <Text><Bold>键盘快捷键</Bold></Text>
            <VerticalSpace space="small" />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '8px' }}>
              <div><code>{formatShortcut({ ctrl: true, key: 'Enter' })}</code></div>
              <div>生成桑基图</div>
              <div><code>{formatShortcut({ ctrl: true, key: 'z' })}</code></div>
              <div>撤销</div>
              <div><code>{formatShortcut({ ctrl: true, key: 'y' })}</code></div>
              <div>重做</div>
              <div><code>{formatShortcut({ ctrl: true, key: 'k' })}</code></div>
              <div>清除输入</div>
              <div><code>{formatShortcut({ ctrl: true, key: 'h' })}</code></div>
              <div>打开历史记录</div>
              <div><code>{formatShortcut({ ctrl: true, shift: true, key: 'f' })}</code></div>
              <div>格式化JSON</div>
              <div><code>{formatShortcut({ alt: true, key: '1-5' })}</code></div>
              <div>加载示例1-5</div>
              <div><code>{formatShortcut({ shift: true, key: '?' })}</code></div>
              <div>显示/隐藏帮助</div>
            </div>
          </div>
          <VerticalSpace space="medium" />
          <Divider />
          <VerticalSpace space="medium" />
        </>
      )}

      {/* 历史记录面板 */}
      {showHistory ? (
        <>
          <HistoryPanel
            history={history}
            onLoad={handleHistoryLoad}
            onDelete={handleHistoryDelete}
            onClear={handleHistoryClear}
          />
          <VerticalSpace space="medium" />
          <Divider />
          <VerticalSpace space="medium" />
        </>
      ) : (
        <>
          {/* 示例数据选择器 */}
          <ExampleSelector 
            format={dataFormat}
            onSelect={handleExampleSelect}
          />

          <VerticalSpace space="medium" />
          <Divider />
          <VerticalSpace space="medium" />
        </>
      )}

      {/* 数据输入 - 只在不显示历史记录时显示 */}
      {!showHistory && (
        <>
          <DataInputOptimized
            value={jsonInput}
            format={dataFormat}
            onDataChange={handleDataChange}
            onFormatChange={handleFormatChange}
            onValidationChange={handleValidationChange}
            error={null}
          />

          <VerticalSpace space="medium" />
          <Divider />
          <VerticalSpace space="medium" />

          {/* 图表配置 */}
          <ChartConfig
            config={chartConfig}
            onChange={handleConfigChange}
          />
        </>
      )}

      <VerticalSpace space="large" />

      {/* Frame检测状态 - 智能尺寸适配 */}
      <div style={{ 
        padding: '12px',
        backgroundColor: '#f8fafc',
        borderRadius: '6px',
        border: '1px solid #e2e8f0'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
          <div style={{ 
            width: '12px', 
            height: '12px', 
            borderRadius: '50%', 
            backgroundColor: '#10b981',
            flexShrink: 0
          }}></div>
          <Text><Bold>智能尺寸适配</Bold></Text>
        </div>
        <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '8px' }}>
          在Figma中选中一个Frame对象，插件将自动检测其尺寸并适配桑基图绘制
        </div>
        <div style={{ 
          padding: '8px',
          backgroundColor: '#f1f5f9',
          borderRadius: '4px',
          fontSize: '12px',
          color: '#475569',
          marginBottom: '8px'
        }}>
          💡 <Bold>如何选择Frame：</Bold>
          <br />• 在Figma画布中，选择包含"Frame"标签的容器对象
          <br />• 确保选中的是Frame，不是Rectangle、Text或其他形状
          <br />• Frame通常有背景色和边框，可以包含其他元素
        </div>
        <div style={{ 
          padding: '8px',
          backgroundColor: '#fef3c7',
          borderRadius: '4px',
          fontSize: '12px',
          color: '#92400e',
          border: '1px solid #fbbf24'
        }}>
          ⚠️ <Bold>注意：</Bold>选中Frame后，桑基图将按照Frame尺寸自动调整，实现完美适配
        </div>
      </div>

      <VerticalSpace space="medium" />

      {/* 操作按钮组 */}
      <div style={{ display: 'flex', gap: '8px' }}>
        <Button
          onClick={handleClear}
          secondary
          title={formatShortcut({ ctrl: true, key: 'k' })}
        >
          清除
        </Button>
        {dataFormat === DataFormat.JSON && (
          <Button
            onClick={handleFormatJson}
            secondary
            disabled={!jsonInput}
            title={formatShortcut({ ctrl: true, shift: true, key: 'f' })}
          >
            格式化
          </Button>
        )}
        <Button
          fullWidth 
          onClick={handleGenerate}
          disabled={isLoading || !jsonInput.trim() || (validationResult !== null && !validationResult.isValid)}
          title={formatShortcut({ ctrl: true, key: 'Enter' })}
        >
          {isLoading ? '生成中...' : 
           validationResult && !validationResult.isValid ? '请先修正数据格式' : '生成桑基图'}
        </Button>
      </div>

      {/* 加载指示器 */}
      {isLoading && (
        <>
          <VerticalSpace space="medium" />
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <LoadingIndicator />
          </div>
        </>
      )}

      <VerticalSpace space="medium" />
    </Container>
  )
}

export default render(Plugin)
