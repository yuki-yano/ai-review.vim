export const OPENAI_FIND_BUGS = "find_bugs"
export const OPENAI_OPTIMIZE = "optimize"
export const OPENAI_ADD_COMMENTS = "add_comments"
export const OPENAI_ADD_TESTS = "add_tests"
export const OPENAI_EXPLAIN = "explain"
export const OPENAI_USE_RAW_INPUT = "use_raw_input"

export const OPENAI_MODES = [
  OPENAI_FIND_BUGS,
  OPENAI_OPTIMIZE,
  OPENAI_ADD_COMMENTS,
  OPENAI_ADD_TESTS,
  OPENAI_EXPLAIN,
  OPENAI_USE_RAW_INPUT,
] as const
export const OPENAI_REVIEW_BUFFER = "ai-review://review"
export const OPENAI_REQUEST_BUFFER = "ai-review://request"
export const OPENAI_API_BASE = "https://api.openai.com/v1"
export const OPENAI_MODEL = "text-davinci-003"
export const OPENAI_MAX_TOKENS = 2048

export const OPENAI_BASE_CONTEXT = `Please reply in Markdown format. When outputting code, enclose
it in code fence with a file type as follows:

\`\`\`typescript
console.log("Hello")
\`\`\`

`

export const getOpenaiFindBugsRequest = (fileType: string) => `Find problems with the following ${fileType} code`
export const getOpenaiOptimizeRequest = (fileType: string) => `Optimize the following ${fileType} code`
export const getOpenaiAddCommentsRequest = (fileType: string) => `Add comments for the following ${fileType} code`
export const getOpenaiAddTestsRequest = (fileType: string) => `Implement tests for the following ${fileType} code`
export const getOpenaiExplainRequest = (fileType: string) => `Explain the following ${fileType} code`

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
