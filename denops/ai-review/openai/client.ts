import { OPENAI_MAX_TOKENS } from "../constant.ts"
import {
  ChatCompletionFunctions,
  ChatCompletionRequestMessage,
  Configuration,
  OpenAIApi,
  OpenAIStream,
} from "../deps/ai.ts"
import { createTwoFilesPatch } from "../deps/utils.ts"
import { modelSelector } from "../store/config.ts"

const ORGANIZATION = Deno.env.get("OPENAI_ORGANIZATION") ?? ""
const API_KEY = Deno.env.get("OPENAI_API_KEY")

type Client = {
  completions: typeof completions
}

const COMPLETION_BASE_PARAMS = {
  max_tokens: OPENAI_MAX_TOKENS,
  stream: true,
}

const functions: Array<ChatCompletionFunctions> = [
  {
    name: "get_patch",
    description: "Get the diff between the original code and the changed code",
    parameters: {
      type: "object",
      properties: {
        diff: {
          type: "string",
          description: "The diff between the original code and the changed code",
        },
      },
      required: ["originalCode", "newCode"],
    },
  },
]

const createPatchFromDiff = ({ originalCode, newCode }: { originalCode: string; newCode: string }) => {
  console.log({ originalCode, newCode })
  return createTwoFilesPatch("a.txt", "b.txt", originalCode, newCode, "", "")
}

async function completions(
  { messages }: { messages: Array<ChatCompletionRequestMessage> },
): Promise<ReadableStream<string>> {
  const config = new Configuration({
    apiKey: API_KEY,
    organization: ORGANIZATION,
  })
  const openai = new OpenAIApi(config)

  const res = await openai.createChatCompletion({
    ...COMPLETION_BASE_PARAMS,
    model: modelSelector(),
    messages,
    functions,
  })

  return OpenAIStream(res, {
    experimental_onFunctionCall: async (functionCallPayload, createFunctionCallMessages) => {
      if (functionCallPayload.name === "get_patch") {
        console.log(functionCallPayload.arguments)

        // return await openai.createChatCompletion({
        //   ...COMPLETION_BASE_PARAMS,
        //   model: modelSelector(),
        //   messages: messages,
        //   functions,
        // })
      }
    },
  }).pipeThrough(new TextDecoderStream())
}

export function getOpenAiClient(): Client {
  if (API_KEY == null) {
    throw new Error("OPENAI_API_KEY is not set")
  }

  return {
    completions,
  }
}
