if exists('g:loaded_ai_review')
  finish
endif

command! -range AiReview         call ai_review#request(<range>, <line1>, <line2>)
command!        AiReviewResponse call ai_review#response()
command!        AiReviewCancel   call ai_review#cancel()

command! -nargs=? AiReviewSave call ai_review#save(<f-args>)
command! -nargs=1 -complete=customlist,ai_review#get_logs AiReviewLoad call ai_review#load(<f-args>)

command! AiReviewLog call ai_review#logs()

let g:loaded_ai_review = 1
