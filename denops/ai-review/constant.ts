export const OPENAI_FIND_BUGS = "find_bugs"
export const OPENAI_FIX_SYNTAX_ERROR = "fix_syntax_error"
export const OPENAI_OPTIMIZE = "optimize"
export const OPENAI_ADD_COMMENTS = "add_comments"
export const OPENAI_ADD_TESTS = "add_tests"
export const OPENAI_EXPLAIN = "explain"
export const OPENAI_SPLIT_FUNCTION = "split_function"
export const OPENAI_FIX_DIAGNOSTICS = "fix_diagnostics"
export const OPENAI_USE_RAW_INPUT = "use_raw_input"

export const OPENAI_MODES = [
  OPENAI_FIND_BUGS,
  OPENAI_FIX_SYNTAX_ERROR,
  OPENAI_OPTIMIZE,
  OPENAI_ADD_COMMENTS,
  OPENAI_ADD_TESTS,
  OPENAI_EXPLAIN,
  OPENAI_SPLIT_FUNCTION,
  OPENAI_FIX_DIAGNOSTICS,
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
export const getOpenaiFixSyntaxErrorRequest = (fileType: string) =>
  `Please fix the syntax error in this ${fileType} code`
export const getOpenaiOptimizeRequest = (fileType: string) => `Optimize the following ${fileType} code`
export const getOpenaiAddCommentsRequest = (fileType: string) => `Add comments for the following ${fileType} code`
export const getOpenaiAddTestsRequest = (fileType: string) => `Implement tests for the following ${fileType} code`
export const getOpenaiExplainRequest = (fileType: string) => `Explain the following ${fileType} code`
export const getOpenaiSplitFunctionRequest = (fileType: string) => `Split this ${fileType} code into functions`
export const getOpenaiFixDiagnosticsRequest = (fileType: string) =>
  `Fix this diagnostics for the following after ${fileType} code`

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

export const DIAGNOSTIC_SEVERITY = {
  ERROR: 1,
  WARNING: 2,
  INFORMATION: 3,
  HINT: 4,
} as const
