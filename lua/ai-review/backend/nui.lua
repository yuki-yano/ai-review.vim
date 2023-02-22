local M = {}

local Layout = require('nui.layout')
local Menu = require('nui.menu')
local Popup = require('nui.popup')
local event = require('nui.utils.autocmd').event

---@param config ai-review.Config
---@param opts { first_line: number, last_line: number }
function M.select(config, opts)
  local first_line = opts.first_line
  local last_line = opts.last_line
  local bufnr = vim.api.nvim_get_current_buf()
  local file_type = vim.o.filetype

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
  for _, request in ipairs(config.requests) do
    table.insert(
      lines,
      Menu.item(request.title, {
        request = request.request,
        preview = request.preview,
      })
    )
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

    ---@param v ai-review.SelectRequest
    on_change = function(v)
      if nui_preview.bufnr == nil then
        return
      end

      local preview
      if v.preview ~= nil then
        preview = v.preview({
          file_type = file_type,
          first_line = first_line,
          last_line = last_line,
          bufnr = bufnr,
        })
      else
        preview = 'No implementation'
      end

      vim.api.nvim_buf_set_lines(nui_preview.bufnr, 0, -1, false, vim.split(preview, '\n', true))
      vim.api.nvim_buf_set_option(nui_preview.bufnr, 'filetype', 'markdown')
    end,
    ---@param v ai-review.SelectRequest
    on_submit = function(v)
      local request = v.request({
        file_type = file_type,
        first_line = first_line,
        last_line = last_line,
        bufnr = bufnr,
      })
      vim.call('denops#request', 'ai-review', 'openRequest', { request })
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
