# ai-review.nvim

The ai-review.nvim plugin harnesses the power of OpenAI's API for conducting code reviews and more.

## Dependencies

This plugin relies on [denops.vim](https://github.com/vim-denops/denops.vim).

## Demonstrative Video

https://user-images.githubusercontent.com/5423775/218340551-7bac325a-d21e-4865-9cde-389766497b57.mp4

## How to Use

First, set your `OPENAI_API_KEY` environment variable.

Then, activate the plugin by executing `:AiReview` or `:'<,'>AiReview`.

The following code block walks you through the setup process:

```lua
require('ai-review').setup({
  backend = 'nui', -- or ddu
  log_dir = vim.fn.stdpath('state') .. '/ai-review',
  chat_gpt = {
    model = 'gpt-3.5-turbo', -- Alternatively, you can use gpt-4
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
  },
})
```

## History Management

The commands `:AiReviewSave` and `:AiReviewLoad` allow you to easily save and retrieve your chat history.

## Integration with ddu (Experimental)

ai-review.nvim can use ddu as a backend.
The `:AiReviewLog` command only supports ddu for history display.

```lua
require('ai-review').setup({
  backend = 'ddu',
  -- ...
})

vim.fn['ddu#custom#patch_global']({
  kindOptions = {
    ['ai-review-request'] = {
      defaultAction = 'open',
    },
    ['ai-review-log'] = {
      defaultAction = 'resume',
    },
  },
})
```

## Requirements

This plugin requires

- [denops.vim](https://github.com/vim-denops/denops.vim)

Need either of the following two as a backend:

- [nui.nvim](https://github.com/MunifTanjim/nui.nvim)
- [ddu.vim](https://github.com/Shougo/ddu.vim)

## Acknowledgements

Special thanks to [butler.vim](https://github.com/lambdalisue/butler.vim) contributors.
