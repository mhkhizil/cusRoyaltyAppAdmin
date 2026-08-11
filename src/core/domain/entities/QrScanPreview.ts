export type CampaignMode =
  | "AUTO"
  | "CUSTOMER_REDEMPTION"
  | "MANUAL"
  | "NONE";

export const CAMPAIGN_MODES: CampaignMode[] = [
  "AUTO",
  "CUSTOMER_REDEMPTION",
  "MANUAL",
  "NONE",
];

export function isCampaignMode(value: string): value is CampaignMode {
  return CAMPAIGN_MODES.includes(value as CampaignMode);
}

export interface QrScanCampaignOptionData {
  campaignId: string;
  campaignName: string;
  campaignType: string;
  discountAmount: number;
  payableAmount: number;
  redemptionId: string | null;
  source: string;
}

export interface QrScanPreviewData {
  customerId: string;
  purchaseAmount: number;
  locationId: string;
  suggestedCampaign: QrScanCampaignOptionData | null;
  customerClaimedCampaigns: QrScanCampaignOptionData[];
  eligibleCampaigns: QrScanCampaignOptionData[];
}

export class QrScanCampaignOption {
  public campaignId: string;
  public campaignName: string;
  public campaignType: string;
  public discountAmount: number;
  public payableAmount: number;
  public redemptionId: string | null;
  public source: string;

  constructor(data: QrScanCampaignOptionData) {
    this.campaignId = data.campaignId;
    this.campaignName = data.campaignName;
    this.campaignType = data.campaignType;
    this.discountAmount = data.discountAmount;
    this.payableAmount = data.payableAmount;
    this.redemptionId = data.redemptionId;
    this.source = data.source;
  }

  displayName(): string {
    return this.campaignName.trim() || this.campaignId;
  }

  hasRedemption(): boolean {
    return Boolean(this.redemptionId?.trim());
  }
}

/**
 * Preview of campaign options before confirming a QR checkout scan.
 */
export class QrScanPreview {
  public customerId: string;
  public purchaseAmount: number;
  public locationId: string;
  public suggestedCampaign: QrScanCampaignOption | null;
  public customerClaimedCampaigns: QrScanCampaignOption[];
  public eligibleCampaigns: QrScanCampaignOption[];

  constructor(data: QrScanPreviewData) {
    this.customerId = data.customerId;
    this.purchaseAmount = data.purchaseAmount;
    this.locationId = data.locationId;
    this.suggestedCampaign = data.suggestedCampaign
      ? new QrScanCampaignOption(data.suggestedCampaign)
      : null;
    this.customerClaimedCampaigns = data.customerClaimedCampaigns.map(
      (item) => new QrScanCampaignOption(item)
    );
    this.eligibleCampaigns = data.eligibleCampaigns.map(
      (item) => new QrScanCampaignOption(item)
    );
  }

  hasAnyCampaignOptions(): boolean {
    return (
      this.suggestedCampaign !== null ||
      this.customerClaimedCampaigns.length > 0 ||
      this.eligibleCampaigns.length > 0
    );
  }
}
