import {
  Campaign,
  CreateCampaignResult,
} from "../entities/Campaign";
import {
  CreateCampaignDTO,
  UpdateCampaignStatusDTO,
} from "../../application/dtos/CampaignDTO";

export interface ICampaignRepository {
  listCampaigns(): Promise<Campaign[]>;
  createCampaign(payload: CreateCampaignDTO): Promise<CreateCampaignResult>;
  updateCampaignStatus(
    campaignId: string,
    payload: UpdateCampaignStatusDTO
  ): Promise<Campaign>;
}
