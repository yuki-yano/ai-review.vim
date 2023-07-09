import "./store/index.ts"

import { Denops, fn } from "./deps/denops.ts"
import { OpenAiRequest, OpenAiResponse } from "./types.ts"
import { OPENAI_REQUEST_EDITING_HEADER } from "./constant.ts"
import { dispatch } from "./store/index.ts"
import {
  ensureRequestBuffer,
  ensureResponseBuffer,
  openAiLoadingSelector,
  openAiRequestSelector,
  openAiResponseSelector,
  openAiResponseWindowSelector,
  openAiSlice,
  saveResponse,
  writeResponse,
} from "./store/openai.ts"
import { Config, configSlice, logDirSelector } from "./store/config.ts"
import { getLogFiles, readLogFile } from "./log.ts"

export const main = async (denops: Denops): Promise<void> => {
  denops.dispatcher = {
    setup: async (config: unknown): Promise<void> => {
      dispatch(configSlice.actions.setup({ config: config as Config }))
      return await Promise.resolve()
    },
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
      dispatch(openAiSlice.actions.closeResponse())
      return await Promise.resolve()
    },
    cancelResponse: async (): Promise<void> => {
      dispatch(openAiSlice.actions.cancelResponse())
      return await Promise.resolve()
    },
    openRequest: async (request): Promise<void> => {
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
      dispatch(
        openAiSlice.actions.updateRequestText({ text: requestText.join("\n") }),
      )
    },
    closeRequest: async (): Promise<void> => {
      dispatch(openAiSlice.actions.resetRequest())
      return await Promise.resolve()
    },
    saveResponse: async (name): Promise<void> => {
      const loading = openAiLoadingSelector()
      if (loading) {
        throw new Error("Already loading")
      }

      const request = openAiRequestSelector()
      const response = openAiResponseSelector()
      const responseWindow = openAiResponseWindowSelector()

      if (request == null || response == null || responseWindow == null) {
        throw new Error("Request or Response or response window is not found")
      }

      await dispatch(
        saveResponse({
          denops,
          name: (name as string | undefined)?.replaceAll(" ", "_"),
          request,
          response,
          responseWindow,
        }),
      )
    },
    resume: async (path): Promise<void> => {
      const { request, messages, preview } = await readLogFile({ file: path as string })
      await dispatch(
        ensureRequestBuffer({
          denops,
          request: {
            context: "",
            text: "",
            code: "",
            fileType: "",
          },
        }),
      )

      await dispatch(ensureResponseBuffer({ denops, request, log: preview }))
      dispatch(
        openAiSlice.actions.resume({
          request: request as OpenAiRequest,
          response: {
            messages: messages as OpenAiResponse["messages"],
          },
        }),
      )
    },
    logDir: async (): Promise<string> => {
      return await Promise.resolve(logDirSelector())
    },
    logList: async (): Promise<Array<{ name: string; path: string }>> => {
      return await getLogFiles()
    },
  }

  return await Promise.resolve()
}
