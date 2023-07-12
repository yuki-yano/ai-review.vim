import { ActionArguments, ActionFlags, BaseKind, DduItem, Previewer } from "https://deno.land/x/ddu_vim@v3.4.1/types.ts"
import { OpenAiRequest } from "../ai-review/types.ts"

export type ActionData = {
  request: OpenAiRequest
  preview: string
}

type Params = Record<string, never>

export class Kind extends BaseKind<Params> {
  actions: Record<
    string,
    (args: ActionArguments<Params>) => Promise<ActionFlags>
  > = {
    open: async ({ denops, items }: ActionArguments<Params>) => {
      if (items.length !== 1) {
        throw new Error("Invalid number of items")
      }
      const item = items[0]
      const action = item.action as ActionData

      await denops.call("denops#request", "ai-review", "openRequest", [action.request])

      return Promise.resolve(ActionFlags.None)
    },
  }

  async getPreviewer(args: { item: DduItem }): Promise<Previewer | undefined> {
    const action = args.item.action as ActionData

    return await Promise.resolve({
      kind: "nofile",
      contents: action.preview.split("\n"),
      syntax: "markdown",
    })
  }

  params(): Params {
    return {}
  }
}
