import { useCallback, useState } from "react";
import {
  CreateRewardResult,
  Reward,
  RewardDetail,
  RewardRedemption,
} from "../../domain/entities/Reward";
import { IRewardService } from "../../domain/services/IRewardService";
import {
  CreateRewardDTO,
  ListRewardRedemptionsQueryDTO,
  UpdateRewardDTO,
  UpdateRewardStatusDTO,
} from "../../application/dtos/RewardDTO";
import container from "../../infrastructure/di/container";

interface UseRewardManagementReturn {
  rewards: Reward[];
  redemptions: RewardRedemption[];
  lastCreateResult: CreateRewardResult | null;
  isLoading: boolean;
  error: string | null;
  loadRewards: () => Promise<void>;
  getRewardById: (rewardId: string) => Promise<RewardDetail>;
  createReward: (payload: CreateRewardDTO) => Promise<CreateRewardResult>;
  updateReward: (
    rewardId: string,
    payload: UpdateRewardDTO,
    rewardType?: string
  ) => Promise<RewardDetail>;
  updateRewardStatus: (
    rewardId: string,
    payload: UpdateRewardStatusDTO
  ) => Promise<Reward>;
  loadRedemptions: (query?: ListRewardRedemptionsQueryDTO) => Promise<void>;
  fulfillRedemption: (redemptionId: string) => Promise<RewardRedemption>;
  uploadRewardImage: (rewardId: string, file: File) => Promise<RewardDetail>;
  deleteRewardImage: (rewardId: string) => Promise<RewardDetail>;
  clearError: () => void;
  clearCreateResult: () => void;
}

export function useRewardManagement(): UseRewardManagementReturn {
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [redemptions, setRedemptions] = useState<RewardRedemption[]>([]);
  const [lastCreateResult, setLastCreateResult] =
    useState<CreateRewardResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const rewardService = container.resolve<IRewardService>("rewardService");

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const clearCreateResult = useCallback(() => {
    setLastCreateResult(null);
  }, []);

  const loadRewards = useCallback(async () => {
    try {
      setIsLoading(true);
      clearError();
      const result = await rewardService.listRewards();
      setRewards(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load rewards");
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [rewardService, clearError]);

  const getRewardById = useCallback(
    async (rewardId: string) => {
      try {
        setIsLoading(true);
        clearError();
        return await rewardService.getRewardById(rewardId);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load reward");
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [rewardService, clearError]
  );

  const createReward = useCallback(
    async (payload: CreateRewardDTO) => {
      try {
        setIsLoading(true);
        clearError();
        const created = await rewardService.createReward(payload);
        setLastCreateResult(created);
        await loadRewards();
        return created;
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to create reward"
        );
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [rewardService, clearError, loadRewards]
  );

  const updateReward = useCallback(
    async (
      rewardId: string,
      payload: UpdateRewardDTO,
      rewardType?: string
    ) => {
      try {
        setIsLoading(true);
        clearError();
        const updated = await rewardService.updateReward(
          rewardId,
          payload,
          rewardType
        );
        setRewards((prev) =>
          prev.map((reward) =>
            reward.id === updated.id
              ? new Reward({
                  id: updated.id,
                  name: updated.name,
                  slug: updated.slug,
                  type: updated.type,
                  status: updated.status,
                  pointsCost: updated.pointsCost,
                  bonusPoints: updated.bonusPoints,
                  discountValue: updated.discountValue,
                  freeProductId: updated.freeProductId,
                  minimumTierId: updated.minimumTierId,
                  unlockMetric: updated.unlockMetric,
                  unlockThreshold: updated.unlockThreshold,
                  stockQuantity: updated.stockQuantity,
                  perUserLimit: updated.perUserLimit,
                  startsAt: updated.startsAt,
                  endsAt: updated.endsAt,
                })
              : reward
          )
        );
        return updated;
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to update reward"
        );
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [rewardService, clearError]
  );

  const updateRewardStatus = useCallback(
    async (rewardId: string, payload: UpdateRewardStatusDTO) => {
      try {
        setIsLoading(true);
        clearError();
        const updated = await rewardService.updateRewardStatus(
          rewardId,
          payload
        );
        setRewards((prev) =>
          prev.map((reward) =>
            reward.id === updated.id ? updated : reward
          )
        );
        return updated;
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to update reward status"
        );
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [rewardService, clearError]
  );

  const loadRedemptions = useCallback(
    async (query?: ListRewardRedemptionsQueryDTO) => {
      try {
        setIsLoading(true);
        clearError();
        const result = await rewardService.listRedemptions(query);
        setRedemptions(result);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load redemptions"
        );
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [rewardService, clearError]
  );

  const fulfillRedemption = useCallback(
    async (redemptionId: string) => {
      try {
        setIsLoading(true);
        clearError();
        const fulfilled = await rewardService.fulfillRedemption(redemptionId);
        setRedemptions((prev) =>
          prev.map((redemption) =>
            redemption.redemptionId === fulfilled.redemptionId
              ? fulfilled
              : redemption
          )
        );
        return fulfilled;
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to fulfill redemption"
        );
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [rewardService, clearError]
  );

  const uploadRewardImage = useCallback(
    async (rewardId: string, file: File) => {
      try {
        setIsLoading(true);
        clearError();
        const updated = await rewardService.uploadRewardImage(rewardId, file);
        setRewards((prev) =>
          prev.map((reward) =>
            reward.id === updated.id
              ? new Reward({
                  id: updated.id,
                  name: updated.name,
                  slug: updated.slug,
                  type: updated.type,
                  status: updated.status,
                  pointsCost: updated.pointsCost,
                  bonusPoints: updated.bonusPoints,
                  discountValue: updated.discountValue,
                  freeProductId: updated.freeProductId,
                  minimumTierId: updated.minimumTierId,
                  unlockMetric: updated.unlockMetric,
                  unlockThreshold: updated.unlockThreshold,
                  stockQuantity: updated.stockQuantity,
                  perUserLimit: updated.perUserLimit,
                  startsAt: updated.startsAt,
                  endsAt: updated.endsAt,
                })
              : reward
          )
        );
        return updated;
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to upload reward image"
        );
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [rewardService, clearError]
  );

  const deleteRewardImage = useCallback(
    async (rewardId: string) => {
      try {
        setIsLoading(true);
        clearError();
        const updated = await rewardService.deleteRewardImage(rewardId);
        setRewards((prev) =>
          prev.map((reward) =>
            reward.id === updated.id
              ? new Reward({
                  id: updated.id,
                  name: updated.name,
                  slug: updated.slug,
                  type: updated.type,
                  status: updated.status,
                  pointsCost: updated.pointsCost,
                  bonusPoints: updated.bonusPoints,
                  discountValue: updated.discountValue,
                  freeProductId: updated.freeProductId,
                  minimumTierId: updated.minimumTierId,
                  unlockMetric: updated.unlockMetric,
                  unlockThreshold: updated.unlockThreshold,
                  stockQuantity: updated.stockQuantity,
                  perUserLimit: updated.perUserLimit,
                  startsAt: updated.startsAt,
                  endsAt: updated.endsAt,
                })
              : reward
          )
        );
        return updated;
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to remove reward image"
        );
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [rewardService, clearError]
  );

  return {
    rewards,
    redemptions,
    lastCreateResult,
    isLoading,
    error,
    loadRewards,
    getRewardById,
    createReward,
    updateReward,
    updateRewardStatus,
    loadRedemptions,
    fulfillRedemption,
    uploadRewardImage,
    deleteRewardImage,
    clearError,
    clearCreateResult,
  };
}
