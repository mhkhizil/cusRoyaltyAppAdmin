import {
  Campaign,
  CampaignDetail,
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
  UpdateCampaignDTO,
  UpdateCampaignStatusDTO,
} from "../dtos/CampaignDTO";

function assertNonNegative(
  value: number | undefined | null,
  label: string
): void {
  if (value === undefined || value === null) return;
  if (typeof value !== "number" || Number.isNaN(value) || value < 0) {
    throw new Error(`${label} must be a non-negative number`);
  }
}

export class CampaignService implements ICampaignService {
  constructor(private readonly campaignRepository: ICampaignRepository) {}

  async listCampaigns(): Promise<Campaign[]> {
    return this.campaignRepository.listCampaigns();
  }

  async getCampaignById(campaignId: string): Promise<CampaignDetail> {
    const id = campaignId.trim();
    if (!id) {
      throw new Error("Campaign id is required");
    }
    return this.campaignRepository.getCampaignById(id);
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
    assertNonNegative(payload.discountValue, "Discount value");
    assertNonNegative(payload.minimumPurchase, "Minimum purchase");
    assertNonNegative(payload.birthdayWindowDays, "Birthday window days");
    assertNonNegative(payload.maximumDiscount, "Maximum discount");
    assertNonNegative(payload.perUserLimit, "Per-user limit");
    assertNonNegative(payload.totalLimit, "Total limit");

    if (
      typeof payload.discountValue !== "number" ||
      Number.isNaN(payload.discountValue)
    ) {
      throw new Error("Discount value must be a non-negative number");
    }
    if (
      typeof payload.minimumPurchase !== "number" ||
      Number.isNaN(payload.minimumPurchase)
    ) {
      throw new Error("Minimum purchase must be a non-negative number");
    }

    return this.campaignRepository.createCampaign({
      name,
      slug,
      type,
      discountType,
      discountValue: payload.discountValue,
      minimumPurchase: payload.minimumPurchase,
      birthdayWindowDays: payload.birthdayWindowDays,
      maximumDiscount: payload.maximumDiscount,
      perUserLimit: payload.perUserLimit,
      totalLimit: payload.totalLimit,
      minimumTierId: payload.minimumTierId?.trim() || undefined,
      locationIds: payload.locationIds?.filter(Boolean),
      isDiscoverable: Boolean(payload.isDiscoverable),
      startsAt: payload.startsAt?.trim() || undefined,
      endsAt: payload.endsAt?.trim() || undefined,
    });
  }

  async updateCampaign(
    campaignId: string,
    payload: UpdateCampaignDTO
  ): Promise<CampaignDetail> {
    const id = campaignId.trim();
    if (!id) {
      throw new Error("Campaign id is required");
    }

    const next: UpdateCampaignDTO = { ...payload };

    if (next.name !== undefined) {
      next.name = next.name.trim();
      if (!next.name) {
        throw new Error("Campaign name is required");
      }
    }
    if (next.slug !== undefined) {
      next.slug = next.slug.trim();
      if (!next.slug) {
        throw new Error("Campaign slug is required");
      }
    }
    if (next.type !== undefined) {
      const type = String(next.type).trim().toUpperCase();
      if (!isCampaignType(type)) {
        throw new Error(
          "Campaign type must be BIRTHDAY, OCCASION, or DISCOVER_SALE"
        );
      }
      next.type = type;
    }
    if (next.discountType !== undefined) {
      const discountType = String(next.discountType).trim().toUpperCase();
      if (!isCampaignDiscountType(discountType)) {
        throw new Error("Discount type must be PERCENTAGE");
      }
      next.discountType = discountType;
    }

    assertNonNegative(next.discountValue, "Discount value");
    assertNonNegative(next.minimumPurchase, "Minimum purchase");
    assertNonNegative(next.birthdayWindowDays, "Birthday window days");
    assertNonNegative(next.maximumDiscount, "Maximum discount");
    assertNonNegative(next.perUserLimit, "Per-user limit");
    assertNonNegative(next.totalLimit, "Total limit");

    if (next.minimumTierId !== undefined && next.minimumTierId !== null) {
      next.minimumTierId = next.minimumTierId.trim() || null;
    }
    if (next.description !== undefined && next.description !== null) {
      next.description = next.description.trim() || null;
    }
    if (next.locationIds !== undefined) {
      next.locationIds = next.locationIds.filter(Boolean);
    }
    if (typeof next.startsAt === "string") {
      next.startsAt = next.startsAt.trim() || null;
    }
    if (typeof next.endsAt === "string") {
      next.endsAt = next.endsAt.trim() || null;
    }

    return this.campaignRepository.updateCampaign(id, next);
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
