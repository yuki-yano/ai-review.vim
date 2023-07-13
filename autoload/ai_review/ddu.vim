function! ai_review#ddu#request(first_line, last_line)
  let file_type = &filetype
  let bufnr = bufnr('%')

  let source_params = {
        \ 'requests': [],
        \ }

  for request in g:ai_review#_config.chat_gpt.requests
    call add(source_params.requests, {
          \ 'title': request.title,
          \ 'request': request.request({
          \   'file_type': file_type,
          \   'first_line': a:first_line,
          \   'last_line': a:last_line,
          \   'bufnr': bufnr,
          \ }),
          \ 'preview': request.preview({
          \   'file_type': file_type,
          \   'first_line': a:first_line,
          \   'last_line': a:last_line,
          \   'bufnr': bufnr,
          \ }),
          \ })
  endfor

  call ddu#start({
        \ 'sources': [
        \   {
        \     'name': 'ai-review-request',
        \   },
        \ ],
        \ 'sourceParams': {
        \   'ai-review-request': source_params,
        \ },
        \ })
endfunction
