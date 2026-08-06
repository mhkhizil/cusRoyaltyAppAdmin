import { Branch } from "../../domain/entities/Branch";
import { IBranchRepository } from "../../domain/repositories/IBranchRepository";
import { IBranchService } from "../../domain/services/IBranchService";

export class BranchService implements IBranchService {
  constructor(private readonly branchRepository: IBranchRepository) {}

  async listBranches(): Promise<Branch[]> {
    return this.branchRepository.listBranches();
  }
}
