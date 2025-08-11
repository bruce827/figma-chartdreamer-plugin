import { once, showUI } from '@create-figma-plugin/utilities'

import { HelloHandler } from './types'

export default function () {
  // 监听来自 UI 的 Hello 消息
  once<HelloHandler>('HELLO_MESSAGE', function (message: string) {
    // 在 Figma 中显示通知
    figma.notify(`✅ ${message}`, {
      timeout: 3000
    })

    // 打印到控制台用于调试
    // eslint-disable-next-line no-console
    console.log('收到消息:', message)
  })

  // 显示插件 UI
  showUI({
    height: 300,
    width: 320,
    title: 'ChartDreamer'
  })
}
