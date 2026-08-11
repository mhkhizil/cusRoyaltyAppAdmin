export type CampaignType = "BIRTHDAY" | "OCCASION" | "DISCOVER_SALE";

export const CAMPAIGN_TYPES: CampaignType[] = [
  "BIRTHDAY",
  "OCCASION",
  "DISCOVER_SALE",
];

export type CampaignDiscountType = "PERCENTAGE";

export const CAMPAIGN_DISCOUNT_TYPES: CampaignDiscountType[] = ["PERCENTAGE"];

export type CampaignStatus = "DRAFT" | "ACTIVE" | "PAUSED" | "ARCHIVED";

export const CAMPAIGN_STATUSES: CampaignStatus[] = [
  "DRAFT",
  "ACTIVE",
  "PAUSED",
  "ARCHIVED",
];

export function isCampaignType(value: string): value is CampaignType {
  return CAMPAIGN_TYPES.includes(value as CampaignType);
}

export function isCampaignDiscountType(
  value: string
): value is CampaignDiscountType {
  return CAMPAIGN_DISCOUNT_TYPES.includes(value as CampaignDiscountType);
}

export function isCampaignStatus(value: string): value is CampaignStatus {
  return CAMPAIGN_STATUSES.includes(value as CampaignStatus);
}

export interface CampaignData {
  id: string;
  name: string;
  slug: string | null;
  type: string;
  status: string;
  discountType: string | null;
  discountValue: number | null;
  minimumPurchase: number | null;
  birthdayWindowDays: number | null;
  startsAt: string | null;
  endsAt: string | null;
  isDiscoverable: boolean;
}

export interface CampaignDetailData extends CampaignData {
  description: string | null;
  maximumDiscount: number | null;
  perUserLimit: number | null;
  totalLimit: number | null;
  minimumTierId: string | null;
  locationIds: string[];
  createdAt: string | null;
  updatedAt: string | null;
}

export interface CreateCampaignResultData {
  id: string;
  pointsAwarded: number;
  recipients: number;
}

/**
 * Campaign summary row for the admin list table.
 */
export class Campaign {
  public id: string;
  public name: string;
  public slug: string | null;
  public type: string;
  public status: string;
  public discountType: string | null;
  public discountValue: number | null;
  public minimumPurchase: number | null;
  public birthdayWindowDays: number | null;
  public startsAt: string | null;
  public endsAt: string | null;
  public isDiscoverable: boolean;

  constructor(data: CampaignData) {
    this.id = data.id;
    this.name = data.name;
    this.slug = data.slug;
    this.type = data.type;
    this.status = data.status;
    this.discountType = data.discountType;
    this.discountValue = data.discountValue;
    this.minimumPurchase = data.minimumPurchase;
    this.birthdayWindowDays = data.birthdayWindowDays;
    this.startsAt = data.startsAt;
    this.endsAt = data.endsAt;
    this.isDiscoverable = data.isDiscoverable;
  }

  normalizedType(): string {
    return this.type.trim().toUpperCase();
  }

  normalizedStatus(): string {
    return this.status.trim().toUpperCase();
  }

  isActiveStatus(): boolean {
    return this.normalizedStatus() === "ACTIVE";
  }

  isArchived(): boolean {
    return this.normalizedStatus() === "ARCHIVED";
  }

  formatDiscountSummary(): string {
    if (this.discountValue === null || this.discountValue === undefined) {
      return "—";
    }
    const type = (this.discountType || "PERCENTAGE").toUpperCase();
    if (type === "PERCENTAGE") {
      return `${this.discountValue}%`;
    }
    return String(this.discountValue);
  }
}

/**
 * Full campaign detail for admin edit forms.
 */
export class CampaignDetail extends Campaign {
  public description: string | null;
  public maximumDiscount: number | null;
  public perUserLimit: number | null;
  public totalLimit: number | null;
  public minimumTierId: string | null;
  public locationIds: string[];
  public createdAt: string | null;
  public updatedAt: string | null;

  constructor(data: CampaignDetailData) {
    super(data);
    this.description = data.description;
    this.maximumDiscount = data.maximumDiscount;
    this.perUserLimit = data.perUserLimit;
    this.totalLimit = data.totalLimit;
    this.minimumTierId = data.minimumTierId;
    this.locationIds = [...data.locationIds];
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
  }

  appliesToAllBranches(): boolean {
    return this.locationIds.length === 0;
  }
}

export class CreateCampaignResult {
  public id: string;
  public pointsAwarded: number;
  public recipients: number;

  constructor(data: CreateCampaignResultData) {
    this.id = data.id;
    this.pointsAwarded = data.pointsAwarded;
    this.recipients = data.recipients;
  }
}
