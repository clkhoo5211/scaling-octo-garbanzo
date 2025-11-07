/**
 * Submissions Hooks
 * React Query hooks for user submissions
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getSubmissions,
  createSubmission,
  type Submission,
} from "@/lib/api/supabaseApi";
import { useAppStore } from "@/lib/stores/appStore";

/**
 * Hook to fetch submissions
 */
export function useSubmissions(filters?: {
  userId?: string;
  category?: "tech" | "crypto" | "social" | "general";
  status?: "pending" | "approved" | "rejected";
  limit?: number;
}) {
  return useQuery({
    queryKey: ["submissions", filters],
    queryFn: async () => {
      const { data, error } = await getSubmissions(filters);
      if (error) throw error;
      return (data || []) as Submission[];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Hook to create a submission
 */
export function useCreateSubmission() {
  const queryClient = useQueryClient();
  const { userId } = useAppStore();

  return useMutation({
    mutationFn: async (data: {
      title: string;
      url: string;
      source: string;
      category: "tech" | "crypto" | "social" | "general";
    }) => {
      if (!userId) throw new Error("User not authenticated");

      const { error } = await createSubmission({
        userId,
        ...data,
      });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["submissions"] });
    },
    onError: (error: Error) => {
      console.error("Failed to create submission:", error);
    },
  });
}
