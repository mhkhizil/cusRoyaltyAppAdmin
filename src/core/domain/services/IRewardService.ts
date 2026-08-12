import {
  CreateRewardResult,
  Reward,
  RewardDetail,
  RewardRedemption,
} from "../entities/Reward";
import {
  CreateRewardDTO,
  ListRewardRedemptionsQueryDTO,
  UpdateRewardDTO,
  UpdateRewardStatusDTO,
} from "../../application/dtos/RewardDTO";

export interface IRewardService {
  listRewards(): Promise<Reward[]>;
  getRewardById(rewardId: string): Promise<RewardDetail>;
  createReward(payload: CreateRewardDTO): Promise<CreateRewardResult>;
  updateReward(
    rewardId: string,
    payload: UpdateRewardDTO,
    rewardType?: string
  ): Promise<RewardDetail>;
  updateRewardStatus(
    rewardId: string,
    payload: UpdateRewardStatusDTO
  ): Promise<Reward>;
  listRedemptions(
    query?: ListRewardRedemptionsQueryDTO
  ): Promise<RewardRedemption[]>;
  fulfillRedemption(redemptionId: string): Promise<RewardRedemption>;
  uploadRewardImage(rewardId: string, file: File): Promise<RewardDetail>;
  deleteRewardImage(rewardId: string): Promise<RewardDetail>;
}
