export type RewardType = "BONUS_POINTS" | "DISCOUNT" | "FREE_PRODUCT";

export const REWARD_TYPES: RewardType[] = [
  "BONUS_POINTS",
  "DISCOUNT",
  "FREE_PRODUCT",
];

export type RewardUnlockMetric = "NONE";

export const REWARD_UNLOCK_METRICS: RewardUnlockMetric[] = ["NONE"];

export type RewardStatus = "DRAFT" | "ACTIVE" | "PAUSED" | "ARCHIVED";

export const REWARD_STATUSES: RewardStatus[] = [
  "DRAFT",
  "ACTIVE",
  "PAUSED",
  "ARCHIVED",
];

export type RewardRedemptionStatus =
  | "PENDING"
  | "COMPLETED"
  | "CANCELLED"
  | "EXPIRED";

export const REWARD_REDEMPTION_STATUSES: RewardRedemptionStatus[] = [
  "PENDING",
  "COMPLETED",
  "CANCELLED",
  "EXPIRED",
];

export function isRewardType(value: string): value is RewardType {
  return REWARD_TYPES.includes(value as RewardType);
}

export function isRewardUnlockMetric(
  value: string
): value is RewardUnlockMetric {
  return REWARD_UNLOCK_METRICS.includes(value as RewardUnlockMetric);
}

export function isRewardStatus(value: string): value is RewardStatus {
  return REWARD_STATUSES.includes(value as RewardStatus);
}

export function isRewardRedemptionStatus(
  value: string
): value is RewardRedemptionStatus {
  return REWARD_REDEMPTION_STATUSES.includes(value as RewardRedemptionStatus);
}

export function isBonusPointsRewardType(type: string): boolean {
  return type.trim().toUpperCase() === "BONUS_POINTS";
}

export function rewardTypeRequiresPointsCost(type: string): boolean {
  return !isBonusPointsRewardType(type);
}

export interface RewardData {
  id: string;
  name: string;
  slug: string | null;
  type: string;
  status: string;
  pointsCost: number | null;
  bonusPoints: number | null;
  discountValue: number | null;
  freeProductId: string | null;
  minimumTierId: string | null;
  unlockMetric: string | null;
  unlockThreshold: number | null;
  stockQuantity: number | null;
  perUserLimit: number | null;
  startsAt: string | null;
  endsAt: string | null;
}

export interface RewardDetailData extends RewardData {
  description: string | null;
  imageUrl: string | null;
  discountType: string | null;
  createdAt: string | null;
  updatedAt: string | null;
}

export interface CreateRewardResultData {
  id: string;
  pointsAwarded: number;
  recipients: number;
}

export interface RewardRedemptionData {
  redemptionId: string;
  redemptionCode: string;
  rewardId: string;
  rewardName: string;
  rewardType: string;
  status: string;
  pointsSpent: number;
  purchaseId: string | null;
  redeemedAt: string | null;
  fulfilledAt: string | null;
  expiresAt: string | null;
  createdAt: string | null;
  updatedAt: string | null;
}

export class Reward {
  public id: string;
  public name: string;
  public slug: string | null;
  public type: string;
  public status: string;
  public pointsCost: number | null;
  public bonusPoints: number | null;
  public discountValue: number | null;
  public freeProductId: string | null;
  public minimumTierId: string | null;
  public unlockMetric: string | null;
  public unlockThreshold: number | null;
  public stockQuantity: number | null;
  public perUserLimit: number | null;
  public startsAt: string | null;
  public endsAt: string | null;

  constructor(data: RewardData) {
    this.id = data.id;
    this.name = data.name;
    this.slug = data.slug;
    this.type = data.type;
    this.status = data.status;
    this.pointsCost = data.pointsCost;
    this.bonusPoints = data.bonusPoints;
    this.discountValue = data.discountValue;
    this.freeProductId = data.freeProductId;
    this.minimumTierId = data.minimumTierId;
    this.unlockMetric = data.unlockMetric;
    this.unlockThreshold = data.unlockThreshold;
    this.stockQuantity = data.stockQuantity;
    this.perUserLimit = data.perUserLimit;
    this.startsAt = data.startsAt;
    this.endsAt = data.endsAt;
  }

  normalizedType(): string {
    return this.type.trim().toUpperCase();
  }

  normalizedStatus(): string {
    return this.status.trim().toUpperCase();
  }

  isArchived(): boolean {
    return this.normalizedStatus() === "ARCHIVED";
  }
}

export class RewardDetail extends Reward {
  public description: string | null;
  public imageUrl: string | null;
  public discountType: string | null;
  public createdAt: string | null;
  public updatedAt: string | null;

  constructor(data: RewardDetailData) {
    super(data);
    this.description = data.description;
    this.imageUrl = data.imageUrl;
    this.discountType = data.discountType;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
  }
}

export class CreateRewardResult {
  public id: string;
  public pointsAwarded: number;
  public recipients: number;

  constructor(data: CreateRewardResultData) {
    this.id = data.id;
    this.pointsAwarded = data.pointsAwarded;
    this.recipients = data.recipients;
  }
}

export class RewardRedemption {
  public redemptionId: string;
  public redemptionCode: string;
  public rewardId: string;
  public rewardName: string;
  public rewardType: string;
  public status: string;
  public pointsSpent: number;
  public purchaseId: string | null;
  public redeemedAt: string | null;
  public fulfilledAt: string | null;
  public expiresAt: string | null;
  public createdAt: string | null;
  public updatedAt: string | null;

  constructor(data: RewardRedemptionData) {
    this.redemptionId = data.redemptionId;
    this.redemptionCode = data.redemptionCode;
    this.rewardId = data.rewardId;
    this.rewardName = data.rewardName;
    this.rewardType = data.rewardType;
    this.status = data.status;
    this.pointsSpent = data.pointsSpent;
    this.purchaseId = data.purchaseId;
    this.redeemedAt = data.redeemedAt;
    this.fulfilledAt = data.fulfilledAt;
    this.expiresAt = data.expiresAt;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
  }

  normalizedStatus(): string {
    return this.status.trim().toUpperCase();
  }

  isPending(): boolean {
    return this.normalizedStatus() === "PENDING";
  }

  canFulfill(): boolean {
    const type = this.rewardType.trim().toUpperCase();
    return (
      this.isPending() &&
      (type === "FREE_PRODUCT" || type === "DISCOUNT")
    );
  }
}
