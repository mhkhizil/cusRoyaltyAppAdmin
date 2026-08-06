export interface BranchData {
  id: string;
  name: string;
  code: string | null;
  address: string | null;
  isActive: boolean;
}

/**
 * Branch / location from admin ops.
 */
export class Branch {
  public id: string;
  public name: string;
  public code: string | null;
  public address: string | null;
  public isActive: boolean;

  constructor(data: BranchData) {
    this.id = data.id;
    this.name = data.name;
    this.code = data.code;
    this.address = data.address;
    this.isActive = data.isActive;
  }

  get displayLabel(): string {
    if (this.code) {
      return `${this.name} (${this.code})`;
    }
    return this.name;
  }
}
