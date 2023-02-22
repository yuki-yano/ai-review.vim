import "./store/index.ts"

import { Denops, fn } from "./deps/denops.ts"
import { OpenAiRequest } from "./types.ts"
import { OPENAI_REQUEST_EDITING_HEADER } from "./constant.ts"
import { dispatch } from "./store/index.ts"
import {
  ensureRequestBuffer,
  ensureResponseBuffer,
  openAiLoadingSelector,
  openAiRequestSelector,
  openAiSlice,
  writeResponse,
} from "./store/openai.ts"

export const main = async (denops: Denops): Promise<void> => {
  denops.dispatcher = {
    review: async (): Promise<void> => {
      const request = openAiRequestSelector()
      if (request == null) {
        return
      }

      const loading = openAiLoadingSelector()
      if (loading) {
        throw new Error("Already loading")
      }

      await dispatch(ensureResponseBuffer({ denops, request }))
      await dispatch(writeResponse({ denops, request }))
    },
    closeResponse: async (): Promise<void> => {
      dispatch(openAiSlice.actions.resetResponse())
      return await Promise.resolve()
    },
    cancelResponse: async (): Promise<void> => {
      dispatch(openAiSlice.actions.cancelResponse())
      return await Promise.resolve()
    },
    openRequest: async (
      request,
    ): Promise<void> => {
      await dispatch(
        ensureRequestBuffer({ denops, request: request as OpenAiRequest }),
      )
    },
    updateRequest: async (): Promise<void> => {
      const request = openAiRequestSelector()
      if (request == null) {
        return
      }

      const requestText = await fn.getline(
        denops,
        OPENAI_REQUEST_EDITING_HEADER.split("\n").length,
        "$",
      )
      dispatch(openAiSlice.actions.updateRequestText({ text: requestText.join("\n") }))
    },
    closeRequest: async (): Promise<void> => {
      dispatch(openAiSlice.actions.resetRequest())
      return await Promise.resolve()
    },
  }

  return await Promise.resolve()
}
