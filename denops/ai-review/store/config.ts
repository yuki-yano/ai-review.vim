import { PayloadAction, redux } from "../deps/store.ts"
import { store } from "./index.ts"
const { createSlice } = redux

export type Config = {
  chat_gpt: {
    model: string
    // Not use TypeScript
    // requests: Array
  }
  log_dir: string
}

type ConfigState = {
  config: Config
}

const configInitialState: ConfigState = {
  // Set from config.lua
  config: {
    chat_gpt: {
      model: "",
    },
    log_dir: "",
  },
}

export const configSlice = createSlice({
  name: "config",
  initialState: configInitialState,
  reducers: {
    setup: (state, action: PayloadAction<ConfigState>) => {
      // TODO: validate config
      state.config = action.payload.config
    },
  },
})

export const modelSelector = (): string => store.getState().config.config.chat_gpt.model
export const logDirSelector = (): string => store.getState().config.config.log_dir
