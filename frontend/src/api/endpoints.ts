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
  payments: {
    selectPlan: '/payments/select-plan',
    initiateDirectDebit: '/payments/initiate-direct-debit',
  },
  referenceData: {
    get: '/reference-data',
  },
} as const;
