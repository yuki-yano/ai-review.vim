local default_config = require('ai-review.config').config

local M = {}

---@param config ai-review.Config
function M.setup(config)
  local function setup()
    config = vim.tbl_extend('force', default_config, config or {})

    vim.fn['ai_review#request']('setup', { config })
  end

  if vim.fn['denops#server#status']() == 'running' then
    setup()
  else
    vim.api.nvim_create_autocmd({ 'User' }, {
      pattern = 'DenopsReady',
      callback = setup,
    })
  end
end

return M
