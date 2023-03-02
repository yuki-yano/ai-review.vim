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
  messages: ReadonlyArray<ChatGptMessage>
  abortController?: AbortController
}
