local Config = require('ai-review.config')
local default_config = require('ai-review.config').default_config

local M = {}

---@param opts ai-review.Config
function M.setup(opts)
  local function setup()
    local config = vim.tbl_deep_extend('force', default_config, opts or {})
    Config.config = config
    vim.fn['ai_review#_request']('setup', { config })
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
