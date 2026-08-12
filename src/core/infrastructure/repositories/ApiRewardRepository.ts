import axios from "axios";
import {
  CreateRewardResult,
  Reward,
  RewardDetail,
  RewardRedemption,
} from "../../domain/entities/Reward";
import { IRewardRepository } from "../../domain/repositories/IRewardRepository";
import type { ApiEnvelopeDTO } from "../../application/dtos/AuthDTO";
import {
  CreateRewardDTO,
  CreateRewardResponseDTO,
  ListRewardRedemptionsQueryDTO,
  RewardDetailResponseDTO,
  RewardDTOMapper,
  RewardRedemptionResponseDTO,
  RewardResponseDTO,
  UpdateRewardDTO,
  UpdateRewardStatusDTO,
  buildCreateRewardFormData,
  buildRewardImageFormData,
  buildUpdateRewardFormData,
  stripRewardFile,
} from "../../application/dtos/RewardDTO";
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

export class ApiRewardRepository implements IRewardRepository {
  constructor(private readonly httpClient: HttpClient) {}

  async listRewards(): Promise<Reward[]> {
    try {
      const response = await this.httpClient.get<
        ApiEnvelopeDTO<RewardResponseDTO[] | RewardResponseDTO>
      >(API_ENDPOINTS.REWARDS.BASE);

      if (response.success === false) {
        throw new Error(response.message || "Failed to load rewards");
      }

      const rows = RewardDTOMapper.normalizeRewardList(response.data);
      return rows.map((row) => RewardDTOMapper.toRewardDomain(row));
    } catch (error) {
      throw new Error(extractErrorMessage(error, "Failed to load rewards"));
    }
  }

  async getRewardById(rewardId: string): Promise<RewardDetail> {
    try {
      const response = await this.httpClient.get<
        ApiEnvelopeDTO<RewardDetailResponseDTO>
      >(API_ENDPOINTS.REWARDS.BY_ID(rewardId));

      if (response.success === false || !response.data) {
        throw new Error(response.message || "Failed to load reward");
      }

      return RewardDTOMapper.toRewardDetailDomain(response.data);
    } catch (error) {
      throw new Error(extractErrorMessage(error, "Failed to load reward"));
    }
  }

  async createReward(payload: CreateRewardDTO): Promise<CreateRewardResult> {
    try {
      const body = payload.file
        ? buildCreateRewardFormData(payload)
        : stripRewardFile(payload);

      const response = await this.httpClient.post<
        ApiEnvelopeDTO<CreateRewardResponseDTO>
      >(API_ENDPOINTS.REWARDS.BASE, body);

      if (response.success === false || !response.data) {
        throw new Error(response.message || "Failed to create reward");
      }

      return RewardDTOMapper.toCreateRewardResultDomain(response.data);
    } catch (error) {
      throw new Error(extractErrorMessage(error, "Failed to create reward"));
    }
  }

  async updateReward(
    rewardId: string,
    payload: UpdateRewardDTO
  ): Promise<RewardDetail> {
    try {
      const body = payload.file
        ? buildUpdateRewardFormData(payload)
        : stripRewardFile(payload);

      const response = await this.httpClient.patch<
        ApiEnvelopeDTO<RewardDetailResponseDTO>
      >(API_ENDPOINTS.REWARDS.BY_ID(rewardId), body);

      if (response.success === false || !response.data) {
        throw new Error(response.message || "Failed to update reward");
      }

      return RewardDTOMapper.toRewardDetailDomain(response.data);
    } catch (error) {
      throw new Error(extractErrorMessage(error, "Failed to update reward"));
    }
  }

