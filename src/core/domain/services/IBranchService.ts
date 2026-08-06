import { Branch } from "../entities/Branch";

export interface IBranchService {
  listBranches(): Promise<Branch[]>;
}
