export type PointCalculationType = "FLAT" | "AMOUNT_BASED" | "HYBRID";

export const POINT_CALCULATION_TYPES: PointCalculationType[] = [
  "FLAT",
  "AMOUNT_BASED",
  "HYBRID",
];

export function isPointCalculationType(
  value: string
): value is PointCalculationType {
  return POINT_CALCULATION_TYPES.includes(value as PointCalculationType);
}

export type PointRuleLifecycleStatus =
  | "ACTIVE"
  | "INACTIVE"
  | "SCHEDULED"
  | "EXPIRED";

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
  dailyUserPointCap: number | null;
  priority: number | null;
  locationIds: string[];
  status: string | null;
  startsAt: string | null;
  endsAt: string | null;
  createdAt: string | null;
  updatedAt: string | null;
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
  public dailyUserPointCap: number | null;
  public priority: number | null;
  public locationIds: string[];
  public status: string | null;
  public startsAt: string | null;
  public endsAt: string | null;
  public createdAt: string | null;
  public updatedAt: string | null;

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
    this.dailyUserPointCap = data.dailyUserPointCap;
    this.priority = data.priority;
    this.locationIds = [...data.locationIds];
    this.status = data.status;
    this.startsAt = data.startsAt;
    this.endsAt = data.endsAt;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
  }

  isFlat(): boolean {
    return this.normalizedCalculationType() === "FLAT";
  }

  isAmountBased(): boolean {
    return this.normalizedCalculationType() === "AMOUNT_BASED";
  }

  isHybrid(): boolean {
    return this.normalizedCalculationType() === "HYBRID";
  }

  normalizedCalculationType(): PointCalculationType | string {
    return String(this.calculationType || "").toUpperCase();
  }

  formatPointsSummary(): string {
    if (this.isFlat()) {
      return String(this.flatPoints ?? "—");
    }

    const amountPart = `${this.pointsPerSpendUnit ?? "—"} / ${this.spendUnit ?? "—"}`;

    if (this.isHybrid()) {
      return `${this.flatPoints ?? "—"} + ${amountPart}`;
    }

    return amountPart;
  }

  normalizedStatus(): string {
    return String(this.status || "").trim().toUpperCase();
  }

  resolveLifecycleStatus(
    referenceDate: Date = new Date()
  ): PointRuleLifecycleStatus {
    const apiStatus = this.normalizedStatus();
    if (
      apiStatus === "INACTIVE" ||
      apiStatus === "DISABLED" ||
      apiStatus === "ARCHIVED" ||
      apiStatus === "DRAFT"
    ) {
      return "INACTIVE";
    }

    if (this.startsAt) {
      const start = new Date(this.startsAt);
      if (!Number.isNaN(start.getTime()) && referenceDate < start) {
        return "SCHEDULED";
      }
    }

    if (this.endsAt) {
      const end = new Date(this.endsAt);
      if (!Number.isNaN(end.getTime()) && referenceDate > end) {
        return "EXPIRED";
      }
    }

    if (apiStatus && apiStatus !== "ACTIVE") {
      return "INACTIVE";
    }

    return "ACTIVE";
  }

  appliesToAllBranches(): boolean {
    return this.locationIds.length === 0;
  }

  formatLocationScope(resolveLabel: (locationId: string) => string): string {
    if (this.appliesToAllBranches()) {
      return "";
    }

    return this.locationIds.map((id) => resolveLabel(id)).join(", ");
  }
}
