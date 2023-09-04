import { PayloadAction, redux } from "../deps/store.ts";
import { store } from "./index.ts";
const { createSlice } = redux;

export type Config = {
  log_dir: string;
  chat_gpt: {
    model: string;
    azure: AzureConfig;
    // Not use TypeScript
    // requests: Array
  };
};
type AzureConfig = {
  use: boolean;
  url: string;
  api_version: string;
};

type ConfigState = {
  config: Config;
};

const configInitialState: ConfigState = {
  config: {
    log_dir: "",
    chat_gpt: {
      model: "",
      azure: {
        use: false,
        url: "",
        api_version: "",
      },
    },
  },
};

export const configSlice = createSlice({
  name: "config",
  initialState: configInitialState,
  reducers: {
    config: (state, action: PayloadAction<ConfigState>) => {
      const input = action.payload.config;
      validate(input);
      state.config = input;
    },
  },
});

const validate = (config: Config) => {
  if (config.chat_gpt.model === "") {
    throw new Error("chatGPT model is empty");
  }
  const azureConfig = config.chat_gpt.azure;
  if (azureConfig.use) {
    console.log(azureConfig);
    if (azureConfig.url === "") {
      throw new Error("chatGPT azure.url is empty");
    }
    if (azureConfig.api_version === "") {
      throw new Error("chatGPT azure.api_version is empty");
    }
  }
};

export const modelSelector = (): string =>
  store.getState().config.config.chat_gpt.model;
export const azureConfigSelector = (): AzureConfig =>
  store.getState().config.config.chat_gpt.azure;
export const logDirSelector = (): string =>
  store.getState().config.config.log_dir;
