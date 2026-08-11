import { Branch } from "../../domain/entities/Branch";
import { PointRule } from "../../domain/entities/PointRule";
import {
  isCampaignMode,
  QrScanPreview,
  type CampaignMode,
} from "../../domain/entities/QrScanPreview";
import { QrScanResult } from "../../domain/entities/QrScanResult";
import { IPointsRepository } from "../../domain/repositories/IPointsRepository";
import { IPointsService } from "../../domain/services/IPointsService";
import {
  CreatePointRuleDTO,
  QrScanPreviewRequestDTO,
  QrScanRequestDTO,
} from "../dtos/PointsDTO";
import {
  POINT_CALCULATION_TYPES,
  PointCalculationType,
} from "../../domain/entities/PointRule";

function createIdempotencyKey(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `scan-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function assertScanBasics(payload: {
  qrToken: string;
  purchaseAmount: number;
  locationId: string;
}): { qrToken: string; locationId: string } {
  const qrToken = payload.qrToken.trim();
  if (!qrToken) {
    throw new Error("QR token is required");
  }
  if (
    typeof payload.purchaseAmount !== "number" ||
    Number.isNaN(payload.purchaseAmount) ||
    payload.purchaseAmount < 0
  ) {
    throw new Error("Purchase amount must be a non-negative number");
  }

  const locationId = payload.locationId.trim();
  if (!locationId) {
    throw new Error("Branch location is required");
  }

  return { qrToken, locationId };
}

export class PointsService implements IPointsService {
  constructor(private readonly pointsRepository: IPointsRepository) {}

  async previewQrScan(
    payload: QrScanPreviewRequestDTO
  ): Promise<QrScanPreview> {
    const { qrToken, locationId } = assertScanBasics(payload);
    return this.pointsRepository.previewQrScan({
      qrToken,
      purchaseAmount: payload.purchaseAmount,
      locationId,
    });
  }

  async scanQr(payload: QrScanRequestDTO): Promise<QrScanResult> {
    const { qrToken, locationId } = assertScanBasics(payload);

    let campaignMode: CampaignMode | undefined;
    if (payload.campaignMode) {
      const normalized = String(payload.campaignMode).trim().toUpperCase();
      if (!isCampaignMode(normalized)) {
        throw new Error(
          "Campaign mode must be AUTO, CUSTOMER_REDEMPTION, MANUAL, or NONE"
        );
      }
      campaignMode = normalized;
    }

    if (campaignMode === "CUSTOMER_REDEMPTION" && !payload.redemptionId?.trim()) {
      throw new Error("Redemption id is required for CUSTOMER_REDEMPTION");
    }

    if (campaignMode === "MANUAL" && !payload.campaignId?.trim()) {
      throw new Error("Campaign id is required for MANUAL campaign mode");
    }

    return this.pointsRepository.scanQr({
      idempotencyKey: payload.idempotencyKey.trim() || createIdempotencyKey(),
      qrToken,
      purchaseAmount: payload.purchaseAmount,
      locationId,
      ruleId: payload.ruleId?.trim() || undefined,
      campaignMode,
      campaignId: payload.campaignId?.trim() || undefined,
      redemptionId: payload.redemptionId?.trim() || undefined,
      purchaseId: payload.purchaseId?.trim() || undefined,
    });
  }

  async listScanLocations(): Promise<Branch[]> {
    return this.pointsRepository.listScanLocations();
  }

  async listRules(): Promise<PointRule[]> {
    return this.pointsRepository.listRules();
  }

  async getRuleById(ruleId: string): Promise<PointRule> {
    const id = ruleId.trim();
    if (!id) {
      throw new Error("Rule id is required");
    }
    return this.pointsRepository.getRuleById(id);
  }

  async createRule(payload: CreatePointRuleDTO): Promise<PointRule> {
    const name = payload.name.trim();
    const calculationType = String(payload.calculationType || "")
      .trim()
      .toUpperCase();

    if (!name) {
      throw new Error("Rule name is required");
    }
    if (!calculationType) {
      throw new Error("Calculation type is required");
    }
    if (!POINT_CALCULATION_TYPES.includes(calculationType as PointCalculationType)) {
      throw new Error("Calculation type must be FLAT, AMOUNT_BASED, or HYBRID");
    }

    if (calculationType === "FLAT" || calculationType === "HYBRID") {
      if (
        payload.flatPoints === undefined ||
        payload.flatPoints === null ||
        Number.isNaN(payload.flatPoints)
      ) {
        throw new Error("Flat points are required for FLAT and HYBRID rules");
      }
    }

    if (calculationType === "AMOUNT_BASED" || calculationType === "HYBRID") {
      if (
        payload.spendUnit === undefined ||
        payload.pointsPerSpendUnit === undefined ||
        Number.isNaN(payload.spendUnit) ||
        Number.isNaN(payload.pointsPerSpendUnit)
      ) {
        throw new Error(
          "Spend unit and points per spend unit are required for AMOUNT_BASED and HYBRID rules"
        );
      }
    }

    if (
      payload.dailyUserPointCap !== undefined &&
      payload.dailyUserPointCap !== null &&
      (Number.isNaN(payload.dailyUserPointCap) || payload.dailyUserPointCap < 0)
    ) {
      throw new Error("Daily user point cap must be a non-negative number");
    }

    return this.pointsRepository.createRule({
      name,
      description: payload.description?.trim() || undefined,
      calculationType: calculationType as PointCalculationType,
      flatPoints: payload.flatPoints,
      spendUnit: payload.spendUnit,
      pointsPerSpendUnit: payload.pointsPerSpendUnit,
      minimumPurchase: payload.minimumPurchase,
      maximumPointsPerScan: payload.maximumPointsPerScan,
      dailyUserPointCap: payload.dailyUserPointCap,
      priority: payload.priority,
      locationIds: payload.locationIds?.filter(Boolean),
      startsAt: payload.startsAt?.trim() || undefined,
      endsAt: payload.endsAt?.trim() || undefined,
    });
  }
}
