export interface GetItemsResponse<T> {
  data: T[];
  totalPages: number;
  totalDocuments: number;
}