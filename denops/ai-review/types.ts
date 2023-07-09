export type ReviewWindow = {
  winid: number
  bufnr: number
  text: string
}

export type ChatGptMessage = {
  role: "system" | "user" | "assistant"
  content: string
}

export type OpenAiRequest = {
  context: string
  text: string
  code: string
  fileType: string
}

export type OpenAiResponse = {
  messages: Array<ChatGptMessage>
  abortController?: AbortController
}
