let code_context_list =<< trim END
You are a very good programmer.

Please reply in Markdown format. When outputting code, enclose
it in code fence with a file type as follows:

```typescript
console.log("Hello")
```

END

let s:code_context = join(code_context_list, "\n")

let s:cursor_position_marker = '{{__cursor__}}'

function! s:count_indent(line)
  let i = 0
  while a:line[i] =~ '\s'
    let i += 1
  endwhile
  return i
endfunction

function! s:remove_common_indent(code)
  let min_indent = -1
  for line in a:code
    if line != ''
      let indent = s:count_indent(line)
      if min_indent == -1 || indent < min_indent
        let min_indent = indent
      endif
    endif
  endfor

  let new_code = []
  if min_indent != -1 && min_indent > 0
    for line in a:code
      call add(new_code, strpart(line, min_indent))
    endfor
  else
    let new_code = copy(a:code)
  endif

  return new_code
endfunction

function! s:get_code(opts)
  let code = s:remove_common_indent(getbufline(a:opts.bufnr, a:opts.first_line, a:opts.last_line))
  return join(code, "\n")
endfunction

function! s:get_diagnostics(opts)
  if !has('nvim')
    return []
  endif

  let diagnostics = luaeval('vim.diagnostic.get(_A[1])', [a:opts.bufnr])
  let result = []
  for diagnostic in diagnostics
    if diagnostic.severity == 1 || diagnostic.severity == 2
      if diagnostic.lnum + 1 >= a:opts.first_line && diagnostic.lnum + 1 <= a:opts.last_line
        call add(result, diagnostic)
      endif
    endif
  endfor
  return result
endfunction

function ai_review#open_ai#request#find_bugs(opts)
  let code = s:get_code(a:opts)

  let text_template =<< trim END
  ### Question

  Find problems with the following %s code

  ### Source Code

  ```%s
  %s
  ```
  END

  let text = printf(join(text_template, "\n"), a:opts.file_type, a:opts.file_type, code)

  return {
        \ 'context': s:code_context,
        \ 'text': text,
        \ 'code': code,
        \ 'file_type': a:opts.file_type,
        \ }
endfunction

function ai_review#open_ai#request#find_bugs_preview(opts)
  return ai_review#open_ai#request#find_bugs(a:opts).text
endfunction

function ai_review#open_ai#request#fix_syntax_error(opts)
  let code = s:get_code(a:opts)

  let text_template =<< trim END
  ### Question

  Fix the syntax error in the following %s code

  ### Source Code

  ```%s
  %s
  ```
  END

  let text = printf(join(text_template, "\n"), a:opts.file_type, a:opts.file_type, code)

  return {
          \ 'context': s:code_context,
          \ 'text': text,
          \ 'code': code,
          \ 'file_type': a:opts.file_type,
          \ }
endfunction

function ai_review#open_ai#request#fix_syntax_error_preview(opts)
  return ai_review#open_ai#request#fix_syntax_error(a:opts).text
endfunction

function ai_review#open_ai#request#optimize(opts)
  let code = s:get_code(a:opts)

  let text_template =<< trim END
  ### Question

  Optimize the following %s code

  ### Source Code

  ```%s
  %s
  ```
  END

  let text = printf(join(text_template, "\n"), a:opts.file_type, a:opts.file_type, code)

  return {
          \ 'context': s:code_context,
          \ 'text': text,
          \ 'code': code,
          \ 'file_type': a:opts.file_type,
          \ }
endfunction

function ai_review#open_ai#request#optimize_preview(opts)
  return ai_review#open_ai#request#optimize(a:opts).text
endfunction

function ai_review#open_ai#request#add_comments(opts)
  let code = s:get_code(a:opts)

  let text_template =<< trim END
  ### Question

  Add comments to the following %s code

  ### Source Code

  ```%s
  %s
  ```
  END

  let text = printf(join(text_template, "\n"), a:opts.file_type, a:opts.file_type, code)

  return {
          \ 'context': s:code_context,
          \ 'text': text,
          \ 'code': code,
          \ 'file_type': a:opts.file_type,
          \ }
