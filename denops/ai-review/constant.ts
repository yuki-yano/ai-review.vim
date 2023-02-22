export const OPENAI_REVIEW_BUFFER = "ai-review://review"
export const OPENAI_REQUEST_BUFFER = "ai-review://request"
export const OPENAI_API_BASE = "https://api.openai.com/v1"
export const OPENAI_MODEL = "text-davinci-003"
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
