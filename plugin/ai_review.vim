if exists('g:loaded_ai_review')
  finish
endif

if !exists('g:ai_review_config')
  let g:ai_review_config = {
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
endif

command! -range AiReview         call ai_review#request(<range>, <line1>, <line2>)
command!        AiReviewResponse call ai_review#response()
command!        AiReviewCancel   call ai_review#cancel()

command! -nargs=? AiReviewSave call ai_review#save(<f-args>)
command! -nargs=1 -complete=customlist,ai_review#get_logs AiReviewLoad call ai_review#load(<f-args>)

command! AiReviewLog call ai_review#logs()

let g:loaded_ai_review = 1
