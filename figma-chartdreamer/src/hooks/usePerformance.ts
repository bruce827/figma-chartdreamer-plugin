import { useCallback, useEffect, useRef, useMemo } from 'preact/hooks';
import { debounce } from '../utils/validation';

/**
 * 性能监控 Hook
 * 用于监控组件渲染次数和性能
 */
export function useRenderCount(componentName: string) {
  const renderCount = useRef(0);
  
  useEffect(() => {
    renderCount.current += 1;
    // 在开发环境中输出
    // console.log(`[${componentName}] Render count: ${renderCount.current}`);
  });
  
  return renderCount.current;
}

/**
 * 防抖 Hook
 * 用于优化频繁触发的操作
 */
export function useDebouncedCallback<T extends (...args: any[]) => any>(
  callback: T,
  delay: number,
  deps: any[] = []
): T {
  const debouncedFn = useMemo(
    () => debounce(callback, delay),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [...deps, delay]
  );
  
  return debouncedFn as T;
}

/**
 * 节流 Hook
 * 用于限制函数执行频率
 */
export function useThrottle<T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): T {
  const lastRun = useRef(Date.now());
  const timeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  
  return useCallback((...args: Parameters<T>) => {
    const now = Date.now();
    const timeSinceLastRun = now - lastRun.current;
    
    if (timeSinceLastRun >= delay) {
      lastRun.current = now;
      callback(...args);
    } else {
      if (timeout.current) {
        clearTimeout(timeout.current);
      }
      timeout.current = setTimeout(() => {
        lastRun.current = Date.now();
        callback(...args);
      }, delay - timeSinceLastRun);
    }
  }, [callback, delay]) as T;
}

/**
 * 延迟加载 Hook
 * 用于分批处理大数据
 */
export function useLazyLoad<T>(
  data: T[],
  pageSize: number = 20
): {
  displayData: T[];
  hasMore: boolean;
  loadMore: () => void;
  reset: () => void;
} {
  const [displayCount, setDisplayCount] = useState(pageSize);
  
  const displayData = useMemo(
    () => data.slice(0, displayCount),
    [data, displayCount]
  );
  
  const hasMore = displayCount < data.length;
  
  const loadMore = useCallback(() => {
    setDisplayCount(prev => Math.min(prev + pageSize, data.length));
  }, [data.length, pageSize]);
  
  const reset = useCallback(() => {
    setDisplayCount(pageSize);
  }, [pageSize]);
  
  // 当数据变化时重置
  useEffect(() => {
    reset();
  }, [data, reset]);
  
  return { displayData, hasMore, loadMore, reset };
}

/**
 * 性能测量 Hook
 * 用于测量操作执行时间
 */
export function usePerformanceMeasure(name: string) {
  const startMeasure = useCallback(() => {
    if (typeof performance !== 'undefined') {
      performance.mark(`${name}-start`);
    }
  }, [name]);
  
  const endMeasure = useCallback(() => {
    if (typeof performance !== 'undefined') {
      performance.mark(`${name}-end`);
      performance.measure(name, `${name}-start`, `${name}-end`);
      
      const measure = performance.getEntriesByName(name)[0];
      // 在开发环境中输出
      // if (measure) {
      //   console.log(`[Performance] ${name}: ${measure.duration.toFixed(2)}ms`);
      // }
      
      // 清理标记
      performance.clearMarks(`${name}-start`);
      performance.clearMarks(`${name}-end`);
      performance.clearMeasures(name);
      
      return measure?.duration;
    }
    return 0;
  }, [name]);
  
  return { startMeasure, endMeasure };
}

/**
 * 内存使用监控 Hook
 */
export function useMemoryMonitor(threshold: number = 50 * 1024 * 1024) { // 50MB
  const checkMemory = useCallback(() => {
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      const usedMemory = memory.usedJSHeapSize;
      const totalMemory = memory.totalJSHeapSize;
      const usage = (usedMemory / totalMemory) * 100;
      
      if (usedMemory > threshold) {
        console.warn(`[Memory Warning] High memory usage: ${(usedMemory / 1024 / 1024).toFixed(2)}MB (${usage.toFixed(1)}%)`);
        return true;
      }
    }
    return false;
  }, [threshold]);
  
  return { checkMemory };
}

// 添加缺失的 import
import { useState } from 'preact/hooks';
