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
})
```

## Required

- [denops.vim](https://github.com/vim-denops/denops.vim)
- [nui.nvim](https://github.com/MunifTanjim/nui.nvim)

## Acknowledgements

- [butler.vim](https://github.com/lambdalisue/butler.vim)
