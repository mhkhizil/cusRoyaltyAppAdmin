export type PointCalculationType = "FLAT" | "SPEND_BASED" | string;

export interface PointRuleData {
  id: string;
  name: string;
  description: string | null;
  calculationType: PointCalculationType;
  flatPoints: number | null;
  spendUnit: number | null;
  pointsPerSpendUnit: number | null;
  minimumPurchase: number | null;
  maximumPointsPerScan: number | null;
  priority: number | null;
  locationIds: string[];
  startsAt: string | null;
  endsAt: string | null;
}

/**
 * Point award rule managed from the admin dashboard.
 */
export class PointRule {
  public id: string;
  public name: string;
  public description: string | null;
  public calculationType: PointCalculationType;
  public flatPoints: number | null;
  public spendUnit: number | null;
  public pointsPerSpendUnit: number | null;
  public minimumPurchase: number | null;
  public maximumPointsPerScan: number | null;
  public priority: number | null;
  public locationIds: string[];
  public startsAt: string | null;
  public endsAt: string | null;

  constructor(data: PointRuleData) {
    this.id = data.id;
    this.name = data.name;
    this.description = data.description;
    this.calculationType = data.calculationType;
    this.flatPoints = data.flatPoints;
    this.spendUnit = data.spendUnit;
    this.pointsPerSpendUnit = data.pointsPerSpendUnit;
    this.minimumPurchase = data.minimumPurchase;
    this.maximumPointsPerScan = data.maximumPointsPerScan;
    this.priority = data.priority;
    this.locationIds = [...data.locationIds];
    this.startsAt = data.startsAt;
    this.endsAt = data.endsAt;
  }

  isFlat(): boolean {
    return String(this.calculationType).toUpperCase() === "FLAT";
  }
}
