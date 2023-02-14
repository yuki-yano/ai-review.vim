import {
  getOpenaiAddCommentsRequest,
  getOpenaiAddTestsRequest,
  getOpenaiExplainRequest,
  getOpenaiFindBugsRequest,
  getOpenaiOptimizeRequest,
  OPENAI_ADD_COMMENTS,
  OPENAI_ADD_TESTS,
  OPENAI_API_BASE,
  OPENAI_BASE_CONTEXT,
  OPENAI_EXPLAIN,
  OPENAI_FIND_BUGS,
  OPENAI_MAX_TOKENS,
  OPENAI_MODEL,
  OPENAI_OPTIMIZE,
  OPENAI_USE_RAW_INPUT,
} from "../constant.ts"
import { TextLineStream } from "../deps/std.ts"
import { OpenAiModes, OpenAiRequest } from "../types.ts"

const ORGANIZATION = Deno.env.get("OPENAI_ORGANIZATION") ?? ""
const API_KEY = Deno.env.get("OPENAI_API_KEY")

type Client = {
  completions: typeof completions
}

const request = async (path: string, init: RequestInit): Promise<Response> => {
  init.method = init.method ?? "POST"

  init.headers = new Headers(init.headers)
  init.headers.set("Authorization", `Bearer ${API_KEY}`)
  init.headers.set("Content-Type", "application/json")
  init.headers.set("OpenAI-Organization", ORGANIZATION)

  return await fetch(`${OPENAI_API_BASE}${path}`, init)
}

const completions = async ({ prompt }: { prompt: string }) => {
  const res = await request("/completions", {
    body: JSON.stringify({
      model: OPENAI_MODEL,
      prompt,
      max_tokens: OPENAI_MAX_TOKENS,
      stream: true,
      // TODO: Setting temperature
      temperature: 1,
    }),
  })

  if (res.status !== 200) {
    console.error(res)
    throw new Error(`Failed to get completions: ${res.status}`)
  }

  return res.body!.pipeThrough(new TextDecoderStream())
    .pipeThrough(new TextLineStream())
    .pipeThrough(new CompletionsStream())
}

export const getOpenAiClient = (): Client => {
  if (API_KEY == null) {
    throw new Error("OPENAI_API_KEY is not set")
  }

  return {
    completions,
  }
}

const displayRequestWithCodeBlock = (
  request: string,
  code: string,
  filetype: string,
): string => {
  return `${request}\n\n\`\`\`${filetype}\n${code}\n\`\`\`\n`
}

export const getOpenAiRequest = (
  mode: OpenAiModes,
  code: string,
  fileType: string,
): OpenAiRequest => {
  switch (mode) {
    case OPENAI_FIND_BUGS: {
      return {
        context: OPENAI_BASE_CONTEXT,
        text: displayRequestWithCodeBlock(
          getOpenaiFindBugsRequest(fileType),
          code,
          fileType,
        ),
        code,
        fileType,
      }
    }
    case OPENAI_OPTIMIZE: {
      return {
        context: OPENAI_BASE_CONTEXT,
        text: displayRequestWithCodeBlock(
          getOpenaiOptimizeRequest(fileType),
          code,
          fileType,
        ),
        code,
        fileType,
      }
    }
    case OPENAI_ADD_COMMENTS: {
      return {
        context: OPENAI_BASE_CONTEXT,
        text: displayRequestWithCodeBlock(
          getOpenaiAddCommentsRequest(fileType),
          code,
          fileType,
        ),
        code,
        fileType,
      }
    }
    case OPENAI_ADD_TESTS: {
      return {
        context: OPENAI_BASE_CONTEXT,
        text: displayRequestWithCodeBlock(
          getOpenaiAddTestsRequest(fileType),
          code,
          fileType,
        ),
        code,
        fileType,
      }
    }
    case OPENAI_EXPLAIN: {
      return {
        context: OPENAI_BASE_CONTEXT,
        text: displayRequestWithCodeBlock(
          getOpenaiExplainRequest(fileType),
          code,
          fileType,
        ),
        code,
        fileType,
      }
    }
    case OPENAI_USE_RAW_INPUT: {
      return {
        context: OPENAI_BASE_CONTEXT,
        text: code,
        code,
        fileType,
      }
    }
    default: {
      mode satisfies never
      throw new Error("Invalid mode")
    }
  }
}

// See: https://github.com/lambdalisue/butler.vim/blob/main/denops/butler/openai/completions.ts
class CompletionsStream extends TransformStream<string, string> {
  #prefix = "data: "
  #index: number

  constructor(index = 0) {
    super({
      transform: (chunk, controller) => this.#handle(chunk, controller),
    })
    this.#index = index
  }

  #handle(
    chunk: string,
    controller: TransformStreamDefaultController<string>,
  ): void {
    chunk = chunk.trim()
    if (!chunk.length) {
      return
    }
    if (!chunk.startsWith(this.#prefix)) {
      controller.error(`The chunk is not expected format: ${chunk}`)
      return
    }
    const data = chunk.substring(this.#prefix.length)
    if (data === "[DONE]") {
      controller.terminate()
      return
    }
    const result = JSON.parse(data)
    const choice = result.choices[this.#index]
    controller.enqueue(choice.text)
  }
}

export function getOpenAiRequestFileType(mode: OpenAiModes, fileType: string): string {
  return mode !== OPENAI_USE_RAW_INPUT ? fileType : "text"
}
