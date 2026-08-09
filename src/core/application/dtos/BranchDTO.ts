import { Branch } from "../../domain/entities/Branch";
import { nullableString, normalizeArrayResponse } from "./dtoMapperUtils";

export interface BranchResponseDTO {
  id: string;
  name?: string;
  code?: string | null;
  address?: string | null;
  isActive?: boolean;
}

export class BranchDTOMapper {
  static toDomain(dto: BranchResponseDTO): Branch {
    return new Branch({
      id: String(dto.id),
      name: String(dto.name || dto.code || dto.id),
      code: nullableString(dto.code),
      address: nullableString(dto.address),
      isActive: dto.isActive !== false,
    });
  }

  static toDomainList(dtos: BranchResponseDTO[]): Branch[] {
    return dtos.map((dto) => BranchDTOMapper.toDomain(dto));
  }

  static fromListResponse(data: unknown): Branch[] {
    const rows = normalizeArrayResponse<BranchResponseDTO>(data, [
      "items",
      "branches",
      "data",
    ]);
    return BranchDTOMapper.toDomainList(rows);
  }
}
