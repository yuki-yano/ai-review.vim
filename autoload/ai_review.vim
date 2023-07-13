let g:ai_review#_config = {
      \ 'backend': 'ddu',
      \ 'log_dir': expand('~/.cache/vim/ai-review'),
      \ 'chat_gpt': {
      \   'model': 'gpt-3.5-turbo',
      \   'requests': [{
      \     'title': 'Find bugs',
      \     'request': function('ai_review#open_ai#request#find_bugs'),
      \     'preview': function('ai_review#open_ai#request#find_bugs_preview')
      \   },
      \   {
      \     'title': 'Fix syntax error',
      \     'request': function('ai_review#open_ai#request#fix_syntax_error'),
      \     'preview': function('ai_review#open_ai#request#fix_syntax_error_preview')
      \   },
      \   {
      \     'title': 'Split function',
      \     'request': function('ai_review#open_ai#request#split_function'),
      \     'preview': function('ai_review#open_ai#request#split_function_preview')
      \   },
      \   {
      \     'title': 'Fix diagnostics',
      \     'request': function('ai_review#open_ai#request#fix_diagnostics'),
      \     'preview': function('ai_review#open_ai#request#fix_diagnostics_preview')
      \   },
      \   {
      \     'title': 'Optimize',
      \     'request': function('ai_review#open_ai#request#optimize'),
      \     'preview': function('ai_review#open_ai#request#optimize_preview')
      \   },
      \   {
      \     'title': 'Add comments',
      \     'request': function('ai_review#open_ai#request#add_comments'),
      \     'preview': function('ai_review#open_ai#request#add_comments_preview')
      \   },
      \   {
      \     'title': 'Add tests',
      \     'request': function('ai_review#open_ai#request#add_tests'),
      \     'preview': function('ai_review#open_ai#request#add_tests_preview')
      \   },
      \   {
      \     'title': 'Explain',
      \     'request': function('ai_review#open_ai#request#explain'),
      \     'preview': function('ai_review#open_ai#request#explain_preview')
      \   },
      \   {
      \     'title': 'Customize request',
      \     'request': function('ai_review#open_ai#request#customize_request'),
      \     'preview': function('ai_review#open_ai#request#customize_request_preview')
      \   }]
      \ }
      \ }

function! ai_review#notify(funcname, args) abort
  let funcname = a:funcname
  let args = a:args
  call denops#plugin#wait_async('ai-review', { -> denops#notify('ai-review', funcname, args) })
endfunction

function! ai_review#config(...) abort
  let config = a:0 == 0 ? {} : a:1
  let g:ai_review#_config = ai_review#util#deep_merge(g:ai_review#_config, config)
  call ai_review#notify('config', [g:ai_review#_config])
endfunction

function! ai_review#request(range, line1, line2) abort
  if a:range == 0
    call denops#request('ai-review', 'openRequest', [{
          \ 'context': '',
          \ 'text': '',
          \ 'code': '',
          \ 'file_type': 'text',
          \ }])
  else
    if g:ai_review#_config.backend == 'ddu'
      call ai_review#ddu#request(a:line1, a:line2)
    elseif g:ai_review#_config.backend == 'nui'
      call luaeval('require("ai-review.nui").request(_A[1], _A[2])', [g:ai_review#_config, { 'first_line': a:line1, 'last_line': a:line2 }])
    endif
  endif
endfunction

function! ai_review#response() abort
  call denops#notify('ai-review', 'review', [])
endfunction

function! ai_review#cancel() abort
  call denops#notify('ai-review', 'cancelResponse', [])
endfunction

function! ai_review#save(...) abort
  let name = a:0 == 0 ? '' : a:1
  call denops#notify('ai-review', 'saveResponse', [name])
endfunction

function! ai_review#load(name) abort
  call denops#notify('ai-review', 'resume', [g:ai_review_log_dir . '/' . a:name])
endfunction

function! ai_review#get_logs(_, __, ___) abort
  let logs = denops#request('ai-review', 'logList', [])
  let names = []
  for log in logs
    call add(names, log.name)
  endfor

  return names
endfunction

function! ai_review#logs() abort
  if g:ai_review#_config.backend != 'ddu'
    echoerr 'ai-review#logs() is only available for ddu backend'
    return
  endif

  call ddu#start({
        \ 'sources': [
        \   {
        \     'name': 'ai-review-log',
        \   },
        \ ],
        \ })
endfunction
