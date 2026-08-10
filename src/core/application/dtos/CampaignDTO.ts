import {
  Campaign,
  CampaignDiscountType,
  CampaignType,
  CreateCampaignResult,
} from "../../domain/entities/Campaign";
import { nullableString, normalizeArrayResponse } from "./dtoMapperUtils";

export interface CreateCampaignDTO {
  name: string;
  slug: string;
  type: CampaignType;
  discountType: CampaignDiscountType;
  discountValue: number;
  minimumPurchase: number;
  birthdayWindowDays: number;
  isDiscoverable: boolean;
  startsAt?: string;
  endsAt?: string;
}

export interface UpdateCampaignStatusDTO {
  status: string;
}

export interface CampaignResponseDTO {
  id: string;
  name: string;
  type: string;
  status: string;
  startsAt: string | null;
  endsAt: string | null;
  isDiscoverable: boolean;
}

export interface CreateCampaignResponseDTO {
  id: string;
  pointsAwarded: number;
  recipients: number;
}

export class CampaignDTOMapper {
  static toCampaignDomain(dto: CampaignResponseDTO): Campaign {
    return new Campaign({
      id: String(dto.id),
      name: String(dto.name || ""),
      type: String(dto.type || ""),
      status: String(dto.status || ""),
      startsAt: nullableString(dto.startsAt),
      endsAt: nullableString(dto.endsAt),
      isDiscoverable: Boolean(dto.isDiscoverable),
    });
  }

  static toCreateCampaignResultDomain(
    dto: CreateCampaignResponseDTO
  ): CreateCampaignResult {
    return new CreateCampaignResult({
      id: String(dto.id),
      pointsAwarded: Number(dto.pointsAwarded ?? 0),
      recipients: Number(dto.recipients ?? 0),
    });
  }

  static normalizeCampaignList(data: unknown): CampaignResponseDTO[] {
    return normalizeArrayResponse<CampaignResponseDTO>(data);
  }
}
