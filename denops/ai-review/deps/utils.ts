export * as unknownutil from "https://deno.land/x/unknownutil@v2.1.0/mod.ts"

import dayjs from "https://esm.sh/dayjs@1.11.9"
export { dayjs }

import * as diff from "https://esm.sh/v103/diff@5.1.0/es2022/diff.js"
import * as Diff from "https://esm.sh/v103/@types/diff@5.0.2/index.d.ts"
const { diffChars, diffLines, createTwoFilesPatch, createPatch } = diff as unknown as typeof Diff
export { createPatch, createTwoFilesPatch, Diff, diffChars, diffLines }
