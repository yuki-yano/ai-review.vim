import { DIAGNOSTIC_SEVERITY, OPENAI_REQUEST_BUFFER, OPENAI_REQUEST_EDITING_HEADER } from "../constant.ts"
import { autocmd, buffer, Denops, fn, mapping, variable } from "../deps/denops.ts"
import { Window } from "../store/openai.ts"
import { Diagnostic, OpenAiRequest } from "../types.ts"
import { writeBuffer } from "../vim.ts"

type RequestContext = {
  code: string
  fileType: string
}

export async function getRequestContext(
  denops: Denops,
  {
    firstLine,
    lastLine,
    bufnr,
  }: {
    firstLine: number
    lastLine: number
    bufnr: number
  },
): Promise<RequestContext> {
  const code = (await fn.getbufline(denops, bufnr, firstLine, lastLine)).join("\n")
  const fileType = (await fn.getbufvar(denops, bufnr, "&filetype")) as string

  return {
    code,
    fileType: fileType ?? "",
  }
}

export async function getDiagnostics(denops: Denops, { firstLine, lastLine }: { firstLine: number; lastLine: number }) {
  const diagnostics = await denops.call("luaeval", "vim.diagnostic.get()", []) as Array<Diagnostic>
  return diagnostics.filter((diagnostic) =>
    // TODO: configurable
    ([DIAGNOSTIC_SEVERITY.ERROR, DIAGNOSTIC_SEVERITY.WARNING] as Array<Diagnostic["severity"]>).includes(
      diagnostic.severity,
    ) &&
    diagnostic.lnum >= firstLine && diagnostic.lnum <= lastLine
  )
}

export async function openRequestBuffer(denops: Denops, {
  request,
  requestWindow,
  responseWindow,
}: {
  request: OpenAiRequest
  requestWindow: Window | undefined
  responseWindow: Window | undefined
}): Promise<Window> {
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
    await fn.setbufvar(denops, result.bufnr, "&filetype", "markdown")
    await fn.setbufvar(denops, result.bufnr, "&buftype", "nofile")
    await fn.setbufvar(denops, result.bufnr, "&bufhidden", "hide")
    await fn.setbufvar(denops, result.bufnr, "&buflisted", false)

    const text = OPENAI_REQUEST_EDITING_HEADER + request.text
    await fn.win_execute(denops, result.winid, "normal! ggVGd")
    await writeBuffer(denops, text, result.winid, result.bufnr)

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

    return { ...result, text }
  } else {
    await fn.win_gotoid(denops, requestWindow.winid)
    await fn.win_execute(denops, requestWindow.winid, "normal! ggVGd")

    const text = OPENAI_REQUEST_EDITING_HEADER + request.text
    await writeBuffer(denops, text, requestWindow.winid, requestWindow.bufnr)

    return { ...requestWindow, text }
  }
}
