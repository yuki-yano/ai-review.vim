local M = {}

local plugin_name = 'ai-review'

---@class ai-review.Config
---@field requests ai-review.Requests
---@class ai-review.Requests
---@field code ai-review.Request[]
---@field text ai-review.Request[]

---@class ai-review.Request
---@field title string
---@field description string
---@field mode string
---@field preview fun(request: ai-review.Request, opts: ai-preview.request.PreviewOptions): string

---@class ai-preview.request.PreviewOptions
---@field first_line number
---@field last_line number
---@field bufnr number

---@param request ai-review.Request
---@param opts ai-preview.request.PreviewOptions
local function default_preview(request, opts)
  return vim.call(
    'denops#request',
    plugin_name,
    'requestPreview',
    { request.mode, opts.first_line, opts.last_line, opts.bufnr }
  )
end

---@type ai-review.Requests
local default_requests = {
  code = {
    {
      title = 'Find bugs',
      description = 'Find bugs in the code',
      mode = 'find_bugs',
      preview = default_preview,
    },
    {
      title = 'Optimize',
      description = 'Optimize the code',
      mode = 'optimize',
      preview = default_preview,
    },
    {
      title = 'Add comments',
      description = 'Add comments to the code',
      mode = 'add_comments',
      preview = default_preview,
    },
    {
      title = 'Add tests',
      description = 'Add tests to the code',
      mode = 'add_tests',
      preview = default_preview,
    },
    {
      title = 'Explain',
      description = 'Explain the code',
      mode = 'explain',
      preview = default_preview,
    },
    {
      title = 'Split function',
      description = 'Split this code into functions',
      mode = 'split_function',
      preview = default_preview,
    },
    {
      title = 'Fix diagnostics',
      description = 'Fix diagnostics in the code',
      mode = 'fix_diagnostics',
      preview = default_preview,
    },
  },
  text = {
    {
      title = 'Use raw input',
      description = 'Use raw input',
      mode = 'use_raw_input',
      preview = default_preview,
    },
  },
}

M.config = {
  requests = default_requests,
}

return M
