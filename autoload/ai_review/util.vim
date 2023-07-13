function! ai_review#util#deep_merge(dict1, dict2) abort
  for key in keys(a:dict2)
    if has_key(a:dict1, key) && type(a:dict1[key]) == type({}) && type(a:dict2[key]) == type({})
      call ai_review#util#deep_merge(a:dict1[key], a:dict2[key])
    else
      let a:dict1[key] = a:dict2[key]
    endif
  endfor
  return a:dict1
endfunction

function! ai_review#util#remove_funcref(item) abort
  if type(a:item) == v:t_list
    return s:remove_funcref_from_list(a:item)
  endif
  if type(a:item) == v:t_dict
    return s:remove_funcref_from_dict(a:item)
  endif
  return a:item
endfunction

function! s:remove_funcref_from_dict(dict) abort
  let result = {}
  for key in keys(a:dict)
    if type(a:dict[key]) == v:t_dict
      let result[key] = ai_review#util#remove_funcref(a:dict[key])
    elseif type(a:dict[key]) == v:t_list
      let result[key] = ai_review#util#remove_funcref(a:dict[key])
    elseif type(a:dict[key]) != v:t_func
      let result[key] = a:dict[key]
    endif
  endfor
  return result
endfunction

function! s:remove_funcref_from_list(list) abort
  let result = []
  for item in a:list
    if type(item) == v:t_dict
      call add(result, ai_review#util#remove_funcref(item))
    elseif type(item) == v:t_list
      call add(result, ai_review#util#remove_funcref(item))
    elseif type(item) != v:t_func
      call add(result, item)
    endif
  endfor
  return result
endfunction

function ai_review#util#move_cursor_to_marker(marker) abort
  if search(a:marker) == 0
    return
  endif

  execute "silent normal! /" .. a:marker .. "\<CR>\"_dgn"
endfunction
