 function! ai_review#notify(funcname, args) abort
  let funcname = a:funcname
  let args = a:args
  call denops#plugin#wait_async('ai-review', { -> denops#notify('ai-review', funcname, args) })
endfunction

function! ai_review#request(funcname, args) abort
  let funcname = a:funcname
  let args = a:args
  call denops#plugin#wait_async('ai-review', { -> denops#request('ai-review', funcname, args) })
endfunction

function ai_review#move_cursor_to_marker(marker) abort
  if search(a:marker) == 0
    return
  endif

  execute "normal! /" .. a:marker .. "\<CR>\"_dgn"
endfunction
