import axios from "axios";
import {
  Campaign,
  CampaignDetail,
  CreateCampaignResult,
} from "../../domain/entities/Campaign";
import { ICampaignRepository } from "../../domain/repositories/ICampaignRepository";
import type { ApiEnvelopeDTO } from "../../application/dtos/AuthDTO";
import {
  CampaignDetailResponseDTO,
  CampaignDTOMapper,
  CampaignResponseDTO,
  CreateCampaignDTO,
  CreateCampaignResponseDTO,
  UpdateCampaignDTO,
  UpdateCampaignStatusDTO,
} from "../../application/dtos/CampaignDTO";
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

export class ApiCampaignRepository implements ICampaignRepository {
  constructor(private readonly httpClient: HttpClient) {}

  async listCampaigns(): Promise<Campaign[]> {
    try {
      const response = await this.httpClient.get<
        ApiEnvelopeDTO<CampaignResponseDTO[] | CampaignResponseDTO>
      >(API_ENDPOINTS.CAMPAIGNS.BASE);

      if (response.success === false) {
        throw new Error(response.message || "Failed to load campaigns");
      }

      const rows = CampaignDTOMapper.normalizeCampaignList(response.data);
      return rows.map((row) => CampaignDTOMapper.toCampaignDomain(row));
    } catch (error) {
      throw new Error(extractErrorMessage(error, "Failed to load campaigns"));
    }
  }

  async getCampaignById(campaignId: string): Promise<CampaignDetail> {
    try {
      const response = await this.httpClient.get<
        ApiEnvelopeDTO<CampaignDetailResponseDTO>
      >(API_ENDPOINTS.CAMPAIGNS.BY_ID(campaignId));

      if (response.success === false || !response.data) {
        throw new Error(response.message || "Failed to load campaign");
      }

      return CampaignDTOMapper.toCampaignDetailDomain(response.data);
    } catch (error) {
      throw new Error(extractErrorMessage(error, "Failed to load campaign"));
    }
  }

  async createCampaign(
    payload: CreateCampaignDTO
  ): Promise<CreateCampaignResult> {
    try {
      const response = await this.httpClient.post<
        ApiEnvelopeDTO<CreateCampaignResponseDTO>
      >(API_ENDPOINTS.CAMPAIGNS.BASE, payload);

      if (response.success === false || !response.data) {
        throw new Error(response.message || "Failed to create campaign");
      }

      return CampaignDTOMapper.toCreateCampaignResultDomain(response.data);
    } catch (error) {
      throw new Error(extractErrorMessage(error, "Failed to create campaign"));
    }
  }

  async updateCampaign(
    campaignId: string,
    payload: UpdateCampaignDTO
  ): Promise<CampaignDetail> {
    try {
      const response = await this.httpClient.patch<
        ApiEnvelopeDTO<CampaignDetailResponseDTO>
      >(API_ENDPOINTS.CAMPAIGNS.BY_ID(campaignId), payload);

      if (response.success === false || !response.data) {
        throw new Error(response.message || "Failed to update campaign");
      }

      return CampaignDTOMapper.toCampaignDetailDomain(response.data);
    } catch (error) {
      throw new Error(extractErrorMessage(error, "Failed to update campaign"));
    }
  }

  async updateCampaignStatus(
    campaignId: string,
    payload: UpdateCampaignStatusDTO
  ): Promise<Campaign> {
    try {
      const response = await this.httpClient.patch<
        ApiEnvelopeDTO<CampaignResponseDTO>
      >(API_ENDPOINTS.CAMPAIGNS.UPDATE_STATUS(campaignId), payload);

      if (response.success === false || !response.data) {
        throw new Error(response.message || "Failed to update campaign status");
      }

      return CampaignDTOMapper.toCampaignDomain(response.data);
    } catch (error) {
      throw new Error(
        extractErrorMessage(error, "Failed to update campaign status")
      );
    }
  }
}
