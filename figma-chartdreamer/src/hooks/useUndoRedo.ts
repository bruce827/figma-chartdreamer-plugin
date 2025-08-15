/**
 * 撤销/重做功能Hook
 * 管理操作历史，支持撤销和重做操作
 */

import { useState, useCallback, useEffect } from 'preact/hooks';

export interface UndoRedoState<T> {
  current: T;
  canUndo: boolean;
  canRedo: boolean;
  undo: () => void;
  redo: () => void;
  set: (newState: T, saveToHistory?: boolean) => void;
  reset: () => void;
}

interface HistoryEntry<T> {
  state: T;
  timestamp: number;
}

/**
 * 撤销/重做功能Hook
 * @param initialState 初始状态
 * @param maxHistorySize 最大历史记录数量
 * @returns 撤销/重做功能接口
 */
export function useUndoRedo<T>(
  initialState: T,
  maxHistorySize: number = 50
): UndoRedoState<T> {
  // 历史记录栈
  const [history, setHistory] = useState<HistoryEntry<T>[]>([
    { state: initialState, timestamp: Date.now() }
  ]);
  // 当前历史位置索引
  const [currentIndex, setCurrentIndex] = useState(0);

  // 获取当前状态
  const current = history[currentIndex]?.state || initialState;

  // 是否可以撤销
  const canUndo = currentIndex > 0;

  // 是否可以重做
  const canRedo = currentIndex < history.length - 1;

  // 设置新状态
  const set = useCallback((newState: T, saveToHistory: boolean = true) => {
    if (!saveToHistory) {
      // 不保存到历史记录，直接更新当前状态
      setHistory(prev => {
        const newHistory = [...prev];
        newHistory[currentIndex] = {
          state: newState,
          timestamp: Date.now()
        };
        return newHistory;
      });
      return;
    }

    // 保存到历史记录
    setHistory(prev => {
      // 截断当前位置之后的历史记录
      const newHistory = prev.slice(0, currentIndex + 1);
      
      // 添加新状态
      newHistory.push({
        state: newState,
        timestamp: Date.now()
      });

      // 限制历史记录大小
      if (newHistory.length > maxHistorySize) {
        return newHistory.slice(newHistory.length - maxHistorySize);
      }

      return newHistory;
    });

    // 更新索引到最新位置
    setCurrentIndex(prev => Math.min(prev + 1, maxHistorySize - 1));
  }, [currentIndex, maxHistorySize]);

  // 撤销操作
  const undo = useCallback(() => {
    if (canUndo) {
      setCurrentIndex(prev => prev - 1);
    }
  }, [canUndo]);

  // 重做操作
  const redo = useCallback(() => {
    if (canRedo) {
      setCurrentIndex(prev => prev + 1);
    }
  }, [canRedo]);

  // 重置历史记录
  const reset = useCallback(() => {
    setHistory([{ state: initialState, timestamp: Date.now() }]);
    setCurrentIndex(0);
  }, [initialState]);

  // 监听键盘快捷键
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+Z / Cmd+Z 撤销
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        undo();
      }
      // Ctrl+Shift+Z / Cmd+Shift+Z 或 Ctrl+Y / Cmd+Y 重做
      else if (
        ((e.ctrlKey || e.metaKey) && e.key === 'z' && e.shiftKey) ||
        ((e.ctrlKey || e.metaKey) && e.key === 'y')
      ) {
        e.preventDefault();
        redo();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undo, redo]);

  return {
    current,
    canUndo,
    canRedo,
    undo,
    redo,
    set,
    reset
  };
}

/**
 * 撤销/重做功能Hook（简化版）
 * 仅跟踪单个值的变化
 */
export function useSimpleUndoRedo<T>(
  initialValue: T,
  maxHistorySize: number = 50
): [T, (value: T) => void, () => void, () => void, boolean, boolean] {
  const { current, set, undo, redo, canUndo, canRedo } = useUndoRedo(
    initialValue,
    maxHistorySize
  );

  return [current, set, undo, redo, canUndo, canRedo];
}
