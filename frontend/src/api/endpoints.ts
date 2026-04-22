export const API = {
  assessments: {
    get: (assessmentId: string) => `/assessments/${assessmentId}`,
  },
  bankConnections: {
    initiate: '/bank-connections/initiate',
    callback: '/bank-connections/callback',
  },
} as const;
