import axios from "axios";
import { PointRule } from "../../domain/entities/PointRule";
import { QrScanResult } from "../../domain/entities/QrScanResult";
import { IPointsRepository } from "../../domain/repositories/IPointsRepository";
import type { ApiEnvelopeDTO } from "../../application/dtos/AuthDTO";
import {
  CreatePointRuleDTO,
  PointRuleResponseDTO,
  QrScanRequestDTO,
  QrScanResponseDTO,
} from "../../application/dtos/PointsDTO";
import { HttpClient } from "../api/HttpClient";
import { API_ENDPOINTS } from "../api/constants";

function nullableString(value: unknown): string | null {
  if (value === null || value === undefined || value === "") return null;
  return String(value);
}

function nullableNumber(value: unknown): number | null {
  if (value === null || value === undefined || value === "") return null;
  const parsed = Number(value);
  return Number.isNaN(parsed) ? null : parsed;
}

function extractErrorMessage(error: unknown, fallback: string): string {
  if (axios.isAxiosError(error)) {
    const msg = error.response?.data?.message;
    if (msg) return String(msg);
  }
  if (error instanceof Error && error.message) return error.message;
  return fallback;
}

function mapRule(dto: PointRuleResponseDTO): PointRule {
  return new PointRule({
    id: String(dto.id),
    name: String(dto.name || ""),
    description: nullableString(dto.description),
    calculationType: String(dto.calculationType || ""),
    flatPoints: nullableNumber(dto.flatPoints),
    spendUnit: nullableNumber(dto.spendUnit),
    pointsPerSpendUnit: nullableNumber(dto.pointsPerSpendUnit),
    minimumPurchase: nullableNumber(dto.minimumPurchase),
    maximumPointsPerScan: nullableNumber(dto.maximumPointsPerScan),
    priority: nullableNumber(dto.priority),
    locationIds: Array.isArray(dto.locationIds)
      ? dto.locationIds.map(String)
      : [],
    startsAt: nullableString(dto.startsAt),
    endsAt: nullableString(dto.endsAt),
  });
}

function mapQrScan(dto: QrScanResponseDTO): QrScanResult {
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

function normalizeRuleList(data: unknown): PointRuleResponseDTO[] {
  if (Array.isArray(data)) {
    return data as PointRuleResponseDTO[];
  }

  if (!data || typeof data !== "object") {
    return [];
  }

  const record = data as Record<string, unknown>;

  if (Array.isArray(record.items)) {
    return record.items as PointRuleResponseDTO[];
  }
  if (Array.isArray(record.rules)) {
    return record.rules as PointRuleResponseDTO[];
  }
  if (Array.isArray(record.data)) {
    return record.data as PointRuleResponseDTO[];
  }
  if (typeof record.id === "string") {
    return [record as unknown as PointRuleResponseDTO];
  }

  return [];
}

export class ApiPointsRepository implements IPointsRepository {
  constructor(private readonly httpClient: HttpClient) {}

  async scanQr(payload: QrScanRequestDTO): Promise<QrScanResult> {
    try {
      const response = await this.httpClient.post<
        ApiEnvelopeDTO<QrScanResponseDTO>
      >(API_ENDPOINTS.POINTS.QR_SCAN, payload);

      if (response.success === false || !response.data) {
        throw new Error(response.message || "Failed to process QR scan");
      }

      return mapQrScan(response.data);
    } catch (error) {
      throw new Error(extractErrorMessage(error, "Failed to process QR scan"));
    }
  }

  async listRules(): Promise<PointRule[]> {
    try {
      const response = await this.httpClient.get<
        ApiEnvelopeDTO<PointRuleResponseDTO[] | PointRuleResponseDTO>
      >(API_ENDPOINTS.POINTS.RULES);

      if (response.success === false) {
        throw new Error(response.message || "Failed to load point rules");
      }

      return normalizeRuleList(response.data).map(mapRule);
    } catch (error) {
      throw new Error(extractErrorMessage(error, "Failed to load point rules"));
    }
  }

  async createRule(payload: CreatePointRuleDTO): Promise<PointRule> {
    try {
      const response = await this.httpClient.post<
        ApiEnvelopeDTO<PointRuleResponseDTO>
      >(API_ENDPOINTS.POINTS.RULES, payload);

      if (response.success === false || !response.data) {
        throw new Error(response.message || "Failed to create point rule");
      }

      return mapRule(response.data);
    } catch (error) {
      throw new Error(extractErrorMessage(error, "Failed to create point rule"));
    }
  }
}
