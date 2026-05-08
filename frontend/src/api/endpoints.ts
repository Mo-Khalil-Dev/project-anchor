export const API = {
  assessments: {
    get: (assessmentId: string) => `/assessments/${assessmentId}`,
    current: '/me/assessment',
    selectPlan: '/assessments/select-plan',
  },
  bankConnections: {
    initiate: '/bank-connections/initiate',
    callback: '/bank-connections/callback',
  },
  customer: {
    setup: '/customer/setup',
  },
  payments: {
    initiateDirectDebit: '/payments/initiate-direct-debit',
  },
  referenceData: {
    get: '/reference-data',
  },
} as const;
