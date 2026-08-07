import { useMutation } from "@tanstack/react-query";
import {
  feedbackService,
  type CreateFeedbackInput,
} from "@/services/api/feedback-api";

export const useSubmitFeedback = () => {
  return useMutation({
    mutationFn: (data: CreateFeedbackInput) => feedbackService.create(data),
  });
};
