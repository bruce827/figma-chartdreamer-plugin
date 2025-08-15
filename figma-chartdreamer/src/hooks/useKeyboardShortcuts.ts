/**
 * 键盘快捷键管理Hook
 * 定义和管理插件中的所有键盘快捷键
 */

import { useEffect, useRef } from 'preact/hooks';

export interface ShortcutConfig {
  key: string;
  ctrl?: boolean;
  alt?: boolean;
  shift?: boolean;
  meta?: boolean;  // Mac上的Command键
  action: () => void;
  description: string;
  enabled?: boolean;
}

/**
 * 键盘快捷键Hook
 * @param shortcuts 快捷键配置数组
 * @param deps 依赖项数组
 */
export function useKeyboardShortcuts(
  shortcuts: ShortcutConfig[],
  deps: any[] = []
) {
  const shortcutsRef = useRef(shortcuts);
  shortcutsRef.current = shortcuts;

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // 检查是否在输入框中
      const target = event.target as HTMLElement;
      const isInputField = 
        target.tagName === 'INPUT' || 
        target.tagName === 'TEXTAREA' ||
        target.contentEditable === 'true';

      shortcutsRef.current.forEach(shortcut => {
        // 跳过禁用的快捷键
        if (shortcut.enabled === false) return;

        // 检查修饰键
        const ctrlMatch = shortcut.ctrl ? (event.ctrlKey || event.metaKey) : !event.ctrlKey && !event.metaKey;
        const altMatch = shortcut.alt ? event.altKey : !event.altKey;
        const shiftMatch = shortcut.shift ? event.shiftKey : !event.shiftKey;
        
        // 检查按键
        const keyMatch = event.key.toLowerCase() === shortcut.key.toLowerCase();

        // 如果所有条件都匹配，执行动作
        if (ctrlMatch && altMatch && shiftMatch && keyMatch) {
          // 某些快捷键在输入框中不应该触发
          if (isInputField && !shortcut.ctrl && !shortcut.meta) {
            return;
          }

          event.preventDefault();
          event.stopPropagation();
          shortcut.action();
        }
      });
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, deps);
}

/**
 * 默认快捷键配置
 */
export const defaultShortcuts = {
  // 生成图表
  generate: {
    key: 'Enter',
    ctrl: true,
    description: '生成桑基图'
  },
  // 清除输入
  clear: {
    key: 'k',
    ctrl: true,
    description: '清除所有输入'
  },
  // 保存配置
  save: {
    key: 's',
    ctrl: true,
    description: '保存当前配置'
  },
  // 加载历史
  history: {
    key: 'h',
    ctrl: true,
    description: '打开历史记录'
  },
  // 切换主题
  theme: {
    key: 't',
    ctrl: true,
    description: '切换主题'
  },
  // 导出数据
  export: {
    key: 'e',
    ctrl: true,
    description: '导出数据'
  },
  // 导入数据
  import: {
    key: 'i',
    ctrl: true,
    description: '导入数据'
  },
  // 格式化JSON
  format: {
    key: 'f',
    ctrl: true,
    shift: true,
    description: '格式化JSON数据'
  },
  // 切换示例
  example1: {
    key: '1',
    alt: true,
    description: '加载示例1'
  },
  example2: {
    key: '2',
    alt: true,
    description: '加载示例2'
  },
  example3: {
    key: '3',
    alt: true,
    description: '加载示例3'
  },
  example4: {
    key: '4',
    alt: true,
    description: '加载示例4'
  },
  example5: {
    key: '5',
    alt: true,
    description: '加载示例5'
  }
};

/**
 * 格式化快捷键显示文本
 */
export function formatShortcut(shortcut: Partial<ShortcutConfig>): string {
  const parts: string[] = [];
  
  // 检测操作系统
  const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
  
  if (shortcut.ctrl) {
    parts.push(isMac ? '⌘' : 'Ctrl');
  }
  if (shortcut.alt) {
    parts.push(isMac ? '⌥' : 'Alt');
  }
  if (shortcut.shift) {
    parts.push(isMac ? '⇧' : 'Shift');
  }
  if (shortcut.key) {
    parts.push(shortcut.key.toUpperCase());
  }
  
  return parts.join(isMac ? '' : '+');
}

