function! ai_review#notify(funcname, args) abort
  let funcname = a:funcname
  let args = a:args
  call denops#plugin#wait_async('ai-review', { -> denops#notify('ai-review', funcname, args) })
endfunction

function! ai_review#config(...) abort
  let config = a:0 == 0 ? {} : a:1
  let g:ai_review_config = ai_review#util#deep_merge(g:ai_review_config, config)
  call ai_review#notify('config', [g:ai_review_config])
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
    call ai_review#ddu#request(a:line1, a:line2)
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
  call ddu#start({
        \ 'sources': [
        \   {
        \     'name': 'ai-review-log',
        \   },
        \ ],
        \ })
endfunction
