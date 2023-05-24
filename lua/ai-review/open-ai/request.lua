local M = {}

---@class ai-review.open-ai.Request
---@field context string
---@field text string
---@field code string
---@field file_type string

local code_context = [[You are a very good programmer.

Please reply in Markdown format. When outputting code, enclose
it in code fence with a file type as follows:

```typescript
console.log("Hello")
```

]]

local cursor_position_marker = [[{{__cursor__}}]]

---@param opts ai-review.request.Options
local function get_code(opts)
  return table.concat(vim.fn.getbufline(opts.bufnr, opts.first_line, opts.last_line), '\n')
end

---@param opts ai-review.request.Options
local function get_diagnostics(opts)
  local diagnostics = vim.diagnostic.get(opts.bufnr)
  local result = {}
  for _, diagnostic in ipairs(diagnostics) do
    if diagnostic.severity == vim.diagnostic.severity.ERROR or diagnostic.severity == vim.diagnostic.severity.WARN then
      if diagnostic.lnum + 1 >= opts.first_line and diagnostic.lnum + 1 <= opts.last_line then
        table.insert(result, diagnostic)
      end
    end
  end
  return result
end

---@param opts ai-review.request.Options
---@return ai-review.open-ai.Request
M.find_bugs = function(opts)
  local code = get_code(opts)
  local text = string.format(
    [[### Question

Find problems with the following %s code

### Source Code

```%s
%s
```]],
    opts.file_type,
    opts.file_type,
    code
  )

  return {
    context = code_context,
    text = text,
    code = code,
    file_type = opts.file_type,
  }
end

---@param opts ai-review.request.Options
---@return ai-review.open-ai.Request
M.fix_syntax_error = function(opts)
  local code = get_code(opts)
  local text = string.format(
    [[### Question

Fix the syntax error in the following %s code

### Source Code

```%s
%s
```]],
    opts.file_type,
    opts.file_type,
    code
  )

  return {
    context = code_context,
    text = text,
    code = code,
    file_type = opts.file_type,
  }
end

---@param opts ai-review.request.Options
---@return ai-review.open-ai.Request
M.optimize = function(opts)
  local code = get_code(opts)
  local text = string.format(
    [[### Question

Optimize the following %s code

### Source Code

```%s
%s
```]],
    opts.file_type,
    opts.file_type,
    code
  )

  return {
    context = code_context,
    text = text,
    code = code,
    file_type = opts.file_type,
  }
end

---@param opts ai-review.request.Options
---@return ai-review.open-ai.Request
M.add_comments = function(opts)
  local code = get_code(opts)
  local text = string.format(
    [[### Question

Add comments to the following %s code

### Source Code

```%s
%s
```]],
    opts.file_type,
    opts.file_type,
    code
  )

  return {
    context = code_context,
    text = text,
    code = code,
    file_type = opts.file_type,
  }
end

---@param opts ai-review.request.Options
---@return ai-review.open-ai.Request
M.add_tests = function(opts)
  local code = get_code(opts)
  local text = string.format(
    [[### Question

Implement tests for the following %s code

### Source Code

```%s
%s
```]],
    opts.file_type,
    opts.file_type,
    code
  )

  return {
    context = code_context,
    text = text,
    code = code,
    file_type = opts.file_type,
  }
end

---@param opts ai-review.request.Options
---@return ai-review.open-ai.Request
M.explain = function(opts)
  local code = get_code(opts)
  local text = string.format(
    [[### Question

Explain the following %s code

### Source Code

```%s
%s
```]],
    opts.file_type,
    opts.file_type,
    code
  )

  return {
    context = code_context,
    text = text,
    code = code,
    file_type = opts.file_type,
  }
end

---@param opts ai-review.request.Options
---@return ai-review.open-ai.Request
M.split_function = function(opts)
  local code = get_code(opts)
  local text = string.format(
    [[### Question

Split the following %s code into functions

### Source Code

```%s
%s
```]],
    opts.file_type,
    opts.file_type,
    code
  )

  return {
    context = code_context,
    text = text,
    code = code,
    file_type = opts.file_type,
  }
end

---@param opts ai-review.request.Options
---@return ai-review.open-ai.Request
M.fix_diagnostics = function(opts)
  local diagnostics = get_diagnostics(opts)
  local diagnostics_str = table.concat(
    vim.tbl_map(function(diagnostic)
      return string.format([[- line %d: %s]], diagnostic.lnum - opts.first_line + 2, diagnostic.message)
    end, diagnostics),
    '\n'
  )

  local code = get_code(opts)
  local text = string.format(
    [[### Question

Fix this diagnostics for the following after %s code

### Diagnostics

%s

### Source Code

```%s
%s
```]],
    opts.file_type,
    diagnostics_str,
    opts.file_type,
    code
  )

  return {
    context = code_context,
    text = text,
    code = code,
    file_type = opts.file_type,
  }
end

---@param opts ai-review.request.Options
---@return ai-review.open-ai.Request
M.customize_request = function(opts)
  local code = get_code(opts)
  local text = string.format(
    [[### Question

%s

### Source Code

```%s
%s
```]],
    cursor_position_marker,
    opts.file_type,
    code
  )

  return {
    context = code_context,
    text = text,
    code = code,
    file_type = opts.file_type,
  }
end

return M
