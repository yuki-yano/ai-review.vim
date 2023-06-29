# ai-review.nvim

This plugin uses OpenAI's API for code review, etc.

This plugin depends on [denops.vim](https://github.com/vim-denops/denops.vim).

## Demo

https://user-images.githubusercontent.com/5423775/218340551-7bac325a-d21e-4865-9cde-389766497b57.mp4

## Usage

Set `OPENAI_API_KEY` environment variable and execute `:AiReview` or `:'<,'>AiReview`

```lua
require('ai-review').setup({
  chat_gpt = {
    model = 'gpt-3.5-turbo', -- or gpt-4
  },
  requests = {
    -- request array
    -- SEE: https://github.com/yuki-yano/ai-review.nvim/blob/main/lua/ai-review/open-ai/request.lua
    ---@param opts ai-review.request.Options
    ---@return ai-review.open-ai.Request

    -- ai-review.request.Options Interface
    ---@class ai-review.request.Options
    ---@field file_type string
    ---@field first_line number
    ---@field last_line number
    ---@field bufnr number

    -- ai-review.open-ai.Request Interface
    ---@class ai-review.open-ai.Request
    ---@field context string
    ---@field text string
    ---@field code string
    ---@field file_type string
  }
})
```

## Required

- [denops.vim](https://github.com/vim-denops/denops.vim)
- [nui.nvim](https://github.com/MunifTanjim/nui.nvim)

## Acknowledgements

- [butler.vim](https://github.com/lambdalisue/butler.vim)
