declare module 'pg' {
  export type QueryResultRow = Record<string, unknown>

  export interface PoolConfig {
    connectionString?: string
  }

  export interface QueryResult<T extends QueryResultRow = QueryResultRow> {
    rows: T[]
    rowCount: number | null
  }

  export class Client {
    constructor(config?: PoolConfig)
    connect(): Promise<void>
    end(): Promise<void>
    query<T extends QueryResultRow = QueryResultRow>(queryText: string, values?: unknown[]): Promise<QueryResult<T>>
  }

  export class Pool extends Client {}
}
