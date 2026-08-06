import { Branch } from "../entities/Branch";

export interface IBranchRepository {
  listBranches(): Promise<Branch[]>;
}
