import { ActionArguments, ActionFlags, BaseKind, DduItem, Previewer } from "../ai-review/deps/ddu.ts"
import { fn } from "../ai-review/deps/denops.ts"

export type ActionData = {
  dir: string
  path: string
}

type Params = Record<string, never>

export class Kind extends BaseKind<Params> {
  actions: Record<
    string,
    (args: ActionArguments<Params>) => Promise<ActionFlags>
  > = {
    resume: async ({ denops, items }: ActionArguments<Params>) => {
      if (items.length !== 1) {
        throw new Error("Invalid number of items")
      }

      await denops.call("ai_review#safe_notify", "resume", [
        (items[0].action as ActionData).path,
      ])
      return Promise.resolve(ActionFlags.None)
    },
    delete: async ({ items }: ActionArguments<Params>) => {
      items.forEach((item) => {
        Deno.removeSync((item.action as ActionData).path)
      })

      return await Promise.resolve(ActionFlags.RefreshItems)
    },
    rename: async ({ denops, items }: ActionArguments<Params>) => {
      if (items.length !== 1) {
        throw new Error("Invalid number of items")
      }

      const dir = (items[0].action as ActionData).dir
      const oldPath = (items[0].action as ActionData).path

      const matchedGroups = oldPath.match(/(\d{4}-\d{2}-\d{2}-\d{2}-\d{2}-\d{2})-?(.+)?(\.json)/)
      if (matchedGroups == null) {
        throw new Error("Invalid file format")
      }

      const datePart = matchedGroups[1]
      const oldName = matchedGroups[2]

      const newName = await fn.input(denops, "New name: ", oldName)
      if (newName == null) {
        return Promise.resolve(ActionFlags.None)
      }

      const newFileName = `${datePart}${newName == "" ? "" : `-${newName.replaceAll(" ", "_")}`}`
      Deno.renameSync(oldPath, `${dir}/${newFileName}.json`)

      return await Promise.resolve(ActionFlags.RefreshItems)
    },
  }

  async getPreviewer(args: { item: DduItem }): Promise<Previewer | undefined> {
    const action = args.item.action as ActionData
    if (action?.path == null) {
      return Promise.resolve(undefined)
    }

    const json = await Deno.readTextFile(action.path)
    const { preview } = JSON.parse(json)

    return {
      kind: "nofile",
      contents: preview,
      filetype: "markdown",
    }
  }

  params(): Params {
    return {}
  }
}
