import {
  CreateRewardResult,
  Reward,
  RewardDetail,
  RewardRedemption,
  RewardType,
  RewardUnlockMetric,
  rewardTypeRequiresPointsCost,
} from "../../domain/entities/Reward";
import {
  nullableNumber,
  nullableString,
  normalizeArrayResponse,
} from "./dtoMapperUtils";

export interface CreateRewardDTO {
  name: string;
  slug: string;
  description?: string;
  type: RewardType;
  pointsCost?: number;
  bonusPoints?: number;
  discountValue?: number;
  freeProductId?: string;
  minimumTierId?: string;
  unlockMetric: RewardUnlockMetric;
  unlockThreshold?: number;
  stockQuantity?: number;
  perUserLimit?: number;
  startsAt?: string;
  endsAt?: string;
  file?: File;
}

export interface UpdateRewardDTO {
  name?: string;
  slug?: string;
  description?: string | null;
  pointsCost?: number;
  bonusPoints?: number | null;
  discountValue?: number | null;
  freeProductId?: string | null;
  minimumTierId?: string | null;
  unlockMetric?: RewardUnlockMetric;
  unlockThreshold?: number;
  stockQuantity?: number | null;
  perUserLimit?: number | null;
  startsAt?: string | null;
  endsAt?: string | null;
  file?: File;
}

export interface UpdateRewardStatusDTO {
  status: string;
}

export interface ListRewardRedemptionsQueryDTO {
  rewardId?: string;
  status?: string;
}

export interface RewardResponseDTO {
  id: string;
  name: string;
  slug?: string | null;
  type: string;
  status: string;
  pointsCost?: number | null;
  bonusPoints?: number | null;
  discountValue?: number | null;
  freeProductId?: string | null;
  minimumTierId?: string | null;
  unlockMetric?: string | null;
  unlockThreshold?: number | null;
  stockQuantity?: number | null;
  perUserLimit?: number | null;
  startsAt?: string | null;
  endsAt?: string | null;
}

export interface RewardDetailResponseDTO extends RewardResponseDTO {
  description?: string | null;
  imageUrl?: string | null;
  discountType?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
}

export interface CreateRewardResponseDTO {
  id: string;
  pointsAwarded: number;
  recipients: number;
}

export interface RewardRedemptionResponseDTO {
  redemptionId: string;
  redemptionCode: string;
  rewardId: string;
  rewardName: string;
  rewardType: string;
  status: string;
  pointsSpent: number;
  purchaseId?: string | null;
  redeemedAt?: string | null;
  fulfilledAt?: string | null;
  expiresAt?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
}

function mapRewardBase(dto: RewardResponseDTO): RewardDataFields {
  return {
    id: String(dto.id),
    name: String(dto.name || ""),
    slug: nullableString(dto.slug),
    type: String(dto.type || ""),
    status: String(dto.status || ""),
    pointsCost: nullableNumber(dto.pointsCost),
    bonusPoints: nullableNumber(dto.bonusPoints),
    discountValue: nullableNumber(dto.discountValue),
    freeProductId: nullableString(dto.freeProductId),
    minimumTierId: nullableString(dto.minimumTierId),
    unlockMetric: nullableString(dto.unlockMetric),
    unlockThreshold: nullableNumber(dto.unlockThreshold),
    stockQuantity: nullableNumber(dto.stockQuantity),
    perUserLimit: nullableNumber(dto.perUserLimit),
    startsAt: nullableString(dto.startsAt),
    endsAt: nullableString(dto.endsAt),
  };
}

type RewardDataFields = {
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
};

export class RewardDTOMapper {
  static toRewardDomain(dto: RewardResponseDTO): Reward {
    return new Reward(mapRewardBase(dto));
  }

  static toRewardDetailDomain(dto: RewardDetailResponseDTO): RewardDetail {
    return new RewardDetail({
      ...mapRewardBase(dto),
      description: nullableString(dto.description),
      imageUrl: nullableString(dto.imageUrl),
      discountType: nullableString(dto.discountType),
      createdAt: nullableString(dto.createdAt),
      updatedAt: nullableString(dto.updatedAt),
    });
  }

  static toCreateRewardResultDomain(
    dto: CreateRewardResponseDTO
  ): CreateRewardResult {
    return new CreateRewardResult({
      id: String(dto.id),
      pointsAwarded: Number(dto.pointsAwarded ?? 0),
      recipients: Number(dto.recipients ?? 0),
    });
  }

