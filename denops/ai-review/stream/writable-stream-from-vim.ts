import { buffer, Denops, fn } from "../deps/denops.ts"

// See: https://github.com/lambdalisue/butler.vim/blob/main/denops/butler/stream/writable_stream_from_vim.ts
export function writableStreamFromVim(
  denops: Denops,
  winid: number,
  bufnr: number,
  callback?: (chunk: string) => Promise<void>,
): WritableStream<string> {
  return new WritableStream({
    write: async (chunk, _controller) => {
      const remaining = (await fn.getbufline(denops, bufnr, "$")).join("\n")
      const newLines = chunk.split("\n")
      newLines[0] = remaining + newLines[0]
      await buffer.modifiable(denops, bufnr, async () => {
        await fn.setbufline(denops, bufnr, "$", newLines)
      })
      await fn.win_execute(denops, winid, "normal! G$")

      if (callback != null) {
        await callback(chunk)
      }
    },
  })
}
