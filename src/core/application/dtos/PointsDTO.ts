import {
  isPointCalculationType,
  type PointCalculationType,
} from "../../domain/entities/PointRule";
import { PointRule } from "../../domain/entities/PointRule";
import { QrScanResult } from "../../domain/entities/QrScanResult";
import { nullableNumber, nullableString, normalizeArrayResponse } from "./dtoMapperUtils";

export interface QrScanRequestDTO {
  idempotencyKey: string;
  qrToken: string;
  purchaseAmount: number;
  locationId: string;
  ruleId?: string;
  purchaseId?: string;
}

export interface QrScanResponseDTO {
  scanId: string;
  customerId: string;
  purchaseId: string | null;
  pointsAwarded: number;
  ruleId: string | null;
  purchaseAmount: number;
  discountAmount: number;
  payableAmount: number;
  campaignId: string | null;
  campaignName: string | null;
  badgesAwarded: string[];
  tierName: string | null;
  tierUpgraded: boolean;
}

export interface CreatePointRuleDTO {
  name: string;
  description?: string;
  calculationType: PointCalculationType;
  flatPoints?: number;
  spendUnit?: number;
  pointsPerSpendUnit?: number;
  minimumPurchase?: number;
  maximumPointsPerScan?: number;
  dailyUserPointCap?: number;
  priority?: number;
  locationIds?: string[];
  startsAt?: string;
  endsAt?: string;
}

export interface PointRuleResponseDTO {
  id: string;
  name?: string;
  description?: string | null;
  calculationType?: string;
  flatPoints?: number | null;
  spendUnit?: number | null;
  pointsPerSpendUnit?: number | null;
  minimumPurchase?: number | null;
  maximumPointsPerScan?: number | null;
  dailyUserPointCap?: number | null;
  priority?: number | null;
  locationIds?: string[];
  status?: string | null;
  startsAt?: string | null;
  endsAt?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
  /** Present on some create responses in OpenAPI examples */
  pointsAwarded?: number;
  recipients?: number;
}

function normalizeCalculationType(value: unknown): PointCalculationType {
  const normalized = String(value || "").trim().toUpperCase();
  if (normalized === "SPEND_BASED") return "AMOUNT_BASED";
  if (isPointCalculationType(normalized)) return normalized;
  return "FLAT";
}

export class PointsDTOMapper {
  static toPointRuleDomain(dto: PointRuleResponseDTO): PointRule {
    return new PointRule({
      id: String(dto.id),
      name: String(dto.name || ""),
      description: nullableString(dto.description),
      calculationType: normalizeCalculationType(dto.calculationType),
      flatPoints: nullableNumber(dto.flatPoints),
      spendUnit: nullableNumber(dto.spendUnit),
      pointsPerSpendUnit: nullableNumber(dto.pointsPerSpendUnit),
      minimumPurchase: nullableNumber(dto.minimumPurchase),
      maximumPointsPerScan: nullableNumber(dto.maximumPointsPerScan),
      dailyUserPointCap: nullableNumber(dto.dailyUserPointCap),
      priority: nullableNumber(dto.priority),
      locationIds: Array.isArray(dto.locationIds)
        ? dto.locationIds.map(String)
        : [],
      status: nullableString(dto.status),
      startsAt: nullableString(dto.startsAt),
      endsAt: nullableString(dto.endsAt),
      createdAt: nullableString(dto.createdAt),
      updatedAt: nullableString(dto.updatedAt),
    });
  }

  static fromRuleListResponse(data: unknown): PointRule[] {
    const rows = normalizeArrayResponse<PointRuleResponseDTO>(data, [
      "items",
      "rules",
      "data",
    ]);
    return rows.map((dto) => PointsDTOMapper.toPointRuleDomain(dto));
  }

  static toQrScanResultDomain(dto: QrScanResponseDTO): QrScanResult {
    return new QrScanResult({
      scanId: String(dto.scanId),
      customerId: String(dto.customerId),
      purchaseId: nullableString(dto.purchaseId),
      pointsAwarded: Number(dto.pointsAwarded || 0),
      ruleId: nullableString(dto.ruleId),
      purchaseAmount: Number(dto.purchaseAmount || 0),
      discountAmount: Number(dto.discountAmount || 0),
      payableAmount: Number(dto.payableAmount || 0),
      campaignId: nullableString(dto.campaignId),
      campaignName: nullableString(dto.campaignName),
      badgesAwarded: Array.isArray(dto.badgesAwarded)
        ? dto.badgesAwarded.map(String)
        : [],
      tierName: nullableString(dto.tierName),
      tierUpgraded: Boolean(dto.tierUpgraded),
    });
  }
}
