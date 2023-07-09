import { OPENAI_SEPARATOR_LINE } from "../constant.ts"
import { Denops } from "../deps/denops.ts"
import { PayloadAction, redux } from "../deps/store.ts"
import { getOpenAiClient } from "../openai/client.ts"
import { writableStreamFromVim } from "../stream/writable-stream-from-vim.ts"
import { OpenAiRequest, OpenAiResponse, ReviewWindow } from "../types.ts"
import { createLogFile } from "../log.ts"
import { writeBuffer } from "../vim.ts"
import { openRequestBuffer } from "../vim/request.ts"
import { openResponseBuffer } from "../vim/response.ts"
import { RootState, store } from "./index.ts"

const { createSlice, createAsyncThunk } = redux

export type OpenAiState = {
  request?: OpenAiRequest
  response?: OpenAiResponse
  requestWindow?: ReviewWindow
  responseWindow?: ReviewWindow
  loading: boolean
}

const openAiInitialState: OpenAiState = {
  request: undefined,
  response: undefined,
  requestWindow: undefined,
  responseWindow: undefined,
  loading: false,
}

export const ensureRequestBuffer = createAsyncThunk<
  { request: OpenAiRequest; requestWindow: ReviewWindow },
  { denops: Denops; request: OpenAiRequest },
  { state: RootState }
>("openAi/ensureRequestBuffer", async ({ denops, request }, thunkApi) => {
  const requestWindow = thunkApi.getState().openAi.requestWindow
  const responseWindow = thunkApi.getState().openAi.responseWindow

  return {
    request,
    requestWindow: await openRequestBuffer(denops, {
      request,
      requestWindow,
      responseWindow,
    }),
  }
})

export const ensureResponseBuffer = createAsyncThunk<
  { responseWindow: ReviewWindow },
  { denops: Denops; request: OpenAiRequest; log?: Array<string> },
  { state: RootState }
>("openAi/ensureResponseBuffer", async ({ denops, request, log }, thunkApi) => {
  const requestWindow = thunkApi.getState().openAi.requestWindow
  const prevResponseWindow = thunkApi.getState().openAi.responseWindow

  const nextResponseWindow = await openResponseBuffer(denops, {
    request,
    requestWindow,
    responseWindow: prevResponseWindow,
    log,
  })

  return {
    responseWindow: nextResponseWindow,
  }
})

export const writeResponse = createAsyncThunk<
  void,
  { denops: Denops; request: OpenAiRequest },
  { state: RootState }
>("openAi/writeResponse", async ({ denops, request }, thunkApi) => {
  const response = thunkApi.getState().openAi.response
  const responseWindow = thunkApi.getState().openAi.responseWindow
  if (responseWindow == null || response == null) {
    return
  }

  const { winid, bufnr } = responseWindow
  const openAiClient = getOpenAiClient()
  try {
    const openAiStream = await openAiClient.completions({
      messages: [
        ...response.messages,
        {
          role: "user",
          content: request.text,
        },
      ],
    })
    thunkApi.dispatch(openAiSlice.actions.initNewMessage({ request }))

    let text = ""
    const dispatchText = (chunk: string) => {
      text += chunk
      thunkApi.dispatch(openAiSlice.actions.updateResponseText({ text }))
      return Promise.resolve()
    }

    const abortController = new AbortController()
    thunkApi.dispatch(
      openAiSlice.actions.setResponseAbortController({ abortController }),
    )
    await openAiStream.pipeTo(
      writableStreamFromVim(denops, winid, bufnr, dispatchText),
      { signal: abortController.signal },
    )
    await writeBuffer(denops, { text: OPENAI_SEPARATOR_LINE, winid, bufnr })
  } catch (e: unknown) {
    thunkApi.dispatch(openAiSlice.actions.abortResponse())
    await writeBuffer(denops, { text: "\n", winid, bufnr })
    await writeBuffer(denops, { text: (e as Error).message, winid, bufnr })
    await writeBuffer(denops, { text: OPENAI_SEPARATOR_LINE, winid, bufnr })
  }
})

export const saveResponse = createAsyncThunk<
  void,
  {
    denops: Denops
    name: string | undefined
    request: OpenAiRequest
    response: OpenAiResponse
    responseWindow: ReviewWindow
  },
  { state: RootState }
>(
  "openAi/saveResponse",
  async ({ denops, name, request, response, responseWindow }) => {
    await createLogFile(denops, { name, request, response, responseWindow })
  },
)

export const openAiSlice = createSlice({
  name: "openAi",
  initialState: openAiInitialState,
  reducers: {
    updateRequestText: (state, action: PayloadAction<{ text: string }>) => {
      if (state.request == null) {
        return
      }
      state.request.text = action.payload.text
    },
    initNewMessage: (
      state,
      action: PayloadAction<{ request: OpenAiRequest }>,
    ) => {
      if (state.response == null) {
        return
      }
      state.response.messages.push({
        role: "user",
        content: action.payload.request.text,
      })
      state.response.messages.push({
        role: "assistant",
        content: "",
      })
    },
    updateResponseText: (state, action: PayloadAction<{ text: string }>) => {
      if (state.response == null) {
        return
      }
      const lastIndex = state.response.messages.length - 1
      const lastMessage = state.response.messages[lastIndex]
      lastMessage.content = action.payload.text
      state.response.messages[lastIndex] = lastMessage
    },
    resetRequest: (state) => {
      state.request = undefined
      state.requestWindow = undefined
    },
    closeResponse: (state) => {
      state.response = undefined
      state.responseWindow = undefined
    },
    setResponseAbortController: (
      state,
      action: PayloadAction<{ abortController: AbortController }>,
    ) => {
      if (state.response == null) {
        return
      }
      state.response.abortController = action.payload.abortController
    },
    abortResponse: (state) => {
      state.loading = false
      state.response?.abortController?.abort()
    },
    cancelResponse: (state) => {
      state.loading = false

      state.response?.abortController?.abort()
      state.response = undefined
    },
    resume: (
      state,
      action: PayloadAction<{
        request: OpenAiRequest
        response: OpenAiResponse
      }>,
    ) => {
      state.request = action.payload.request
      state.response = action.payload.response
      state.loading = false
    },
  },
  extraReducers: (builder) => {
    builder.addCase(ensureRequestBuffer.fulfilled, (state, action) => {
      state.request = action.payload.request
      state.requestWindow = action.payload.requestWindow
    })
    builder.addCase(ensureResponseBuffer.fulfilled, (state, action) => {
      state.responseWindow = action.payload.responseWindow
      if (state.response == null) {
        state.response = {
          messages: [
            {
              role: "system",
              content: state.request?.context ?? "",
            },
          ],
        }
      }
      state.loading = true
    })
    builder.addCase(writeResponse.fulfilled, (state) => {
      state.loading = false
    })
  },
})

export const openAiRequestSelector = (): OpenAiState["request"] => store.getState().openAi.request
export const openAiResponseSelector = (): OpenAiState["response"] => store.getState().openAi.response
export const openAiLoadingSelector = (): OpenAiState["loading"] => store.getState().openAi.loading
export const openAiResponseWindowSelector = (): OpenAiState["responseWindow"] => store.getState().openAi.responseWindow
