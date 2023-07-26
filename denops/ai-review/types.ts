import { ChatCompletionRequestMessage } from "./deps/ai.ts"

export type ReviewWindow = {
  winid: number
  bufnr: number
  text: string
}

export type OpenAiRequest = {
  context: string
  text: string
  code: string
  fileType: string
}

export type OpenAiResponse = {
  messages: Array<ChatCompletionRequestMessage>
  abortController?: AbortController
}
