import {
  Campaign,
  CampaignDetail,
  CreateCampaignResult,
} from "../entities/Campaign";
import {
  CreateCampaignDTO,
  UpdateCampaignDTO,
  UpdateCampaignStatusDTO,
} from "../../application/dtos/CampaignDTO";

export interface ICampaignRepository {
  listCampaigns(): Promise<Campaign[]>;
  getCampaignById(campaignId: string): Promise<CampaignDetail>;
  createCampaign(payload: CreateCampaignDTO): Promise<CreateCampaignResult>;
  updateCampaign(
    campaignId: string,
    payload: UpdateCampaignDTO
  ): Promise<CampaignDetail>;
  updateCampaignStatus(
    campaignId: string,
    payload: UpdateCampaignStatusDTO
  ): Promise<Campaign>;
}
