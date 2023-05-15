local request = require('ai-review.open-ai.request')

local M = {}

---@class ai-review.Config
---@field chat_gpt ChatGPT

---@class ChatGPT
---@field model string
---@field requests ai-review.SelectRequest[]

---@class ai-review.SelectRequest
---@field title string
---@field request fun(opts: ai-preview.request.Options): ai-review.open-ai.Request
---@field preview? fun(opts: ai-preview.request.Options): string

---@class ai-preview.request.Options
---@field file_type string
---@field first_line number
---@field last_line number
---@field bufnr number

---@type ai-review.SelectRequest[]
local default_requests = {
  {
    title = 'Find bugs',
    request = request.find_bugs,
    preview = function(opts)
      return request.find_bugs(opts).text
    end,
  },
  {
    title = 'Fix syntax error',
    request = request.fix_syntax_error,
    preview = function(opts)
      return request.fix_syntax_error(opts).text
    end,
  },
  {
    title = 'Split function',
    request = request.split_function,
    preview = function(opts)
      return request.split_function(opts).text
    end,
  },
  {
    title = 'Fix diagnostics',
    request = request.fix_diagnostics,
    preview = function(opts)
      return request.fix_diagnostics(opts).text
    end,
  },
  {
    title = 'Optimize',
    request = request.optimize,
    preview = function(opts)
      return request.optimize(opts).text
    end,
  },
  {
    title = 'Add comments',
    request = request.add_comments,
    preview = function(opts)
      return request.add_comments(opts).text
    end,
  },
  {
    title = 'Add tests',
    request = request.add_tests,
    preview = function(opts)
      return request.add_tests(opts).text
    end,
  },
  {
    title = 'Explain',
    request = request.explain,
    preview = function(opts)
      return request.explain(opts).text
    end,
  },
  {
    title = 'Customize request',
    request = request.customize_request,
    preview = function(opts)
      return request.customize_request(opts).text
    end,
  },
}

M.config = {
  chat_gpt = {
    model = 'gpt-3.5-turbo',
    requests = default_requests,
  },
}

return M
