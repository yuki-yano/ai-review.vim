import { OPENAI_REVIEW_BUFFER } from "../constant.ts"
import { autocmd, buffer, Denops, fn, variable } from "../deps/denops.ts"
import { OpenAiRequest, ReviewWindow } from "../types.ts"
import { writeBuffer } from "../vim.ts"

export async function openResponseBuffer(
  denops: Denops,
  {
    request,
    requestWindow,
    responseWindow,
    log,
  }: {
    request: OpenAiRequest
    requestWindow: ReviewWindow | undefined
    responseWindow: ReviewWindow | undefined
    log?: Array<string>
  },
): Promise<ReviewWindow> {
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
      ["BufDelete", "WinClosed"],
      "<buffer>",
      `call denops#request("${denops.name}", "closeResponse", [])`,
    )

    responseWindow = { ...result, text: "" }
  }

  const { winid, bufnr } = responseWindow

  // resume
  if (log != null) {
    await writeBuffer(denops, { text: log.join("\n"), winid, bufnr })
  } else {
    if ((await fn.getbufline(denops, bufnr, "$"))[0] !== "") {
      await writeBuffer(denops, { text: "\n\n", winid, bufnr })
    }

    await writeBuffer(denops, { text: "## Request\n\n", winid, bufnr })
    await writeBuffer(denops, { text: request.text, winid, bufnr })
    await writeBuffer(denops, { text: "\n\n## Response\n\n", winid, bufnr })
  }

  const lines = (await variable.options.get(denops, "lines")) as number
  await fn.win_execute(
    denops,
    requestWindow.winid,
    `horizontal resize${Math.floor(lines / 3)}`,
  )
  await fn.win_gotoid(denops, requestWindow.winid)

  return responseWindow
}
