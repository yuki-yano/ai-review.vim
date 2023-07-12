import { Denops, fn } from "./deps/denops.ts"
import { dayjs } from "./deps/utils.ts"
import { logDirSelector } from "./store/config.ts"
import { OpenAiRequest, OpenAiResponse, ReviewWindow } from "./types.ts"

export const getLogFiles = async (): Promise<Array<{ name: string; path: string }>> => {
  const logDir = logDirSelector()
  let logs: Array<{ name: string; path: string }> = []
  for await (const file of Deno.readDir(logDir)) {
    if (file.isFile && file.name.endsWith(".json")) {
      logs = [...logs, { name: file.name, path: `${logDir}/${file.name}` }]
    }
  }

  return logs.toSorted((a, b) => {
    if (a.name > b.name) {
      return -1
    }
    if (a.name < b.name) {
      return 1
    }
    return 0
  })
}

export const createLogFile = async (
  denops: Denops,
  {
    name,
    request,
    response,
    responseWindow,
  }: {
    name: string | undefined
    request: OpenAiRequest
    response: OpenAiResponse
    responseWindow: ReviewWindow
  },
): Promise<void> => {
  const logDir = logDirSelector()
  const file = `${logDir}/${
    dayjs().format(
      "YYYY-MM-DD-HH-mm-ss",
    )
  }${name ? `-${name}` : ""}.json`
  const previewText = await fn.getbufline(denops, responseWindow.bufnr, 1, "$")

  await Deno.mkdir(logDir, { recursive: true })
  await Deno.writeTextFile(
    file,
    JSON.stringify({
      request,
      messages: response.messages,
      preview: previewText,
    }),
  )
}

export const readLogFile = async ({
  file,
}: {
  file: string
}): Promise<{
  request: OpenAiRequest
  messages: OpenAiResponse["messages"]
  preview: Array<string>
}> => {
  const json = await Deno.readTextFile(file)
  const { request, messages, preview } = JSON.parse(json)
  return { request, messages, preview }
}
