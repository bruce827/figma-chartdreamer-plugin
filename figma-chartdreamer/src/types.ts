import { EventHandler } from '@create-figma-plugin/utilities'

export interface HelloHandler extends EventHandler {
  name: 'HELLO_MESSAGE'
  handler: (message: string) => void
}

export interface InsertCodeHandler extends EventHandler {
  name: 'INSERT_CODE'
  handler: (code: string) => void
}
