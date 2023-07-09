local M = {}

---@param config ai-review.Config
---@param opts { first_line: number, last_line: number }
function M.select(config, opts)
  local first_line = opts.first_line
  local last_line = opts.last_line
  local bufnr = vim.api.nvim_get_current_buf()
  local file_type = vim.o.filetype

  local source_params = {
    requests = {},
  }
  for _, request in ipairs(config.chat_gpt.requests) do
    table.insert(source_params.requests, {
      title = request.title,
      request = request.request({
        file_type = file_type,
        first_line = first_line,
        last_line = last_line,
        bufnr = bufnr,
      }),
      preview = request.preview({
        file_type = file_type,
        first_line = first_line,
        last_line = last_line,
        bufnr = bufnr,
      }),
    })
  end

  vim.fn['ddu#start']({
    sources = {
      {
        name = 'ai-review-request',
      },
    },
    sourceParams = {
      ['ai-review-request'] = source_params,
    },
  })
end

function M.log()
  vim.fn['ddu#start']({
    sources = {
      {
        name = 'ai-review-log',
      },
    },
  })
end

return M
