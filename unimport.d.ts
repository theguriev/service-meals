export {}
declare global {
  const $fetch: typeof import('ofetch')['$fetch']
  const afterAll: typeof import('vitest')['afterAll']
  const beforeAll: typeof import('vitest')['beforeAll']
  const buildDateFilter: typeof import('/Users/gurieveugen/work/service-meals/server/utils/buildDateFilter')['default']
  const describe: typeof import('vitest')['describe']
  const expect: typeof import('vitest')['expect']
  const getUserId: typeof import('/Users/gurieveugen/work/service-meals/server/utils/getUserId')['default']
  const issueAccessToken: typeof import('/Users/gurieveugen/work/service-meals/server/utils/issueAccessToken')['default']
  const it: typeof import('vitest')['it']
  const parse: typeof import('set-cookie-parser')['parse']
  const uuidv4: typeof import('uuid')['v4']
  const verify: typeof import('/Users/gurieveugen/work/service-meals/server/utils/verify')['default']
  const zodValidateBody: typeof import('/Users/gurieveugen/work/service-meals/server/utils/zodValidateBody')['default']
  const zodValidateData: typeof import('/Users/gurieveugen/work/service-meals/server/utils/zodValidateData')['default']
}