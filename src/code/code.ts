figma.showUI(__html__, { width: 400, height: 500 })

figma.ui.onmessage = async (msg: any) => {
  if (msg.type === 'notify') {
    figma.notify(msg.message)
  }
  
  // 其他消息类型将在这里处理
  // 例如：生成桑基图、处理数据等
} 