  static toRewardRedemptionDomain(
    dto: RewardRedemptionResponseDTO
  ): RewardRedemption {
    return new RewardRedemption({
      redemptionId: String(dto.redemptionId),
      redemptionCode: String(dto.redemptionCode || ""),
      rewardId: String(dto.rewardId),
      rewardName: String(dto.rewardName || ""),
      rewardType: String(dto.rewardType || ""),
      status: String(dto.status || ""),
      pointsSpent: Number(dto.pointsSpent ?? 0),
      purchaseId: nullableString(dto.purchaseId),
      redeemedAt: nullableString(dto.redeemedAt),
      fulfilledAt: nullableString(dto.fulfilledAt),
      expiresAt: nullableString(dto.expiresAt),
      createdAt: nullableString(dto.createdAt),
      updatedAt: nullableString(dto.updatedAt),
    });
  }

  static normalizeRewardList(data: unknown): RewardResponseDTO[] {
    return normalizeArrayResponse<RewardResponseDTO>(data);
  }

  static normalizeRedemptionList(
    data: unknown
  ): RewardRedemptionResponseDTO[] {
    if (Array.isArray(data)) {
      return data as RewardRedemptionResponseDTO[];
    }

    if (!data || typeof data !== "object") {
      return [];
    }

    const record = data as Record<string, unknown>;
    for (const key of ["items", "data"]) {
      if (Array.isArray(record[key])) {
        return record[key] as RewardRedemptionResponseDTO[];
      }
    }

    if (typeof record.redemptionId === "string") {
      return [data as RewardRedemptionResponseDTO];
    }

    return [];
  }
}

function appendOptionalFormField(
  formData: FormData,
  key: string,
  value: string | number | undefined | null
): void {
  if (value === undefined) return;
  formData.append(key, value === null ? "" : String(value));
}

export function stripRewardFile<T extends { file?: File }>(
  payload: T
): Omit<T, "file"> {
  const { file: _file, ...rest } = payload;
  return rest;
}

export function buildCreateRewardFormData(payload: CreateRewardDTO): FormData {
  const formData = new FormData();
  formData.append("name", payload.name);
  formData.append("slug", payload.slug);
  formData.append("type", payload.type);
  if (
    rewardTypeRequiresPointsCost(payload.type) &&
    payload.pointsCost !== undefined
  ) {
    formData.append("pointsCost", String(payload.pointsCost));
  }
  formData.append("unlockMetric", payload.unlockMetric);
  appendOptionalFormField(formData, "description", payload.description);
  appendOptionalFormField(formData, "bonusPoints", payload.bonusPoints);
  appendOptionalFormField(formData, "discountValue", payload.discountValue);
  appendOptionalFormField(formData, "freeProductId", payload.freeProductId);
  appendOptionalFormField(formData, "minimumTierId", payload.minimumTierId);
  appendOptionalFormField(formData, "unlockThreshold", payload.unlockThreshold);
  appendOptionalFormField(formData, "stockQuantity", payload.stockQuantity);
  appendOptionalFormField(formData, "perUserLimit", payload.perUserLimit);
  appendOptionalFormField(formData, "startsAt", payload.startsAt);
  appendOptionalFormField(formData, "endsAt", payload.endsAt);

  if (payload.file) {
    formData.append("file", payload.file);
  }

  return formData;
}

export function buildUpdateRewardFormData(payload: UpdateRewardDTO): FormData {
  const formData = new FormData();

  if (payload.name !== undefined) formData.append("name", payload.name);
  if (payload.slug !== undefined) formData.append("slug", payload.slug);
  appendOptionalFormField(formData, "description", payload.description);
  appendOptionalFormField(formData, "pointsCost", payload.pointsCost);
  appendOptionalFormField(formData, "bonusPoints", payload.bonusPoints);
  appendOptionalFormField(formData, "discountValue", payload.discountValue);
  appendOptionalFormField(formData, "freeProductId", payload.freeProductId);
  appendOptionalFormField(formData, "minimumTierId", payload.minimumTierId);
  if (payload.unlockMetric !== undefined) {
    formData.append("unlockMetric", payload.unlockMetric);
  }
  appendOptionalFormField(formData, "unlockThreshold", payload.unlockThreshold);
  appendOptionalFormField(formData, "stockQuantity", payload.stockQuantity);
  appendOptionalFormField(formData, "perUserLimit", payload.perUserLimit);
  appendOptionalFormField(formData, "startsAt", payload.startsAt);
  appendOptionalFormField(formData, "endsAt", payload.endsAt);

  if (payload.file) {
    formData.append("file", payload.file);
  }

  return formData;
}

export function buildRewardImageFormData(file: File): FormData {
  const formData = new FormData();
  formData.append("file", file);
  return formData;
}
