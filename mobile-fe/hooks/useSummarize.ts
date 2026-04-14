import { SummarizeService } from "@/services/summarize.service";
import { SummarizeResponse } from "@/types/summarize";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";

interface UseSummarizeReturn {
  isLoading: boolean;
  error: string | null;
  result: SummarizeResponse | null;
  summarize: (text: string) => Promise<SummarizeResponse>;
  reset: () => void;
}

/**
 * Hook để quản lý logic summarize
 * @returns Object chứa state và actions
 */
export const useSummarize = (): UseSummarizeReturn => {
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<SummarizeResponse | null>(null);

  const mutation = useMutation({
    mutationFn: async (text: string) => {
      setError(null);
      return SummarizeService.summarizeText(text);
    },
    onSuccess: (data) => {
      setResult(data);
    },
    onError: (err: any) => {
      const errorMessage =
        err?.response?.data?.detail ||
        err?.message ||
        "Lỗi không xác định khi tóm tắt văn bản";
      setError(errorMessage);
    },
  });

  const reset = () => {
    setError(null);
    setResult(null);
  };

  return {
    isLoading: mutation.isPending,
    error,
    result,
    summarize: mutation.mutateAsync,
    reset,
  };
};
