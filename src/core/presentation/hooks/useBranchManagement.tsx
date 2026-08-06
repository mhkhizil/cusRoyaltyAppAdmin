import { useCallback, useState } from "react";
import { Branch } from "../../domain/entities/Branch";
import { IBranchService } from "../../domain/services/IBranchService";
import container from "../../infrastructure/di/container";

interface UseBranchManagementReturn {
  branches: Branch[];
  isLoading: boolean;
  error: string | null;
  loadBranches: () => Promise<void>;
  clearError: () => void;
}

export function useBranchManagement(): UseBranchManagementReturn {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const branchService = container.resolve<IBranchService>("branchService");

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const loadBranches = useCallback(async () => {
    try {
      setIsLoading(true);
      clearError();
      const result = await branchService.listBranches();
      setBranches(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load branches");
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [branchService, clearError]);

  return {
    branches,
    isLoading,
    error,
    loadBranches,
    clearError,
  };
}
