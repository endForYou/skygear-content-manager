export interface PushCampaign {
  id: string;
  content: string;
  device: string;
  send_time: Date;
  user_id: string;
}

export const pushCampaignConfig = ['id', 'content', 'device', 'send_time', 'user_id'];
