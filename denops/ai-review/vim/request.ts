import { OPENAI_REQUEST_BUFFER, OPENAI_REQUEST_EDITING_HEADER } from "../constant.ts"
import { autocmd, buffer, Denops, fn, mapping, variable } from "../deps/denops.ts"
import { OpenAiRequest, ReviewWindow } from "../types.ts"
import { moveCursorToMarker, writeBuffer } from "../vim.ts"

export async function openRequestBuffer(denops: Denops, {
  request,
  requestWindow,
  responseWindow,
}: {
  request: OpenAiRequest
  requestWindow: ReviewWindow | undefined
  responseWindow: ReviewWindow | undefined
}): Promise<ReviewWindow> {
  const lines = (await variable.options.get(denops, "lines")) as number
  const splitCommand = responseWindow == null
    ? "noswapfile vertical topleft split"
    : `noswapfile belowright ${Math.floor(lines / 3)}split`

  if (responseWindow != null) {
    await fn.win_gotoid(denops, responseWindow.winid)
  }

  if (requestWindow == null) {
    const result = await buffer.open(denops, OPENAI_REQUEST_BUFFER, {
      opener: splitCommand,
    })
    const { winid, bufnr } = result

    await fn.setbufvar(denops, bufnr, "&filetype", "markdown")
    await fn.setbufvar(denops, bufnr, "&buftype", "nofile")
    await fn.setbufvar(denops, bufnr, "&bufhidden", "hide")
    await fn.setbufvar(denops, bufnr, "&buflisted", false)

    await fn.win_execute(denops, winid, "normal! ggVGd")

    await writeBuffer(denops, { text: OPENAI_REQUEST_EDITING_HEADER, winid, bufnr })
    await writeBuffer(denops, { text: request.text, winid, bufnr, moveToEnd: false })
    await moveCursorToMarker(denops)

    await autocmd.define(
      denops,
      "TextChanged,TextChangedI,TextChangedP",
      "<buffer>",
      `call denops#request("${denops.name}", "updateRequest", [])`,
    )

    await autocmd.define(
      denops,
      "WinClosed",
      "<buffer>",
      `call denops#request("${denops.name}", "closeRequest", [])`,
    )

    await mapping.map(denops, "q", "<Cmd>quit<CR>", {
      noremap: true,
      mode: ["n"],
      silent: true,
      buffer: true,
    })
    await mapping.map(
      denops,
      "<CR>",
      `<Cmd>AiReviewResponse<CR>`,
      {
        noremap: true,
        mode: ["n"],
        silent: true,
        buffer: true,
      },
    )

    return { ...result, text: OPENAI_REQUEST_EDITING_HEADER + request.text }
  } else {
    const { winid, bufnr } = requestWindow
    await fn.win_gotoid(denops, winid)
    await fn.win_execute(denops, winid, "normal! ggVGd")

    await writeBuffer(denops, { text: OPENAI_REQUEST_EDITING_HEADER, winid, bufnr })
    await writeBuffer(denops, { text: request.text, winid, bufnr, moveToEnd: false })
    await moveCursorToMarker(denops)

    return { ...requestWindow, text: OPENAI_REQUEST_EDITING_HEADER + request.text }
  }
}
