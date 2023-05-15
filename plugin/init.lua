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
    local nui = require('ai-review.backend.nui')
    local first_line = opts.line1
    local last_line = opts.line2

    nui.select(config, { first_line = first_line, last_line = last_line })
  end
end, { range = true })

vim.api.nvim_create_user_command('AiReviewResponse', function()
  vim.fn['ai_review#notify']('review', {})
end, {})

vim.api.nvim_create_user_command('AiReviewCancel', function()
  vim.fn['ai_review#notify']('cancelResponse', {})
end, {})
