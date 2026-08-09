import axios from "axios";
import { Branch } from "../../domain/entities/Branch";
import { IBranchRepository } from "../../domain/repositories/IBranchRepository";
import { BranchDTOMapper } from "../../application/dtos/BranchDTO";
import type { ApiEnvelopeDTO } from "../../application/dtos/AuthDTO";
import { BranchResponseDTO } from "../../application/dtos/BranchDTO";
import { HttpClient } from "../api/HttpClient";
import { API_ENDPOINTS } from "../api/constants";

function extractErrorMessage(error: unknown, fallback: string): string {
  if (axios.isAxiosError(error)) {
    const msg = error.response?.data?.message;
    if (msg) return String(msg);
  }
  if (error instanceof Error && error.message) return error.message;
  return fallback;
}

export class ApiBranchRepository implements IBranchRepository {
  constructor(private readonly httpClient: HttpClient) {}

  async listBranches(): Promise<Branch[]> {
    try {
      const response = await this.httpClient.get<
        ApiEnvelopeDTO<BranchResponseDTO[] | BranchResponseDTO>
      >(API_ENDPOINTS.OPS.BRANCHES);

      if (response.success === false) {
        throw new Error(response.message || "Failed to load branches");
      }

      return BranchDTOMapper.fromListResponse(response.data);
    } catch (error) {
      throw new Error(extractErrorMessage(error, "Failed to load branches"));
    }
  }
}
