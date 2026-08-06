import axios from "axios";
import { Branch } from "../../domain/entities/Branch";
import { IBranchRepository } from "../../domain/repositories/IBranchRepository";
import { BranchResponseDTO } from "../../application/dtos/BranchDTO";
import type { ApiEnvelopeDTO } from "../../application/dtos/AuthDTO";
import { HttpClient } from "../api/HttpClient";
import { API_ENDPOINTS } from "../api/constants";

function nullableString(value: unknown): string | null {
  if (value === null || value === undefined || value === "") return null;
  return String(value);
}

function extractErrorMessage(error: unknown, fallback: string): string {
  if (axios.isAxiosError(error)) {
    const msg = error.response?.data?.message;
    if (msg) return String(msg);
  }
  if (error instanceof Error && error.message) return error.message;
  return fallback;
}

function mapBranch(dto: BranchResponseDTO): Branch {
  return new Branch({
    id: String(dto.id),
    name: String(dto.name || dto.code || dto.id),
    code: nullableString(dto.code),
    address: nullableString(dto.address),
    isActive: dto.isActive !== false,
  });
}

function normalizeBranchList(data: unknown): BranchResponseDTO[] {
  if (Array.isArray(data)) {
    return data as BranchResponseDTO[];
  }

  if (!data || typeof data !== "object") {
    return [];
  }

  const record = data as Record<string, unknown>;

  if (Array.isArray(record.items)) {
    return record.items as BranchResponseDTO[];
  }
  if (Array.isArray(record.branches)) {
    return record.branches as BranchResponseDTO[];
  }
  if (Array.isArray(record.data)) {
    return record.data as BranchResponseDTO[];
  }
  if (typeof record.id === "string") {
    return [record as unknown as BranchResponseDTO];
  }

  return [];
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

      return normalizeBranchList(response.data).map(mapBranch);
    } catch (error) {
      throw new Error(extractErrorMessage(error, "Failed to load branches"));
    }
  }
}
