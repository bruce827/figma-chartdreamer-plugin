import {
  Button,
  Container,
  render,
  VerticalSpace,
  Text,
  Bold,
  Muted
} from '@create-figma-plugin/ui'
import { emit } from '@create-figma-plugin/utilities'
/** @jsx h */
import { h } from 'preact'
import { useCallback } from 'preact/hooks'

import { HelloHandler } from './types'

function Plugin() {
  const handleHelloButtonClick = useCallback(function () {
    // 发送消息到主线程（code.ts）
    emit<HelloHandler>('HELLO_MESSAGE', 'React component is running!')
  }, [])

  return (
    <Container space="medium">
      <VerticalSpace space="large" />

      <Text align="center">
        <Bold>🎨 ChartDreamer Plugin</Bold>
      </Text>

      <VerticalSpace space="medium" />

      <Text align="center">欢迎使用 ChartDreamer！</Text>

      <VerticalSpace space="large" />

      <Button fullWidth onClick={handleHelloButtonClick}>
        点击测试 Hello React Component
      </Button>

      <VerticalSpace space="small" />

      <Text align="center">
        <Muted>点击按钮在 Figma 中显示通知</Muted>
      </Text>

      <VerticalSpace space="small" />
    </Container>
  )
}

export default render(Plugin)
