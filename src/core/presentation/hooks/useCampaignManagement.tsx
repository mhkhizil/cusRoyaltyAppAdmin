import { useCallback, useState } from "react";
import {
  Campaign,
  CampaignDetail,
  CreateCampaignResult,
} from "../../domain/entities/Campaign";
import { ICampaignService } from "../../domain/services/ICampaignService";
import {
  CreateCampaignDTO,
  UpdateCampaignDTO,
  UpdateCampaignStatusDTO,
} from "../../application/dtos/CampaignDTO";
import container from "../../infrastructure/di/container";

interface UseCampaignManagementReturn {
  campaigns: Campaign[];
  lastCreateResult: CreateCampaignResult | null;
  isLoading: boolean;
  error: string | null;
  loadCampaigns: () => Promise<void>;
  getCampaignById: (campaignId: string) => Promise<CampaignDetail>;
  createCampaign: (payload: CreateCampaignDTO) => Promise<CreateCampaignResult>;
  updateCampaign: (
    campaignId: string,
    payload: UpdateCampaignDTO
  ) => Promise<CampaignDetail>;
  updateCampaignStatus: (
    campaignId: string,
    payload: UpdateCampaignStatusDTO
  ) => Promise<Campaign>;
  clearError: () => void;
  clearCreateResult: () => void;
}

export function useCampaignManagement(): UseCampaignManagementReturn {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [lastCreateResult, setLastCreateResult] =
    useState<CreateCampaignResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const campaignService =
    container.resolve<ICampaignService>("campaignService");

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const clearCreateResult = useCallback(() => {
    setLastCreateResult(null);
  }, []);

  const loadCampaigns = useCallback(async () => {
    try {
      setIsLoading(true);
      clearError();
      const result = await campaignService.listCampaigns();
      setCampaigns(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load campaigns");
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [campaignService, clearError]);

  const getCampaignById = useCallback(
    async (campaignId: string) => {
      try {
        setIsLoading(true);
        clearError();
        return await campaignService.getCampaignById(campaignId);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load campaign");
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [campaignService, clearError]
  );

  const createCampaign = useCallback(
    async (payload: CreateCampaignDTO) => {
      try {
        setIsLoading(true);
        clearError();
        const created = await campaignService.createCampaign(payload);
        setLastCreateResult(created);
        await loadCampaigns();
        return created;
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to create campaign"
        );
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [campaignService, clearError, loadCampaigns]
  );

  const updateCampaign = useCallback(
    async (campaignId: string, payload: UpdateCampaignDTO) => {
      try {
        setIsLoading(true);
        clearError();
        const updated = await campaignService.updateCampaign(
          campaignId,
          payload
        );
        setCampaigns((prev) =>
          prev.map((campaign) =>
            campaign.id === updated.id
              ? new Campaign({
                  id: updated.id,
                  name: updated.name,
                  slug: updated.slug,
                  type: updated.type,
                  status: updated.status,
                  discountType: updated.discountType,
                  discountValue: updated.discountValue,
                  minimumPurchase: updated.minimumPurchase,
                  birthdayWindowDays: updated.birthdayWindowDays,
                  startsAt: updated.startsAt,
                  endsAt: updated.endsAt,
                  isDiscoverable: updated.isDiscoverable,
                })
              : campaign
          )
        );
        return updated;
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to update campaign"
        );
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [campaignService, clearError]
  );

  const updateCampaignStatus = useCallback(
    async (campaignId: string, payload: UpdateCampaignStatusDTO) => {
      try {
        setIsLoading(true);
        clearError();
        const updated = await campaignService.updateCampaignStatus(
          campaignId,
          payload
        );
        setCampaigns((prev) =>
          prev.map((campaign) =>
            campaign.id === updated.id ? updated : campaign
          )
        );
        return updated;
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to update campaign status"
        );
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [campaignService, clearError]
  );

  return {
    campaigns,
    lastCreateResult,
    isLoading,
    error,
    loadCampaigns,
    getCampaignById,
    createCampaign,
    updateCampaign,
    updateCampaignStatus,
    clearError,
    clearCreateResult,
  };
}
