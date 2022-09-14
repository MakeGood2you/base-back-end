import moment from 'moment'

const stages: string[] = ['local', 'development', 'demo', 'sandbox', 'integration', 'staging', 'uat', 'production']

const log = console.log.bind(console)

console.log = function(msg) {
  if (arguments.length) {
    log(`[${moment().format('DD/MM/YYYY HH:mm')}]:`, arguments[0])
  }
}

function stageMatchScore(l_stage: string, r_stage: string):number {
  /*
   * Each stage is ranked according to the index in the stages array
   * Exact match will get the highest score as the list length
   * If l_stage is ranked higher than r_stage, the score is the list length - the distance between the stages.
   * Example: This measurement has the effect that uat is closer to production than sandbox to production.
   * Wild match of default, scores 0
   * If l_stage is ranked lower than r_stage, the score is -1 (no match)
   */
  if (l_stage === 'default' || r_stage === 'default') return 0
  const l_index = stages.indexOf(l_stage)
  const r_index = stages.indexOf(r_stage)
  if (l_index < 0 || r_index < 0 || l_index < r_index) return -1
  return stages.length - (l_index - r_index)
}

function wildMatchScore(l: string, r: string):number {
  if (l === r) return 1
  if (l === 'default') return 0
  return -1
}

function rowMatchScore(row: any, search: any):number {
  let match = wildMatchScore(row.getDataValue('customer'), search.customer)
  if (match < 0) return match
  let score = match
  match = wildMatchScore(row.getDataValue('ou'), search.ou)
  if (match < 0) return match
  score = score * 2 + match
  match = stageMatchScore(row.getDataValue('stage'), search.stage)
  if (match < 0) return match
  score = score * stages.length + match
  match = wildMatchScore(row.getDataValue('lang'), search.lang)
  if (match < 0) return match
  return score * 2 + match
}

const groupBy = <T>(xs: T[], key: (keyof T)): { [key: string]: T[] } => {
  return xs.reduce(function(rv:{ [key: string]: T[] }, x: T) {
    (rv[x[key] as any as string] = rv[x[key] as any as string] || []).push(x);
    return rv;
  }, {});
}

export const getMostSpecificRow = (data: any, params: any):any => {
  let bestRow: any = null
  let maxScore = -1
  data.forEach( (row: any) => {
    let score = rowMatchScore(row, params)
    if (score > maxScore) {
      bestRow = row
      maxScore = score
    }
  })
  return bestRow
}


export const getScoredGroupPartitions = (data: any, params: any, groupField: string):any => {
  const scoredData = data.map( (row: any) => {
    return {
      ...row.toJSON(),
      score: rowMatchScore(row, params)
    }
  })
  return groupBy(scoredData, groupField)
}

export const isUndefinedOrNull = (a: any) => a === undefined || a === null

export const isEmpty = (a: any) => isUndefinedOrNull(a) || JSON.stringify(a) === '{}' || a.length === 0

export const getIndex = (a: any, b: any, c: any) => a.findIndex((e: any) => (b ? e[b] : e.toString()) === c.toString())