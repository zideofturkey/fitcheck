/**
 * Custom service for the public site-feedback form (footer "Geri Bildirim").
 * Plain Express route, not a Mindbricks Manager - see
 * lrmwufitcheck-nutritionlibrary/src/routes/feedback.js.
 */
import { nutritionlibraryApi } from "@/lib/service-client";

export type FeedbackSubject = "bug" | "featureRequest" | "general" | "other";

export interface CreateFeedbackInput {
  fullName: string;
  email: string;
  subject: FeedbackSubject;
  message: string;
}

export interface Feedback extends CreateFeedbackInput {
  id: string;
  userId?: string | null;
  status: "new" | "reviewed";
  createdAt?: string;
  updatedAt?: string;
}

export interface FeedbackResponse {
  status: string;
  feedback: Feedback;
}

export const feedbackService = {
  /** POST /v1/feedback */
  create: async (data: CreateFeedbackInput): Promise<FeedbackResponse> => {
    return nutritionlibraryApi.post<FeedbackResponse>("v1/feedback", data);
  },
};

export default feedbackService;
