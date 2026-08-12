import {
  CreateRewardResult,
  Reward,
  RewardDetail,
  RewardRedemption,
  REWARD_STATUSES,
  REWARD_TYPES,
  isBonusPointsRewardType,
  isRewardStatus,
  isRewardType,
  isRewardUnlockMetric,
  rewardTypeRequiresPointsCost,
} from "../../domain/entities/Reward";
import { IRewardRepository } from "../../domain/repositories/IRewardRepository";
import { IRewardService } from "../../domain/services/IRewardService";
import {
  CreateRewardDTO,
  ListRewardRedemptionsQueryDTO,
  UpdateRewardDTO,
  UpdateRewardStatusDTO,
} from "../dtos/RewardDTO";

function assertNonNegative(
  value: number | undefined | null,
  label: string
): void {
  if (value === undefined || value === null) return;
  if (typeof value !== "number" || Number.isNaN(value) || value < 0) {
    throw new Error(`${label} must be a non-negative number`);
  }
}

const REWARD_IMAGE_MAX_BYTES = 5 * 1024 * 1024;
const REWARD_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

function validateRewardImageFile(file: File): void {
  if (file.size > REWARD_IMAGE_MAX_BYTES) {
    throw new Error("Reward image must be less than 5MB");
  }
  if (!REWARD_IMAGE_TYPES.includes(file.type)) {
    throw new Error("Reward image must be JPEG, PNG, or WebP format");
  }
}

export class RewardService implements IRewardService {
  constructor(private readonly rewardRepository: IRewardRepository) {}

  async listRewards(): Promise<Reward[]> {
    return this.rewardRepository.listRewards();
  }

  async getRewardById(rewardId: string): Promise<RewardDetail> {
    const id = rewardId.trim();
    if (!id) {
      throw new Error("Reward id is required");
    }
    return this.rewardRepository.getRewardById(id);
  }

  async createReward(payload: CreateRewardDTO): Promise<CreateRewardResult> {
    const name = payload.name.trim();
    const slug = payload.slug.trim();
    const type = String(payload.type || "")
      .trim()
      .toUpperCase();
    const unlockMetric = String(payload.unlockMetric || "NONE")
      .trim()
      .toUpperCase();

    if (!name) {
      throw new Error("Reward name is required");
    }
    if (!slug) {
      throw new Error("Reward slug is required");
    }
    if (!isRewardType(type)) {
      throw new Error(
        `Reward type must be one of: ${REWARD_TYPES.join(", ")}`
      );
    }
    if (!isRewardUnlockMetric(unlockMetric)) {
      throw new Error("Unlock metric must be NONE");
    }

    if (isBonusPointsRewardType(type)) {
      if (
        payload.pointsCost !== undefined &&
        payload.pointsCost !== null &&
        payload.pointsCost > 0
      ) {
        throw new Error("Bonus points rewards cannot charge points to redeem");
      }
      if (
        payload.bonusPoints === undefined ||
        typeof payload.bonusPoints !== "number" ||
        Number.isNaN(payload.bonusPoints) ||
        payload.bonusPoints <= 0
      ) {
        throw new Error("Bonus points amount is required");
      }
    } else if (
      typeof payload.pointsCost !== "number" ||
      Number.isNaN(payload.pointsCost) ||
      payload.pointsCost < 0
    ) {
      throw new Error("Points cost must be a non-negative number");
    }

    assertNonNegative(payload.pointsCost, "Points cost");
    assertNonNegative(payload.bonusPoints, "Bonus points");
    assertNonNegative(payload.discountValue, "Discount value");
    assertNonNegative(payload.unlockThreshold, "Unlock threshold");
    assertNonNegative(payload.stockQuantity, "Stock quantity");
    assertNonNegative(payload.perUserLimit, "Per-user limit");

    if (payload.file) {
      validateRewardImageFile(payload.file);
    }

    const normalizedPointsCost = isBonusPointsRewardType(type)
      ? undefined
      : payload.pointsCost;

    return this.rewardRepository.createReward({
      name,
      slug,
      description: payload.description?.trim() || undefined,
      type,
      pointsCost: normalizedPointsCost,
      bonusPoints: payload.bonusPoints,
      discountValue: payload.discountValue,
      freeProductId: payload.freeProductId?.trim() || undefined,
      minimumTierId: payload.minimumTierId?.trim() || undefined,
      unlockMetric,
      unlockThreshold: payload.unlockThreshold,
      stockQuantity: payload.stockQuantity,
      perUserLimit: payload.perUserLimit,
      startsAt: payload.startsAt?.trim() || undefined,
      endsAt: payload.endsAt?.trim() || undefined,
      file: payload.file,
    });
  }

