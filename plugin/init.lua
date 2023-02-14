local plugin_name = 'ai-review'

vim.api.nvim_create_user_command('AiReview', function(opts)
  local config = require('ai-review.config').config
  local nui = require('ai-review.backend.nui')
  local first_line = opts.line1
  local last_line = opts.line2

  nui.select(config, { first_line = first_line, last_line = last_line })
end, { range = '%' })

vim.api.nvim_create_user_command('AiReviewResponse', function()
  vim.call('denops#notify', plugin_name, 'review', {})
end, {})

vim.api.nvim_create_user_command('AiReviewCancel', function()
  vim.call('denops#notify', plugin_name, 'cancelResponse', {})
end, {})
