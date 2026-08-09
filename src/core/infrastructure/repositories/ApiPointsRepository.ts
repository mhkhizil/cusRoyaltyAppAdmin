import axios from "axios";
import { Branch } from "../../domain/entities/Branch";
import { PointRule } from "../../domain/entities/PointRule";
import { QrScanResult } from "../../domain/entities/QrScanResult";
import { IPointsRepository } from "../../domain/repositories/IPointsRepository";
import type { ApiEnvelopeDTO } from "../../application/dtos/AuthDTO";
import { BranchDTOMapper, BranchResponseDTO } from "../../application/dtos/BranchDTO";
import {
  CreatePointRuleDTO,
  PointRuleResponseDTO,
  PointsDTOMapper,
  QrScanRequestDTO,
  QrScanResponseDTO,
} from "../../application/dtos/PointsDTO";
import { HttpClient } from "../api/HttpClient";
import { API_ENDPOINTS } from "../api/constants";

function extractErrorMessage(error: unknown, fallback: string): string {
  if (axios.isAxiosError(error)) {
    const msg = error.response?.data?.message;
    if (msg) return String(msg);
  }
  if (error instanceof Error && error.message) return error.message;
  return fallback;
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

      return PointsDTOMapper.toQrScanResultDomain(response.data);
    } catch (error) {
      throw new Error(extractErrorMessage(error, "Failed to process QR scan"));
    }
  }

  async listScanLocations(): Promise<Branch[]> {
    try {
      const response = await this.httpClient.get<
        ApiEnvelopeDTO<BranchResponseDTO[] | BranchResponseDTO>
      >(API_ENDPOINTS.POINTS.SCAN_LOCATIONS);

      if (response.success === false) {
        throw new Error(response.message || "Failed to load scan locations");
      }

      return BranchDTOMapper.fromListResponse(response.data);
    } catch (error) {
      throw new Error(
        extractErrorMessage(error, "Failed to load scan locations")
      );
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

      return PointsDTOMapper.fromRuleListResponse(response.data);
    } catch (error) {
      throw new Error(extractErrorMessage(error, "Failed to load point rules"));
    }
  }

  async getRuleById(ruleId: string): Promise<PointRule> {
    try {
      const response = await this.httpClient.get<
        ApiEnvelopeDTO<PointRuleResponseDTO>
      >(API_ENDPOINTS.POINTS.RULE_BY_ID(ruleId));

      if (response.success === false || !response.data) {
        throw new Error(response.message || "Failed to load point rule");
      }

      return PointsDTOMapper.toPointRuleDomain(response.data);
    } catch (error) {
      throw new Error(extractErrorMessage(error, "Failed to load point rule"));
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

      return PointsDTOMapper.toPointRuleDomain(response.data);
    } catch (error) {
      throw new Error(extractErrorMessage(error, "Failed to create point rule"));
    }
  }
}
