import { OPENAI_MAX_TOKENS } from "../constant.ts"
import {
  ChatCompletionRequestMessage,
  Configuration,
  OpenAIApi,
  OpenAIStream,
} from "../deps/ai.ts"
import { azureConfigSelector, modelSelector } from "../store/config.ts"

const ORGANIZATION = Deno.env.get("OPENAI_ORGANIZATION") ?? ""
const API_KEY = Deno.env.get("OPENAI_API_KEY")

type Client = {
  completions: typeof completions
}

async function completions({
  messages,
}: {
  messages: Array<ChatCompletionRequestMessage>
}): Promise<ReadableStream<string>> {
  const azureConfig = azureConfigSelector()
  const config: Configuration = azureConfig.use
    ? new Configuration({
      apiKey: API_KEY,
      baseOptions: {
        headers: {
          "api-key": API_KEY,
        },
      },
      basePath: azureConfig.url,
      defaultQueryParams: new URLSearchParams({
        "api-version": azureConfig.api_version,
      }),
    })
    : new Configuration({
      apiKey: API_KEY,
      organization: ORGANIZATION,
    })
  const openai = new OpenAIApi(config)

  const res = await openai.createChatCompletion({
    model: modelSelector(),
    max_tokens: OPENAI_MAX_TOKENS,
    stream: true,
    messages,
  })

  return OpenAIStream(res).pipeThrough(new TextDecoderStream())
}

export function getOpenAiClient(): Client {
  if (API_KEY == null) {
    throw new Error("OPENAI_API_KEY is not set")
  }

  return {
    completions,
  }
}
