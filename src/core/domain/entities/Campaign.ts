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
  type: string;
  status: string;
  startsAt: string | null;
  endsAt: string | null;
  isDiscoverable: boolean;
}

export interface CreateCampaignResultData {
  id: string;
  pointsAwarded: number;
  recipients: number;
}

/**
 * Marketing campaign listed on the admin dashboard.
 */
export class Campaign {
  public id: string;
  public name: string;
  public type: string;
  public status: string;
  public startsAt: string | null;
  public endsAt: string | null;
  public isDiscoverable: boolean;

  constructor(data: CampaignData) {
    this.id = data.id;
    this.name = data.name;
    this.type = data.type;
    this.status = data.status;
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
