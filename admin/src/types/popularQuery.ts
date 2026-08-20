export interface PopularQuery {
  _id: string;
  queryText: string;
  language: string;
  visible: boolean;
  createdAt?: string;
  updatedAt?: string;
}
