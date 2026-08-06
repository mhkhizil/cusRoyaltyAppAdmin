import { PointRule } from "../../domain/entities/PointRule";
import { QrScanResult } from "../../domain/entities/QrScanResult";
import { IPointsRepository } from "../../domain/repositories/IPointsRepository";
import { IPointsService } from "../../domain/services/IPointsService";
import { CreatePointRuleDTO, QrScanRequestDTO } from "../dtos/PointsDTO";

function createIdempotencyKey(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `scan-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

export class PointsService implements IPointsService {
  constructor(private readonly pointsRepository: IPointsRepository) {}

  async scanQr(payload: QrScanRequestDTO): Promise<QrScanResult> {
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

    return this.pointsRepository.scanQr({
      idempotencyKey: payload.idempotencyKey.trim() || createIdempotencyKey(),
      qrToken,
      purchaseAmount: payload.purchaseAmount,
      locationId: payload.locationId?.trim() || undefined,
      purchaseId: payload.purchaseId?.trim() || undefined,
    });
  }

  async listRules(): Promise<PointRule[]> {
    return this.pointsRepository.listRules();
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

    if (calculationType === "FLAT") {
      if (
        payload.flatPoints === undefined ||
        payload.flatPoints === null ||
        Number.isNaN(payload.flatPoints)
      ) {
        throw new Error("Flat points are required for FLAT rules");
      }
    }

    if (calculationType !== "FLAT") {
      if (
        payload.spendUnit === undefined ||
        payload.pointsPerSpendUnit === undefined ||
        Number.isNaN(payload.spendUnit) ||
        Number.isNaN(payload.pointsPerSpendUnit)
      ) {
        throw new Error(
          "Spend unit and points per spend unit are required for spend-based rules"
        );
      }
    }

    return this.pointsRepository.createRule({
      name,
      description: payload.description?.trim() || undefined,
      calculationType,
      flatPoints: payload.flatPoints,
      spendUnit: payload.spendUnit,
      pointsPerSpendUnit: payload.pointsPerSpendUnit,
      minimumPurchase: payload.minimumPurchase,
      maximumPointsPerScan: payload.maximumPointsPerScan,
      priority: payload.priority,
      locationIds: payload.locationIds?.filter(Boolean),
      startsAt: payload.startsAt?.trim() || undefined,
      endsAt: payload.endsAt?.trim() || undefined,
    });
  }
}
