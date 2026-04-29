export const API = {
  assessments: {
    get: (assessmentId: string) => `/assessments/${assessmentId}`,
    current: '/me/assessment',
  },
  bankConnections: {
    initiate: '/bank-connections/initiate',
    callback: '/bank-connections/callback',
  },
  customer: {
    setup: '/customer/setup',
  },
} as const;
