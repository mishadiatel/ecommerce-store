export type FeedbackType = 'contacts' | string;

export interface Feedback {
  _id: string;
  type: FeedbackType;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  email: string;
  message: string;
  isAgree: boolean;
  isRead: boolean;
  createdAt: string;
  updatedAt: string;
}
