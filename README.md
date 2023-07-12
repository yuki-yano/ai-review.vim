# ai-review.vim

The ai-review.vim plugin harnesses the power of OpenAI's API for conducting code reviews and more.

## Dependencies

This plugin relies on [denops.vim](https://github.com/vim-denops/denops.vim) and [ddu.vim](https://github.com/Shougo/ddu.vim).

## Demo

https://user-images.githubusercontent.com/5423775/218340551-7bac325a-d21e-4865-9cde-389766497b57.mp4

## How to Use

First, set your `OPENAI_API_KEY` environment variable.
If you want to use it on a selected range, please set ddu as follows.

```vim
call ddu#custom#patch_global({
  \ 'kindOptions': {
  \   'ai-review-request': {
  \     'defaultAction': 'open',
  \   },
  \   'ai-review-log': {
  \     'defaultAction': 'resume',
  \   },
  \ }
  \ })
```

Then, activate the plugin by executing `:AiReview` or `:'<,'>AiReview`.

By default, it is set to use the `gpt-3.5-turbo` model. If you want to use GPT-4, please set `g:ai_review_chat_gpt_model` to `gpt-4`.

```vim
let g:ai_review_chat_gpt_model = 'gpt-4'
```

## Request preset

The request preset is defined as a list of objects of the following type (expressed in TypeScript).
The request and preview can be defined with Vim script's funcref or Lua function, and you can modify it by setting the list of objects to `g:ai_review_chat_gpt_requests`.
(Ref: https://github.com/yuki-yano/ai-review.vim/blob/main/autoload/ai_review/open_ai/request.vim)

```typescript
type Request = {
  title: string;
  request: (opts: {
    file_type: string;
    first_line: number;
    last_line: number;
    bufnr: number;
  }) => {
    context: string;
    text: string;
    code: string;
    file_type: string;
  };
  preview: (opts: {
    file_type: string;
    first_line: number;
    last_line: number;
    bufnr: number;
  }) => string;
};
```

## History Management

The commands `:AiReviewSave` and `:AiReviewLoad` allow you to easily save and retrieve your chat history.
The log save location is set to `g:ai_review_log_dir`. The default is `~/.cache/vim/ai-review`.

## Requirements

This plugin requires

- [denops.vim](https://github.com/vim-denops/denops.vim)
- [ddu.vim](https://github.com/Shougo/ddu.vim)

## Acknowledgements

Special thanks to [butler.vim](https://github.com/lambdalisue/butler.vim) contributors.