  async updateRewardStatus(
    rewardId: string,
    payload: UpdateRewardStatusDTO
  ): Promise<Reward> {
    try {
      const response = await this.httpClient.patch<
        ApiEnvelopeDTO<RewardResponseDTO | null>
      >(API_ENDPOINTS.REWARDS.UPDATE_STATUS(rewardId), payload);

      if (response.success === false) {
        throw new Error(response.message || "Failed to update reward status");
      }

      if (response.data) {
        return RewardDTOMapper.toRewardDomain(response.data);
      }

      const detail = await this.getRewardById(rewardId);
      return new Reward({
        id: detail.id,
        name: detail.name,
        slug: detail.slug,
        type: detail.type,
        status: payload.status,
        pointsCost: detail.pointsCost,
        bonusPoints: detail.bonusPoints,
        discountValue: detail.discountValue,
        freeProductId: detail.freeProductId,
        minimumTierId: detail.minimumTierId,
        unlockMetric: detail.unlockMetric,
        unlockThreshold: detail.unlockThreshold,
        stockQuantity: detail.stockQuantity,
        perUserLimit: detail.perUserLimit,
        startsAt: detail.startsAt,
        endsAt: detail.endsAt,
      });
    } catch (error) {
      throw new Error(
        extractErrorMessage(error, "Failed to update reward status")
      );
    }
  }

  async listRedemptions(
    query?: ListRewardRedemptionsQueryDTO
  ): Promise<RewardRedemption[]> {
    try {
      const params = new URLSearchParams();
      if (query?.rewardId) params.set("rewardId", query.rewardId);
      if (query?.status) params.set("status", query.status);

      const queryString = params.toString();
      const url = queryString
        ? `${API_ENDPOINTS.REWARDS.REDEMPTIONS}?${queryString}`
        : API_ENDPOINTS.REWARDS.REDEMPTIONS;

      const response = await this.httpClient.get<
        ApiEnvelopeDTO<
          RewardRedemptionResponseDTO[] | RewardRedemptionResponseDTO
        >
      >(url);

      if (response.success === false) {
        throw new Error(response.message || "Failed to load redemptions");
      }

      const rows = RewardDTOMapper.normalizeRedemptionList(response.data);
      return rows.map((row) => RewardDTOMapper.toRewardRedemptionDomain(row));
    } catch (error) {
      throw new Error(extractErrorMessage(error, "Failed to load redemptions"));
    }
  }

  async fulfillRedemption(redemptionId: string): Promise<RewardRedemption> {
    try {
      const response = await this.httpClient.post<
        ApiEnvelopeDTO<RewardRedemptionResponseDTO>
      >(API_ENDPOINTS.REWARDS.FULFILL_REDEMPTION(redemptionId));

      if (response.success === false || !response.data) {
        throw new Error(response.message || "Failed to fulfill redemption");
      }

      return RewardDTOMapper.toRewardRedemptionDomain(response.data);
    } catch (error) {
      throw new Error(extractErrorMessage(error, "Failed to fulfill redemption"));
    }
  }

  async uploadRewardImage(rewardId: string, file: File): Promise<RewardDetail> {
    try {
      const response = await this.httpClient.post<
        ApiEnvelopeDTO<RewardDetailResponseDTO>
      >(
        API_ENDPOINTS.REWARDS.IMAGE(rewardId),
        buildRewardImageFormData(file)
      );

      if (response.success === false || !response.data) {
        throw new Error(response.message || "Failed to upload reward image");
      }

      return RewardDTOMapper.toRewardDetailDomain(response.data);
    } catch (error) {
      throw new Error(extractErrorMessage(error, "Failed to upload reward image"));
    }
  }

  async deleteRewardImage(rewardId: string): Promise<RewardDetail> {
    try {
      const response = await this.httpClient.delete<
        ApiEnvelopeDTO<RewardDetailResponseDTO>
      >(API_ENDPOINTS.REWARDS.IMAGE(rewardId));

      if (response.success === false || !response.data) {
        throw new Error(response.message || "Failed to remove reward image");
      }

      return RewardDTOMapper.toRewardDetailDomain(response.data);
    } catch (error) {
      throw new Error(extractErrorMessage(error, "Failed to remove reward image"));
    }
  }
}
