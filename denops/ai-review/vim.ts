import { REQUEST_CURSOR_POSITION_MARKER } from "./constant.ts"
import { buffer, Denops, fn } from "./deps/denops.ts"

export async function writeBuffer(
  denops: Denops,
  {
    text,
    winid,
    bufnr,
    moveToEnd = true,
  }: {
    text: string
    winid: number
    bufnr: number
    moveToEnd?: boolean
  },
): Promise<void> {
  const remaining = (await fn.getbufline(denops, bufnr, "$")).join("\n")
  const newLines = text.split("\n")
  newLines[0] = remaining + newLines[0]

  await buffer.modifiable(denops, bufnr, async () => {
    await fn.setbufline(denops, bufnr, "$", newLines)
  })

  if (moveToEnd) {
    await fn.win_execute(denops, winid, "normal! G$")
  }
}

export async function moveCursorToMarker(
  denops: Denops,
): Promise<void> {
  await denops.call("ai_review#move_cursor_to_marker", REQUEST_CURSOR_POSITION_MARKER)
}
