import { OPENAI_REVIEW_BUFFER } from "../constant.ts"
import { autocmd, buffer, Denops, fn, variable } from "../deps/denops.ts"
import { Window } from "../store/openai.ts"
import { OpenAiRequest } from "../types.ts"
import { writeBuffer } from "../vim.ts"

export async function openResponseBuffer(
  denops: Denops,
  {
    request,
    requestWindow,
    responseWindow,
  }: {
    request: OpenAiRequest
    requestWindow: Window | undefined
    responseWindow: Window | undefined
  },
): Promise<Window> {
  if (requestWindow == null) {
    throw new Error("requestWindow is undefined")
  }

  if (responseWindow == null) {
    const result = await buffer.open(denops, OPENAI_REVIEW_BUFFER, {
      opener: "noswapfile split",
    })
    await fn.setbufvar(denops, result.bufnr, "&filetype", "markdown")
    await fn.setbufvar(denops, result.bufnr, "&buftype", "nofile")
    await fn.setbufvar(denops, result.bufnr, "&bufhidden", "hide")
    await fn.setbufvar(denops, result.bufnr, "&buflisted", false)

    await autocmd.define(
      denops,
      "WinClosed",
      "<buffer>",
      `call denops#request("${denops.name}", "closeResponse", [])`,
    )

    responseWindow = { ...result, text: "" }
  }

  const { winid, bufnr } = responseWindow

  if ((await fn.getbufline(denops, bufnr, "$"))[0] !== "") {
    await writeBuffer(denops, "\n\n", winid, bufnr)
  }

  await writeBuffer(denops, "## Request\n\n", winid, bufnr)
  await writeBuffer(denops, request.text, winid, bufnr)
  await writeBuffer(denops, "\n\n## Response\n", winid, bufnr)

  const lines = (await variable.options.get(denops, "lines")) as number
  await fn.win_execute(
    denops,
    requestWindow.winid,
    `horizontal resize${Math.floor(lines / 3)}`,
  )
  await fn.win_gotoid(denops, requestWindow.winid)

  return responseWindow
}