  async updateReward(
    rewardId: string,
    payload: UpdateRewardDTO,
    rewardType?: string
  ): Promise<RewardDetail> {
    const id = rewardId.trim();
    if (!id) {
      throw new Error("Reward id is required");
    }

    const next: UpdateRewardDTO = { ...payload };

    if (next.name !== undefined) {
      next.name = next.name.trim();
      if (!next.name) {
        throw new Error("Reward name is required");
      }
    }
    if (next.slug !== undefined) {
      next.slug = next.slug.trim();
      if (!next.slug) {
        throw new Error("Reward slug is required");
      }
    }
    if (next.unlockMetric !== undefined) {
      const unlockMetric = String(next.unlockMetric).trim().toUpperCase();
      if (!isRewardUnlockMetric(unlockMetric)) {
        throw new Error("Unlock metric must be NONE");
      }
      next.unlockMetric = unlockMetric;
    }

    assertNonNegative(next.pointsCost, "Points cost");
    assertNonNegative(next.bonusPoints, "Bonus points");
    assertNonNegative(next.discountValue, "Discount value");
    assertNonNegative(next.unlockThreshold, "Unlock threshold");
    assertNonNegative(next.stockQuantity, "Stock quantity");
    assertNonNegative(next.perUserLimit, "Per-user limit");

    if (next.description !== undefined && next.description !== null) {
      next.description = next.description.trim() || null;
    }
    if (next.freeProductId !== undefined && next.freeProductId !== null) {
      next.freeProductId = next.freeProductId.trim() || null;
    }
    if (next.minimumTierId !== undefined && next.minimumTierId !== null) {
      next.minimumTierId = next.minimumTierId.trim() || null;
    }
    if (typeof next.startsAt === "string") {
      next.startsAt = next.startsAt.trim() || null;
    }
    if (typeof next.endsAt === "string") {
      next.endsAt = next.endsAt.trim() || null;
    }

    if (next.file) {
      validateRewardImageFile(next.file);
    }

    const normalizedType = rewardType?.trim().toUpperCase();
    if (normalizedType && isBonusPointsRewardType(normalizedType)) {
      if (
        next.pointsCost !== undefined &&
        next.pointsCost !== null &&
        next.pointsCost > 0
      ) {
        throw new Error("Bonus points rewards cannot charge points to redeem");
      }
      next.pointsCost = 0;
    } else if (
      normalizedType &&
      rewardTypeRequiresPointsCost(normalizedType) &&
      next.pointsCost !== undefined &&
      (typeof next.pointsCost !== "number" ||
        Number.isNaN(next.pointsCost) ||
        next.pointsCost < 0)
    ) {
      throw new Error("Points cost must be a non-negative number");
    }

    return this.rewardRepository.updateReward(id, next);
  }

  async updateRewardStatus(
    rewardId: string,
    payload: UpdateRewardStatusDTO
  ): Promise<Reward> {
    const id = rewardId.trim();
    if (!id) {
      throw new Error("Reward id is required");
    }

    const status = String(payload.status || "")
      .trim()
      .toUpperCase();
    if (!isRewardStatus(status)) {
      throw new Error(
        `Reward status must be one of: ${REWARD_STATUSES.join(", ")}`
      );
    }

    return this.rewardRepository.updateRewardStatus(id, { status });
  }

  async listRedemptions(
    query?: ListRewardRedemptionsQueryDTO
  ): Promise<RewardRedemption[]> {
    const normalized: ListRewardRedemptionsQueryDTO = {};

    if (query?.rewardId?.trim()) {
      normalized.rewardId = query.rewardId.trim();
    }
    if (query?.status?.trim()) {
      normalized.status = query.status.trim().toUpperCase();
    }

    return this.rewardRepository.listRedemptions(
      Object.keys(normalized).length > 0 ? normalized : undefined
    );
  }

  async fulfillRedemption(redemptionId: string): Promise<RewardRedemption> {
    const id = redemptionId.trim();
    if (!id) {
      throw new Error("Redemption id is required");
    }
    return this.rewardRepository.fulfillRedemption(id);
  }

  async uploadRewardImage(rewardId: string, file: File): Promise<RewardDetail> {
    const id = rewardId.trim();
    if (!id) {
      throw new Error("Reward id is required");
    }
    validateRewardImageFile(file);
    return this.rewardRepository.uploadRewardImage(id, file);
  }

  async deleteRewardImage(rewardId: string): Promise<RewardDetail> {
    const id = rewardId.trim();
    if (!id) {
      throw new Error("Reward id is required");
    }
    return this.rewardRepository.deleteRewardImage(id);
  }
}
