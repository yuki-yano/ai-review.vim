import { OPENAI_API_BASE, OPENAI_MAX_TOKENS } from "../constant.ts"
import { TextLineStream } from "../deps/std.ts"
import { modelSelector } from "../store/config.ts"
import { ChatGptMessage } from "../types.ts"

const ORGANIZATION = Deno.env.get("OPENAI_ORGANIZATION") ?? ""
const API_KEY = Deno.env.get("OPENAI_API_KEY")

type Client = {
  completions: typeof completions
}

async function request(path: string, init: RequestInit): Promise<Response> {
  init.method = init.method ?? "POST"

  const headers = new Headers(init.headers)
  headers.set("Authorization", `Bearer ${API_KEY}`)
  headers.set("Content-Type", "application/json")
  headers.set("OpenAI-Organization", ORGANIZATION)
  init.headers = headers

  return await fetch(`${OPENAI_API_BASE}${path}`, init)
}

async function completions({ messages }: { messages: ReadonlyArray<ChatGptMessage> }) {
  const res = await request("/completions", {
    body: JSON.stringify({
      model: modelSelector(),
      messages: messages,
      max_tokens: OPENAI_MAX_TOKENS,
      stream: true,
    }),
  })

  if (res.status !== 200) {
    console.error(res)
    throw new Error(`Failed to get completions: ${res.status}`)
  }

  return res
    .body!.pipeThrough(new TextDecoderStream())
    .pipeThrough(new TextLineStream())
    .pipeThrough(new CompletionsStream())
}

export function getOpenAiClient(): Client {
  if (API_KEY == null) {
    throw new Error("OPENAI_API_KEY is not set")
  }

  return {
    completions,
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

    if (choice?.delta.content != null) {
      controller.enqueue(choice.delta.content)
    }
  }
}
