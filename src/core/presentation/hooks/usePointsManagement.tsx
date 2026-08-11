import { useCallback, useState } from "react";
import { Branch } from "../../domain/entities/Branch";
import { PointRule } from "../../domain/entities/PointRule";
import { QrScanPreview } from "../../domain/entities/QrScanPreview";
import { QrScanResult } from "../../domain/entities/QrScanResult";
import { IPointsService } from "../../domain/services/IPointsService";
import {
  CreatePointRuleDTO,
  QrScanPreviewRequestDTO,
  QrScanRequestDTO,
} from "../../application/dtos/PointsDTO";
import container from "../../infrastructure/di/container";

interface UsePointsManagementReturn {
  rules: PointRule[];
  scanLocations: Branch[];
  lastScanResult: QrScanResult | null;
  lastScanPreview: QrScanPreview | null;
  isLoading: boolean;
  isScanLocationsLoading: boolean;
  error: string | null;
  loadRules: () => Promise<void>;
  loadRuleById: (ruleId: string) => Promise<PointRule>;
  loadScanLocations: () => Promise<void>;
  createRule: (payload: CreatePointRuleDTO) => Promise<PointRule>;
  previewQrScan: (payload: QrScanPreviewRequestDTO) => Promise<QrScanPreview>;
  scanQr: (payload: QrScanRequestDTO) => Promise<QrScanResult>;
  clearError: () => void;
  clearScanResult: () => void;
  clearScanPreview: () => void;
}

export function usePointsManagement(): UsePointsManagementReturn {
  const [rules, setRules] = useState<PointRule[]>([]);
  const [scanLocations, setScanLocations] = useState<Branch[]>([]);
  const [lastScanResult, setLastScanResult] = useState<QrScanResult | null>(
    null
  );
  const [lastScanPreview, setLastScanPreview] = useState<QrScanPreview | null>(
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

  const clearScanPreview = useCallback(() => {
    setLastScanPreview(null);
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

  const previewQrScan = useCallback(
    async (payload: QrScanPreviewRequestDTO) => {
      try {
        setIsLoading(true);
        clearError();
        const preview = await pointsService.previewQrScan(payload);
        setLastScanPreview(preview);
        setLastScanResult(null);
        return preview;
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to preview QR scan"
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
        setLastScanPreview(null);
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
    lastScanPreview,
    isLoading,
    isScanLocationsLoading,
    error,
    loadRules,
    loadRuleById,
    loadScanLocations,
    createRule,
    previewQrScan,
    scanQr,
    clearError,
    clearScanResult,
    clearScanPreview,
  };
}
