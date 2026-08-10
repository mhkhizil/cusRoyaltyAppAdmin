import {
  Campaign,
  CAMPAIGN_STATUSES,
  CreateCampaignResult,
  isCampaignDiscountType,
  isCampaignStatus,
  isCampaignType,
} from "../../domain/entities/Campaign";
import { ICampaignRepository } from "../../domain/repositories/ICampaignRepository";
import { ICampaignService } from "../../domain/services/ICampaignService";
import {
  CreateCampaignDTO,
  UpdateCampaignStatusDTO,
} from "../dtos/CampaignDTO";

export class CampaignService implements ICampaignService {
  constructor(private readonly campaignRepository: ICampaignRepository) {}

  async listCampaigns(): Promise<Campaign[]> {
    return this.campaignRepository.listCampaigns();
  }

  async createCampaign(payload: CreateCampaignDTO): Promise<CreateCampaignResult> {
    const name = payload.name.trim();
    const slug = payload.slug.trim();
    const type = String(payload.type || "")
      .trim()
      .toUpperCase();
    const discountType = String(payload.discountType || "")
      .trim()
      .toUpperCase();

    if (!name) {
      throw new Error("Campaign name is required");
    }
    if (!slug) {
      throw new Error("Campaign slug is required");
    }
    if (!isCampaignType(type)) {
      throw new Error("Campaign type must be BIRTHDAY, OCCASION, or DISCOVER_SALE");
    }
    if (!isCampaignDiscountType(discountType)) {
      throw new Error("Discount type must be PERCENTAGE");
    }
    if (
      typeof payload.discountValue !== "number" ||
      Number.isNaN(payload.discountValue) ||
      payload.discountValue < 0
    ) {
      throw new Error("Discount value must be a non-negative number");
    }
    if (
      typeof payload.minimumPurchase !== "number" ||
      Number.isNaN(payload.minimumPurchase) ||
      payload.minimumPurchase < 0
    ) {
      throw new Error("Minimum purchase must be a non-negative number");
    }
    if (
      typeof payload.birthdayWindowDays !== "number" ||
      Number.isNaN(payload.birthdayWindowDays) ||
      payload.birthdayWindowDays < 0
    ) {
      throw new Error("Birthday window days must be a non-negative number");
    }

    return this.campaignRepository.createCampaign({
      name,
      slug,
      type,
      discountType,
      discountValue: payload.discountValue,
      minimumPurchase: payload.minimumPurchase,
      birthdayWindowDays: payload.birthdayWindowDays,
      isDiscoverable: Boolean(payload.isDiscoverable),
      startsAt: payload.startsAt?.trim() || undefined,
      endsAt: payload.endsAt?.trim() || undefined,
    });
  }

  async updateCampaignStatus(
    campaignId: string,
    payload: UpdateCampaignStatusDTO
  ): Promise<Campaign> {
    const id = campaignId.trim();
    if (!id) {
      throw new Error("Campaign id is required");
    }

    const status = String(payload.status || "")
      .trim()
      .toUpperCase();
    if (!isCampaignStatus(status)) {
      throw new Error(
        `Campaign status must be one of: ${CAMPAIGN_STATUSES.join(", ")}`
      );
    }

    return this.campaignRepository.updateCampaignStatus(id, { status });
  }
}
