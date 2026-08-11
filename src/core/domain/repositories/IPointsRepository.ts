import { Branch } from "../entities/Branch";
import { PointRule } from "../entities/PointRule";
import { QrScanPreview } from "../entities/QrScanPreview";
import { QrScanResult } from "../entities/QrScanResult";
import {
  CreatePointRuleDTO,
  QrScanPreviewRequestDTO,
  QrScanRequestDTO,
} from "../../application/dtos/PointsDTO";

export interface IPointsRepository {
  previewQrScan(payload: QrScanPreviewRequestDTO): Promise<QrScanPreview>;
  scanQr(payload: QrScanRequestDTO): Promise<QrScanResult>;
  listScanLocations(): Promise<Branch[]>;
  listRules(): Promise<PointRule[]>;
  getRuleById(ruleId: string): Promise<PointRule>;
  createRule(payload: CreatePointRuleDTO): Promise<PointRule>;
}
