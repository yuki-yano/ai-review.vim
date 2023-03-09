export const OPENAI_REVIEW_BUFFER = "ai-review://review"
export const OPENAI_REQUEST_BUFFER = "ai-review://request"
export const OPENAI_API_BASE = "https://api.openai.com/v1/chat"
export const OPENAI_MODEL = "gpt-3.5-turbo"
export const OPENAI_MAX_TOKENS = 2048

export const OPENAI_SEPARATOR_LINE = `

--------------------------------------------------------------------------------

`

export const OPENAI_REQUEST_EDITING_HEADER = `
# Editing...

## Mappings

- Enter: Send
- q: Quit

## Query

`.trimStart()

export const REQUEST_CURSOR_POSITION_MARKER = "{{__cursor__}}"
