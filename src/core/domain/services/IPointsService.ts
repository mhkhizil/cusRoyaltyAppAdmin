import { Branch } from "../entities/Branch";
import { PointRule } from "../entities/PointRule";
import { QrScanResult } from "../entities/QrScanResult";
import {
  CreatePointRuleDTO,
  QrScanRequestDTO,
} from "../../application/dtos/PointsDTO";

export interface IPointsService {
  scanQr(payload: QrScanRequestDTO): Promise<QrScanResult>;
  listScanLocations(): Promise<Branch[]>;
  listRules(): Promise<PointRule[]>;
  getRuleById(ruleId: string): Promise<PointRule>;
  createRule(payload: CreatePointRuleDTO): Promise<PointRule>;
}
