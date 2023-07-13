function! ai_review#util#deep_merge(dict1, dict2)
  for key in keys(a:dict2)
    if has_key(a:dict1, key) && type(a:dict1[key]) == type({}) && type(a:dict2[key]) == type({})
      call ai_review#util#deep_merge(a:dict1[key], a:dict2[key])
    else
      let a:dict1[key] = a:dict2[key]
    endif
  endfor
  return a:dict1
endfunction

function ai_review#util#move_cursor_to_marker(marker) abort
  if search(a:marker) == 0
    return
  endif

  execute "silent normal! /" .. a:marker .. "\<CR>\"_dgn"
endfunction
