import { BaseSource, Item } from "https://deno.land/x/ddu_vim@v3.4.1/types.ts"
import { Denops } from "../ai-review/deps/denops.ts"
import { ActionData } from "../@ddu-kinds/ai-review-request.ts"

type Request = {
  title: string
  request: {
    context: string
    text: string
    code: string
    file_type: string
  }
}

type Params = {
  requests: Array<Request>
}

export class Source extends BaseSource<Params> {
  kind = "ai-review-request"

  gather({
    sourceParams,
  }: {
    denops: Denops
    sourceParams: Params
  }): ReadableStream<Array<Item<ActionData>>> {
    return new ReadableStream({
      start(controller) {
        controller.enqueue(
          sourceParams.requests.map((request) => {
            return {
              word: request.title,
              action: {
                request: {
                  context: request.request.context,
                  text: request.request.text,
                  code: request.request.code,
                  fileType: request.request.file_type,
                },
                preview: request.request.text,
              },
            }
          }),
        )
        controller.close()
      },
    })
  }

  params(): Params {
    return {
      requests: [],
    }
  }
}