endfunction

function ai_review#open_ai#request#add_comments_preview(opts)
  return ai_review#open_ai#request#add_comments(a:opts).text
endfunction

function ai_review#open_ai#request#add_tests(opts)
  let code = s:get_code(a:opts)

  let text_template =<< trim END
  ### Question

  Implement tests for the following %s code

  ### Source Code

  ```%s
  %s
  ```
  END

  let text = printf(join(text_template, "\n"), a:opts.file_type, a:opts.file_type, code)

  return {
          \ 'context': s:code_context,
          \ 'text': text,
          \ 'code': code,
          \ 'file_type': a:opts.file_type,
          \ }
endfunction

function ai_review#open_ai#request#add_tests_preview(opts)
  return ai_review#open_ai#request#add_tests(a:opts).text
endfunction

function ai_review#open_ai#request#explain(opts)
  let code = s:get_code(a:opts)

  let text_template =<< trim END
  ### Question

  Explain the following %s code

  ### Source Code

  ```%s
  %s
  ```
  END

  let text = printf(join(text_template, "\n"), a:opts.file_type, a:opts.file_type, code)

  return {
          \ 'context': s:code_context,
          \ 'text': text,
          \ 'code': code,
          \ 'file_type': a:opts.file_type,
          \ }
endfunction

function ai_review#open_ai#request#explain_preview(opts)
  return ai_review#open_ai#request#explain(a:opts).text
endfunction

function ai_review#open_ai#request#split_function(opts)
  let code = s:get_code(a:opts)

  let text_template =<< trim END
  ### Question

  Split the following %s code into functions

  ### Source Code

  ```%s
  %s
  ```
  END

  let text = printf(join(text_template, "\n"), a:opts.file_type, a:opts.file_type, code)

  return {
          \ 'context': s:code_context,
          \ 'text': text,
          \ 'code': code,
          \ 'file_type': a:opts.file_type,
          \ }
endfunction

function ai_review#open_ai#request#split_function_preview(opts)
  return ai_review#open_ai#request#split_function(a:opts).text
endfunction

function ai_review#open_ai#request#fix_diagnostics(opts)
  let diagnostics = s:get_diagnostics(a:opts)
  let diagnostics_str = join(map(copy(diagnostics), 'printf("- line %d: %s", v:val.lnum - a:opts.first_line + 2, v:val.message)'), "\n")

  let code = s:get_code(a:opts)

  let text_template =<< trim END
  ### Question

  Fix this diagnostics for the following after %s code

  ### Diagnostics

  %s

  ### Source Code

  ```%s
  %s
  ```
  END

  let text = printf(join(text_template, "\n"), a:opts.file_type, diagnostics_str, a:opts.file_type, code)

  return {
          \ 'context': s:code_context,
          \ 'text': text,
          \ 'code': code,
          \ 'file_type': a:opts.file_type,
          \ }
endfunction

function ai_review#open_ai#request#fix_diagnostics_preview(opts)
  return ai_review#open_ai#request#fix_diagnostics(a:opts).text
endfunction

function ai_review#open_ai#request#customize_request(opts)
  let code = s:get_code(a:opts)

  let text_template =<< trim END
  ### Question

  %s

  ### Source Code

  ```%s
  %s
  ```
  END

  let text = printf(join(text_template, "\n"), s:cursor_position_marker, a:opts.file_type, code)

  return {
          \ 'context': s:code_context,
          \ 'text': text,
          \ 'code': code,
          \ 'file_type': a:opts.file_type,
          \ }
endfunction

function! ai_review#open_ai#request#customize_request_preview(opts)
  return ai_review#open_ai#request#customize_request(a:opts).text
endfunction
