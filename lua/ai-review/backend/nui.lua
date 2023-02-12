local M = {}

local Layout = require('nui.layout')
local Menu = require('nui.menu')
local Popup = require('nui.popup')
local Line = require('nui.line')
local event = require('nui.utils.autocmd').event

---@param config ai-review.Config
---@param opts { first_line: number, last_line: number }
function M.select(config, opts)
  local first_line = opts.first_line
  local last_line = opts.last_line
  local bufnr = vim.api.nvim_get_current_buf()

  local nui_preview = Popup({
    size = nil,
    border = {
      style = 'rounded',
      text = {
        top = 'Request Preview',
      },
    },
  })

  local lines = {}
  local code_review_title = Line()
  code_review_title:append('Code Review', 'Title')
  table.insert(lines, Menu.separator(code_review_title, { char = '', text_align = 'center' }))
  for _, request in ipairs(config.requests.code) do
    table.insert(lines, Menu.item(request.title, { mode = request.mode, preview = request.preview }))
  end

  local use_text_title = Line()
  use_text_title:append('Use Text', 'Title')
  table.insert(lines, Menu.separator(use_text_title, { char = '', text_align = 'center' }))
  for _, request in ipairs(config.requests.text) do
    table.insert(lines, Menu.item(request.title, { mode = request.mode, preview = request.preview }))
  end

  local nui_select = Menu({
    position = 0,
    size = nil,
    border = {
      style = 'rounded',
      text = {
        top = 'Requests',
      },
    },
  }, {
    min_width = 40,
    lines = lines,
    keymap = {
      focus_next = { 'j', '<Down>', '<Tab>' },
      focus_prev = { 'k', '<Up>', '<S-Tab>' },
      close = { '<Esc>', '<C-c>' },
      submit = { '<CR>', '<Space>' },
    },
    ---@param request ai-review.Request
    on_change = function(request)
      if nui_preview.bufnr == nil then
        return
      end

      local preview = request.preview(request, {
        first_line = first_line,
        last_line = last_line,
        bufnr = bufnr,
      })

      vim.api.nvim_buf_set_lines(nui_preview.bufnr, 0, -1, false, vim.split(preview, '\n', true))
      vim.api.nvim_buf_set_option(nui_preview.bufnr, 'filetype', 'markdown')
    end,
    on_submit = function(request)
      vim.call(
        'denops#request',
        'ai-review',
        'openRequest',
        { request.mode, first_line, last_line, bufnr }
      )
    end,
  })

  local layout = Layout(
    {
      position = '50%',
      size = {
        width = '60%',
        height = '90%',
      },
      min_width = 40,
      min_height = 10,
      relative = 'editor',
    },
    Layout.Box({
      Layout.Box(nui_preview, { size = '60%' }),
      Layout.Box(nui_select, { size = '40%' }),
    }, { dir = 'col' })
  )

  layout:mount()
  nui_select:on(event.BufLeave, function()
    nui_preview:unmount()
    nui_select:unmount()
  end)
end

return M
