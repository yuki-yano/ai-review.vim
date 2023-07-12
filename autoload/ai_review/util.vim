function ai_review#util#move_cursor_to_marker(marker) abort
  if search(a:marker) == 0
    return
  endif

  execute "silent normal! /" .. a:marker .. "\<CR>\"_dgn"
endfunction
