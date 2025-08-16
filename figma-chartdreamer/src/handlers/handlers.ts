/**
 * 事件处理器类型定义
 * 使用 create-figma-plugin 的事件系统
 */

import { EventHandler } from '@create-figma-plugin/utilities';
import { GenerateSankeyRequest, ErrorMessage, ChartConfig, FrameSize } from '../types/sankey.types';

/**
 * 生成桑基图事件处理器
 */
export interface GenerateSankeyHandler extends EventHandler {
  name: 'GENERATE_SANKEY';
  handler: (request: GenerateSankeyRequest) => void;
}

/**
 * 生成成功事件处理器
 */
export interface GenerateSuccessHandler extends EventHandler {
  name: 'GENERATE_SUCCESS';
  handler: (message: string) => void;
}

/**
 * 生成失败事件处理器
 */
export interface GenerateErrorHandler extends EventHandler {
  name: 'GENERATE_ERROR';
  handler: (error: ErrorMessage) => void;
}

/**
 * Frame检测事件处理器
 */
export interface DetectFrameHandler extends EventHandler {
  name: 'DETECT_FRAME';
  handler: () => void;
}

/**
 * Frame检测结果事件处理器
 */
export interface FrameDetectedHandler extends EventHandler {
  name: 'FRAME_DETECTED';
  handler: (frameSize: FrameSize | null) => void;
}

/**
 * 更新配置事件处理器
 */
export interface UpdateConfigHandler extends EventHandler {
  name: 'UPDATE_CONFIG';
  handler: (config: Partial<ChartConfig>) => void;
}

/**
 * 加载示例数据事件处理器
 */
export interface LoadExampleDataHandler extends EventHandler {
  name: 'LOAD_EXAMPLE_DATA';
  handler: (exampleId: string) => void;
}

/**
 * 保存到存储事件处理器
 */
export interface SaveToStorageHandler extends EventHandler {
  name: 'SAVE_TO_STORAGE';
  handler: (key: string, value: unknown) => void;
}

/**
 * 从存储加载事件处理器
 */
export interface LoadFromStorageHandler extends EventHandler {
  name: 'LOAD_FROM_STORAGE';
  handler: (key: string) => void;
}

/**
 * 返回存储数据事件处理器
 */
export interface StorageDataHandler extends EventHandler {
  name: 'STORAGE_DATA';
  handler: (data: { key: string; value: unknown }) => void;
}

/**
 * 加载设置事件处理器
 */
export interface LoadSettingsHandler extends EventHandler {
  name: 'LOAD_SETTINGS';
  handler: () => void;
}

/**
 * 返回设置事件处理器
 */
export interface SettingsLoadedHandler extends EventHandler {
  name: 'SETTINGS_LOADED';
  handler: (settings: {
    config?: any;
    format?: any;
    history?: any[];
  }) => void;
}

/**
 * 添加到历史记录事件处理器
 */
export interface AddToHistoryHandler extends EventHandler {
  name: 'ADD_TO_HISTORY';
  handler: (item: {
    name: string;
    data: string;
    format: any;
    config: any;
  }) => void;
}

/**
 * 清除历史记录事件处理器
 */
export interface ClearHistoryHandler extends EventHandler {
  name: 'CLEAR_HISTORY';
  handler: () => void;
}

/**
 * 删除历史记录事件处理器  
 */
export interface DeleteHistoryItemHandler extends EventHandler {
  name: 'DELETE_HISTORY_ITEM';
  handler: (id: string) => void;
}
