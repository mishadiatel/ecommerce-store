export interface Page {
  _id: string;
  slug: string;
  title: string;
  description: string;
  breadcrumbTitle?: string;
  language: string;
  index: boolean;
  follow: boolean;
  updatedAt: string;
  createdAt: string;
}