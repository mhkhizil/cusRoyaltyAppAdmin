export interface QrScanResultData {
  scanId: string;
  customerId: string;
  purchaseId: string | null;
  pointsAwarded: number;
  ruleId: string | null;
  purchaseAmount: number;
  discountAmount: number;
  payableAmount: number;
  campaignId: string | null;
  campaignName: string | null;
  badgesAwarded: string[];
  tierName: string | null;
  tierUpgraded: boolean;
}

/**
 * Result of an admin QR scan that awards customer points.
 */
export class QrScanResult {
  public scanId: string;
  public customerId: string;
  public purchaseId: string | null;
  public pointsAwarded: number;
  public ruleId: string | null;
  public purchaseAmount: number;
  public discountAmount: number;
  public payableAmount: number;
  public campaignId: string | null;
  public campaignName: string | null;
  public badgesAwarded: string[];
  public tierName: string | null;
  public tierUpgraded: boolean;

  constructor(data: QrScanResultData) {
    this.scanId = data.scanId;
    this.customerId = data.customerId;
    this.purchaseId = data.purchaseId;
    this.pointsAwarded = data.pointsAwarded;
    this.ruleId = data.ruleId;
    this.purchaseAmount = data.purchaseAmount;
    this.discountAmount = data.discountAmount;
    this.payableAmount = data.payableAmount;
    this.campaignId = data.campaignId;
    this.campaignName = data.campaignName;
    this.badgesAwarded = [...data.badgesAwarded];
    this.tierName = data.tierName;
    this.tierUpgraded = data.tierUpgraded;
  }

  hasNoMatchingRule(): boolean {
    return this.pointsAwarded === 0 && !this.ruleId;
  }

  hasCampaignDiscount(): boolean {
    return this.discountAmount > 0;
  }

  formatCampaignLabel(): string | null {
    if (this.campaignName?.trim()) return this.campaignName.trim();
    if (this.campaignId?.trim()) return this.campaignId.trim();
    return null;
  }
}
