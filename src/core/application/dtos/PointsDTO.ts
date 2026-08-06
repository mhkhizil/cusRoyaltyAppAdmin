import type { PointCalculationType } from "../../domain/entities/PointRule";

export interface QrScanRequestDTO {
  idempotencyKey: string;
  qrToken: string;
  purchaseAmount: number;
  locationId?: string;
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
  priority?: number | null;
  locationIds?: string[];
  startsAt?: string | null;
  endsAt?: string | null;
  /** Present on some create responses in OpenAPI examples */
  pointsAwarded?: number;
  recipients?: number;
}
