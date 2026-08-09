import { useCallback, useState } from "react";
import { Branch } from "../../domain/entities/Branch";
import { PointRule } from "../../domain/entities/PointRule";
import { QrScanResult } from "../../domain/entities/QrScanResult";
import { IPointsService } from "../../domain/services/IPointsService";
import {
  CreatePointRuleDTO,
  QrScanRequestDTO,
} from "../../application/dtos/PointsDTO";
import container from "../../infrastructure/di/container";

interface UsePointsManagementReturn {
  rules: PointRule[];
  scanLocations: Branch[];
  lastScanResult: QrScanResult | null;
  isLoading: boolean;
  isScanLocationsLoading: boolean;
  error: string | null;
  loadRules: () => Promise<void>;
  loadRuleById: (ruleId: string) => Promise<PointRule>;
  loadScanLocations: () => Promise<void>;
  createRule: (payload: CreatePointRuleDTO) => Promise<PointRule>;
  scanQr: (payload: QrScanRequestDTO) => Promise<QrScanResult>;
  clearError: () => void;
  clearScanResult: () => void;
}

export function usePointsManagement(): UsePointsManagementReturn {
  const [rules, setRules] = useState<PointRule[]>([]);
  const [scanLocations, setScanLocations] = useState<Branch[]>([]);
  const [lastScanResult, setLastScanResult] = useState<QrScanResult | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(false);
  const [isScanLocationsLoading, setIsScanLocationsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const pointsService = container.resolve<IPointsService>("pointsService");

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const clearScanResult = useCallback(() => {
    setLastScanResult(null);
  }, []);

  const loadRules = useCallback(async () => {
    try {
      setIsLoading(true);
      clearError();
      const result = await pointsService.listRules();
      setRules(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load point rules");
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [clearError, pointsService]);

  const loadRuleById = useCallback(
    async (ruleId: string) => {
      clearError();
      return pointsService.getRuleById(ruleId);
    },
    [clearError, pointsService]
  );

  const loadScanLocations = useCallback(async () => {
    try {
      setIsScanLocationsLoading(true);
      clearError();
      const result = await pointsService.listScanLocations();
      setScanLocations(result);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load scan locations"
      );
      throw err;
    } finally {
      setIsScanLocationsLoading(false);
    }
  }, [clearError, pointsService]);

  const createRule = useCallback(
    async (payload: CreatePointRuleDTO) => {
      try {
        setIsLoading(true);
        clearError();
        const created = await pointsService.createRule(payload);
        const refreshed = await pointsService.listRules();
        setRules(refreshed);
        return created;
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to create point rule"
        );
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [clearError, pointsService]
  );

  const scanQr = useCallback(
    async (payload: QrScanRequestDTO) => {
      try {
        setIsLoading(true);
        clearError();
        const result = await pointsService.scanQr(payload);
        setLastScanResult(result);
        return result;
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to process QR scan");
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [clearError, pointsService]
  );

  return {
    rules,
    scanLocations,
    lastScanResult,
    isLoading,
    isScanLocationsLoading,
    error,
    loadRules,
    loadRuleById,
    loadScanLocations,
    createRule,
    scanQr,
    clearError,
    clearScanResult,
  };
}
