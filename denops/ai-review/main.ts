import "./store/index.ts"

import { Denops, fn } from "./deps/denops.ts"
import { unknownutil } from "./deps/utils.ts"
import { getOpenAiRequestFileType, getOpenAiRequest } from "./openai/client.ts"
import { OpenAiModes } from "./types.ts"
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
import { getRequestContext } from "./vim/request.ts"

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
    openRequest: async (
      mode,
      firstLine,
      lastLine,
      originalBufnr,
    ): Promise<void> => {
      unknownutil.assertString(mode)
      unknownutil.assertNumber(firstLine)
      unknownutil.assertNumber(lastLine)
      unknownutil.assertNumber(originalBufnr)
      const { code, fileType } = await getRequestContext(denops, {
        firstLine,
        lastLine,
        bufnr: originalBufnr,
      })

      const requestCodeFileType = getOpenAiRequestFileType(
        mode as OpenAiModes,
        fileType,
      )

      const request = getOpenAiRequest(
        mode as OpenAiModes,
        code,
        requestCodeFileType,
      )

      await dispatch(ensureRequestBuffer({ denops, request }))
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
    requestPreview: async (
      mode,
      firstLine,
      lastLine,
      originalBufnr,
    ): Promise<string> => {
      unknownutil.assertString(mode)
      unknownutil.assertNumber(firstLine)
      unknownutil.assertNumber(lastLine)
      unknownutil.assertNumber(originalBufnr)

      const { code, fileType } = await getRequestContext(denops, {
        firstLine,
        lastLine,
        bufnr: originalBufnr,
      })
      const requestCodeFileType = getOpenAiRequestFileType(
        mode as OpenAiModes,
        fileType,
      )
      const request = getOpenAiRequest(
        mode as OpenAiModes,
        code,
        requestCodeFileType,
      )

      return request.text
    },
  }

  return await Promise.resolve()
}
