vim.api.nvim_create_user_command('AiReview', function(opts)
  if opts.range == 0 then
    vim.fn['ai_review#request']('openRequest', {
      {
        context = '',
        text = '',
        code = '',
        file_type = 'text',
      },
    })
  else
    local config = require('ai-review.config').config

    if config.backend == 'nui' then
      local nui = require('ai-review.backend.nui')
      local first_line = opts.line1
      local last_line = opts.line2
      nui.select(config, { first_line = first_line, last_line = last_line })
    elseif config.backend == 'ddu' then
      local ddu = require('ai-review.backend.ddu')
      local first_line = opts.line1
      local last_line = opts.line2
      ddu.select(config, { first_line = first_line, last_line = last_line })
    end
  end
end, { range = true })

vim.api.nvim_create_user_command('AiReviewResponse', function()
  vim.fn['ai_review#notify']('review', {})
end, {})

vim.api.nvim_create_user_command('AiReviewCancel', function()
  vim.fn['ai_review#notify']('cancelResponse', {})
end, {})

vim.api.nvim_create_user_command('AiReviewSave', function(opts)
  vim.fn['ai_review#notify']('saveResponse', { opts.args })
end, { nargs = '?' })

local function get_logs(_, _, _)
  local logs = vim.fn['denops#request']('ai-review', 'logList', {})
  local names = {}
  for _, log in ipairs(logs) do
    table.insert(names, log.name)
  end

  return names
end

vim.api.nvim_create_user_command('AiReviewLoad', function(opts)
  local config = require('ai-review.config').config
  local dir = config.log_dir
  vim.fn['ai_review#notify']('resume', { dir .. '/' .. opts.args })
end, { nargs = 1, complete = get_logs })

vim.api.nvim_create_user_command('AiReviewLog', function()
  local config = require('ai-review.config').config
  if config.backend ~= 'ddu' then
    vim.notify('Only ddu backend supports log', vim.log.levels.ERROR)
    return
  end

  local ddu = require('ai-review.backend.ddu')
  ddu.log()
end, {})
