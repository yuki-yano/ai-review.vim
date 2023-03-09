function ai_review#move_cursor_to_marker(marker) abort
  if search(a:marker) == 0
    return
  endif

  execute "normal! /" .. a:marker .. "\<CR>\"_dgn"
endfunction
