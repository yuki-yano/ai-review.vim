import { BaseSource, Item } from "../ai-review/deps/ddu.ts"
import { Denops } from "../ai-review/deps/denops.ts"
import { ActionData } from "../@ddu-kinds/ai-review-log.ts"

type Params = Record<string, never>

export class Source extends BaseSource<Params> {
  kind = "ai-review-log"

  gather(args: {
    denops: Denops
    sourceParams: Params
  }): ReadableStream<Array<Item<ActionData>>> {
    return new ReadableStream({
      async start(controller) {
        const dir = await args.denops.call("denops#request", "ai-review", "logDir", []) as string
        let items: Array<Item<ActionData>> = []

        for await (const entry of Deno.readDir(dir)) {
          if (entry.isFile && entry.name.endsWith(".json")) {
            const path = `${dir}/${entry.name}`

            items = [
              ...items,
              {
                word: entry.name.replace(/\.[^/.]+$/, ""),
                action: {
                  dir,
                  path: path,
                },
              },
            ]
          }
        }

        controller.enqueue(items.toSorted((a, b) => {
          if (a.word > b.word) {
            return -1
          }
          if (a.word < b.word) {
            return 1
          }
          return 0
        }))
        controller.close()
      },
    })
  }

  params(): Params {
    return {}
  }
}
