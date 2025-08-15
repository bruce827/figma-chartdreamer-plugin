import { ChartConfig, DataFormat } from '../types/sankey.types';

/**
 * 存储键名常量
 */
export const STORAGE_KEYS = {
  CHART_CONFIG: 'chartConfig',
  LAST_FORMAT: 'lastFormat',
  HISTORY: 'history',
  FAVORITES: 'favorites',
  UI_PREFERENCES: 'uiPreferences'
} as const;

/**
 * 历史记录项
 */
export interface HistoryItem {
  id: string;
  timestamp: number;
  name: string;
  data: string;
  format: DataFormat;
  config: ChartConfig;
}

/**
 * UI偏好设置
 */
export interface UIPreferences {
  theme?: 'light' | 'dark' | 'auto';
  autoValidate?: boolean;
  compactMode?: boolean;
}

/**
 * 存储管理类
 */
export class StorageManager {
  /**
   * 保存图表配置
   */
  static async saveChartConfig(config: ChartConfig): Promise<void> {
    try {
      await figma.clientStorage.setAsync(STORAGE_KEYS.CHART_CONFIG, config);
    } catch (error) {
      console.error('Failed to save chart config:', error);
    }
  }

  /**
   * 获取图表配置
   */
  static async getChartConfig(): Promise<ChartConfig | null> {
    try {
      const config = await figma.clientStorage.getAsync(STORAGE_KEYS.CHART_CONFIG);
      return config as ChartConfig | null;
    } catch (error) {
      console.error('Failed to get chart config:', error);
      return null;
    }
  }

  /**
   * 保存最后使用的格式
   */
  static async saveLastFormat(format: DataFormat): Promise<void> {
    try {
      await figma.clientStorage.setAsync(STORAGE_KEYS.LAST_FORMAT, format);
    } catch (error) {
      console.error('Failed to save last format:', error);
    }
  }

  /**
   * 获取最后使用的格式
   */
  static async getLastFormat(): Promise<DataFormat | null> {
    try {
      const format = await figma.clientStorage.getAsync(STORAGE_KEYS.LAST_FORMAT);
      return format as DataFormat | null;
    } catch (error) {
      console.error('Failed to get last format:', error);
      return null;
    }
  }

  /**
   * 添加历史记录
   */
  static async addToHistory(item: Omit<HistoryItem, 'id' | 'timestamp'>): Promise<void> {
    try {
      const history = await this.getHistory();
      const newItem: HistoryItem = {
        ...item,
        id: `history_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        timestamp: Date.now()
      };

      // 添加新项到开头
      const updatedHistory = [newItem, ...history];

      // 保留最近10条记录
      const trimmedHistory = updatedHistory.slice(0, 10);

      await figma.clientStorage.setAsync(STORAGE_KEYS.HISTORY, trimmedHistory);
    } catch (error) {
      console.error('Failed to add to history:', error);
    }
  }

  /**
   * 获取历史记录
   */
  static async getHistory(): Promise<HistoryItem[]> {
    try {
      const history = await figma.clientStorage.getAsync(STORAGE_KEYS.HISTORY);
      return (history as HistoryItem[]) || [];
    } catch (error) {
      console.error('Failed to get history:', error);
      return [];
    }
  }

  /**
   * 清除历史记录
   */
  static async clearHistory(): Promise<void> {
    try {
      await figma.clientStorage.setAsync(STORAGE_KEYS.HISTORY, []);
    } catch (error) {
      console.error('Failed to clear history:', error);
    }
  }

  /**
   * 删除特定历史记录
   */
  static async removeFromHistory(id: string): Promise<void> {
    try {
      const history = await this.getHistory();
      const updatedHistory = history.filter(item => item.id !== id);
      await figma.clientStorage.setAsync(STORAGE_KEYS.HISTORY, updatedHistory);
    } catch (error) {
      console.error('Failed to remove from history:', error);
    }
  }

  /**
   * 保存UI偏好设置
   */
  static async saveUIPreferences(preferences: UIPreferences): Promise<void> {
    try {
      const current = await this.getUIPreferences();
      const updated = { ...current, ...preferences };
      await figma.clientStorage.setAsync(STORAGE_KEYS.UI_PREFERENCES, updated);
    } catch (error) {
      console.error('Failed to save UI preferences:', error);
    }
  }

  /**
   * 获取UI偏好设置
   */
  static async getUIPreferences(): Promise<UIPreferences> {
    try {
      const preferences = await figma.clientStorage.getAsync(STORAGE_KEYS.UI_PREFERENCES);
      return (preferences as UIPreferences) || {
        theme: 'light',
        autoValidate: true,
        compactMode: false
      };
    } catch (error) {
      console.error('Failed to get UI preferences:', error);
      return {
        theme: 'light',
        autoValidate: true,
        compactMode: false
      };
    }
  }

  /**
   * 导出所有设置
   */
  static async exportSettings(): Promise<string> {
    try {
      const config = await this.getChartConfig();
      const format = await this.getLastFormat();
      const history = await this.getHistory();
      const preferences = await this.getUIPreferences();

      const settings = {
        config,
        format,
        history,
        preferences,
        exportDate: new Date().toISOString()
      };

      return JSON.stringify(settings, null, 2);
    } catch (error) {
      console.error('Failed to export settings:', error);
      return '{}';
    }
  }

  /**
   * 导入设置
   */
  static async importSettings(jsonString: string): Promise<boolean> {
    try {
      const settings = JSON.parse(jsonString);
      
      if (settings.config) {
        await this.saveChartConfig(settings.config);
      }
      
      if (settings.format) {
        await this.saveLastFormat(settings.format);
      }
      
      if (settings.history) {
        await figma.clientStorage.setAsync(STORAGE_KEYS.HISTORY, settings.history);
      }
      
      if (settings.preferences) {
        await this.saveUIPreferences(settings.preferences);
      }

      return true;
    } catch (error) {
      console.error('Failed to import settings:', error);
      return false;
    }
  }
}
