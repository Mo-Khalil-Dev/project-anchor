export interface GetRedirectToJourneyInput {
  userId: string;
}

export interface GetRedirectToJourneyOutput {
  nextPage: string;
  reason: string;
}
