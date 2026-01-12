export interface AggregateResult<T> {
  data: T[];
  meta: Array<{ total: number }>;
}

export type AggregateFinalResult<T> = Array<AggregateResult<T>>;
