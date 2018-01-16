export interface PushCampaign {
  id: string;
  content: string;
  type: string;
  send_time: Date;
  sent: boolean;
  number_of_audiences: number;
}

export interface NewPushCampaign {
  type: string;
  userIds: string[];
  numberOfAudiences: number;
  messageContent: string;
}
