import { PayloadAction, redux } from "../deps/store.ts"
import { store } from "./index.ts"
const { createSlice } = redux

export type Config = {
  chat_gpt: {
    model: string
    // Not use TypeScript
    // requests: Array
  }
}

type ConfigState = {
  config: Config
}

const configInitialState: ConfigState = {
  config: {
    chat_gpt: {
      // Set from config.lua
      model: "",
    },
  },
}

export const configSlice = createSlice({
  name: "config",
  initialState: configInitialState,
  reducers: {
    setup: (state, action: PayloadAction<ConfigState>) => {
      state.config = action.payload.config
    },
  },
})

export const modelSelector = (): string => store.getState().config.config.chat_gpt.model
