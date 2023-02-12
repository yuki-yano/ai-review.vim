import { OPENAI_MODES } from "./constant.ts"

export type OpenAiModes = (typeof OPENAI_MODES)[number]
export type OpenAiRequest = {
  context: string
  displayText: string
  code: string
  fileType: string
}

export type OpenAiResponse = {
  text: string
}
