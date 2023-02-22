export type OpenAiRequest = {
  context: string
  text: string
  code: string
  fileType: string
}

export type OpenAiResponse = {
  text: string
  abortController?: AbortController
}
