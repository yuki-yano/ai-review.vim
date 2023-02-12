import { buffer, Denops, fn } from "./deps/denops.ts"

export async function writeBuffer(
  denops: Denops,
  text: string,
  winid: number,
  bufnr: number,
): Promise<void> {
  const remaining = (await fn.getbufline(denops, bufnr, "$")).join("\n")
  const newLines = text.split("\n")
  newLines[0] = remaining + newLines[0]

  await buffer.modifiable(denops, bufnr, async () => {
    await fn.setbufline(denops, bufnr, "$", newLines)
  })
  await fn.win_execute(denops, winid, "normal! G$")
}
