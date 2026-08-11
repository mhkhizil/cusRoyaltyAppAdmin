import {
  Campaign,
  CampaignDetail,
  CampaignDiscountType,
  CampaignType,
  CreateCampaignResult,
} from "../../domain/entities/Campaign";
import {
  nullableNumber,
  nullableString,
  normalizeArrayResponse,
} from "./dtoMapperUtils";

export interface CreateCampaignDTO {
  name: string;
  slug: string;
  type: CampaignType;
  discountType: CampaignDiscountType;
  discountValue: number;
  minimumPurchase: number;
  birthdayWindowDays?: number;
  maximumDiscount?: number;
  perUserLimit?: number;
  totalLimit?: number;
  minimumTierId?: string;
  locationIds?: string[];
  isDiscoverable: boolean;
  startsAt?: string;
  endsAt?: string;
}

export interface UpdateCampaignDTO {
  name?: string;
  slug?: string;
  description?: string | null;
  type?: CampaignType;
  discountType?: CampaignDiscountType;
  discountValue?: number;
  minimumPurchase?: number;
  maximumDiscount?: number | null;
  birthdayWindowDays?: number | null;
  perUserLimit?: number;
  totalLimit?: number | null;
  minimumTierId?: string | null;
  isDiscoverable?: boolean;
  locationIds?: string[];
  startsAt?: string | null;
  endsAt?: string | null;
}

export interface UpdateCampaignStatusDTO {
  status: string;
}

export interface CampaignResponseDTO {
  id: string;
  name: string;
  slug?: string | null;
  type: string;
  status: string;
  discountType?: string | null;
  discountValue?: number | null;
  minimumPurchase?: number | null;
  birthdayWindowDays?: number | null;
  startsAt: string | null;
  endsAt: string | null;
  isDiscoverable: boolean;
}

export interface CampaignDetailResponseDTO {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  type: string;
  status: string;
  discountType: string;
  discountValue?: number | null;
  maximumDiscount?: number | null;
  minimumPurchase: number;
  birthdayWindowDays?: number | null;
  perUserLimit?: number | null;
  totalLimit?: number | null;
  minimumTierId?: string | null;
  isDiscoverable: boolean;
  locationIds?: string[] | null;
  startsAt: string | null;
  endsAt: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
}

export interface CreateCampaignResponseDTO {
  id: string;
  pointsAwarded: number;
  recipients: number;
}

function normalizeLocationIds(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.map(String).filter(Boolean);
}

export class CampaignDTOMapper {
  static toCampaignDomain(dto: CampaignResponseDTO): Campaign {
    return new Campaign({
      id: String(dto.id),
      name: String(dto.name || ""),
      slug: nullableString(dto.slug),
      type: String(dto.type || ""),
      status: String(dto.status || ""),
      discountType: nullableString(dto.discountType),
      discountValue: nullableNumber(dto.discountValue),
      minimumPurchase: nullableNumber(dto.minimumPurchase),
      birthdayWindowDays: nullableNumber(dto.birthdayWindowDays),
      startsAt: nullableString(dto.startsAt),
      endsAt: nullableString(dto.endsAt),
      isDiscoverable: Boolean(dto.isDiscoverable),
    });
  }

  static toCampaignDetailDomain(
    dto: CampaignDetailResponseDTO
  ): CampaignDetail {
    return new CampaignDetail({
      id: String(dto.id),
      name: String(dto.name || ""),
      slug: String(dto.slug || ""),
      description: nullableString(dto.description),
      type: String(dto.type || ""),
      status: String(dto.status || ""),
      discountType: String(dto.discountType || "PERCENTAGE"),
      discountValue: nullableNumber(dto.discountValue),
      maximumDiscount: nullableNumber(dto.maximumDiscount),
      minimumPurchase: Number(dto.minimumPurchase ?? 0),
      birthdayWindowDays: nullableNumber(dto.birthdayWindowDays),
      perUserLimit: nullableNumber(dto.perUserLimit),
      totalLimit: nullableNumber(dto.totalLimit),
      minimumTierId: nullableString(dto.minimumTierId),
      isDiscoverable: Boolean(dto.isDiscoverable),
      locationIds: normalizeLocationIds(dto.locationIds),
      startsAt: nullableString(dto.startsAt),
      endsAt: nullableString(dto.endsAt),
      createdAt: nullableString(dto.createdAt),
      updatedAt: nullableString(dto.updatedAt),
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
