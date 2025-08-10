interface FigmaMessage {
  type: string
  message?: string
  data?: any
  options?: any
}

declare global {
  const figma: {
    showUI: (html: string, options?: { width?: number; height?: number }) => void
    ui: {
      onmessage: (callback: (msg: FigmaMessage) => void) => void
    }
    notify: (message: string) => void
  }
  
  const __html__: string
  
  interface Window {
    parent: {
      postMessage: (message: { pluginMessage: FigmaMessage }, targetOrigin: string) => void
    }
  }
}

export {} 