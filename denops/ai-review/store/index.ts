import { redux } from "../deps/store.ts"
import { openAiSlice } from "./openai.ts"

const { configureStore } = redux

export const store = configureStore({
  reducer: { openAi: openAiSlice.reducer },
})

export type RootState = ReturnType<typeof store.getState>

// SEE: https://github.com/reduxjs/redux-toolkit/issues/587#issuecomment-1049488808
type TypedDispatch = redux.ThunkDispatch<ReturnType<typeof store.getState>, unknown, redux.AnyAction>

const dispatch = store.dispatch as TypedDispatch
export { dispatch }
