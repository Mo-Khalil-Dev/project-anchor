export const MOCK_TINK_RESPONSE = {
  id: '7bfec36cf31847fa8826f67902736e14',
  externalReference: '',
  engineVersion: '1.0.0',
  createdTime: '2026-04-18T23:47:16.238129409Z',
  identity: {
    name: 'John Doe',
    ssn: '4502029992',
  },
  accounts: [
    {
      id: '063c3cb6ff7c4fcfa248329a3d7c6326',
      accountNumber: 'GB93RQWW92388002979602',
      name: 'Account 1',
      financialInstitutionName: 'Tink Demo Bank',
      holderNames: ['John Doe'],
      iban: 'GB93RQWW92388002979602',
      users: [
        {
          name: 'John Doe',
          role: 'HOLDER',
        },
      ],
    },
  ],
  income: {
    summary: {
      summaryByMonths: {
        lastThreeMonths: {
          total: {
            unscaledValue: '24774370000000003',
            scale: '12',
          },
          mean: {
            unscaledValue: '8258123333333333',
            scale: '12',
          },
          median: {
            unscaledValue: '819419',
            scale: '2',
          },
          min: {
            unscaledValue: '814296',
            scale: '2',
          },
          max: {
            unscaledValue: '843722',
            scale: '2',
          },
        },
        lastSixMonths: {
          total: {
            unscaledValue: '4943726000000001',
            scale: '11',
          },
          mean: {
            unscaledValue: '8239543333333333',
            scale: '12',
          },
          median: {
            unscaledValue: '8218945',
            scale: '3',
          },
          min: {
            unscaledValue: '795676',
            scale: '2',
          },
          max: {
            unscaledValue: '846243',
            scale: '2',
          },
        },
      },
      summaryByTransactions: {
        lastThreeMonths: {
          total: {
            unscaledValue: '2477437',
            scale: '2',
          },
          mean: {
            unscaledValue: '8258123333333333',
            scale: '12',
          },
          median: {
            unscaledValue: '819419',
            scale: '2',
          },
          min: {
            unscaledValue: '814296',
            scale: '2',
          },
          max: {
            unscaledValue: '843722',
            scale: '2',
          },
        },
        lastSixMonths: {
          total: {
            unscaledValue: '4943726',
            scale: '2',
          },
          mean: {
            unscaledValue: '8239543333333333',
            scale: '12',
          },
          median: {
            unscaledValue: '8218945',
            scale: '3',
          },
          min: {
            unscaledValue: '795676',
            scale: '2',
          },
          max: {
            unscaledValue: '846243',
            scale: '2',
          },
        },
      },
      summaryByTypes: {
        salary: {
          accountIds: ['063c3cb6ff7c4fcfa248329a3d7c6326'],
          currencyCode: 'GBP',
          summaryByMonths: {
            lastThreeMonths: {
              total: {
                unscaledValue: '24774370000000003',
                scale: '12',
              },
              mean: {
                unscaledValue: '8258123333333333',
                scale: '12',
              },
              median: {
                unscaledValue: '819419',
                scale: '2',
              },
              min: {
                unscaledValue: '814296',
                scale: '2',
              },
              max: {
                unscaledValue: '843722',
                scale: '2',
              },
            },
            lastSixMonths: {
              total: {
                unscaledValue: '4943726000000001',
                scale: '11',
              },
              mean: {
                unscaledValue: '8239543333333333',
                scale: '12',
              },
              median: {
                unscaledValue: '8218945',
                scale: '3',
              },
              min: {
                unscaledValue: '795676',
                scale: '2',
              },
              max: {
                unscaledValue: '846243',
                scale: '2',
              },
            },
          },
          summaryByTransactions: {
            lastThreeMonths: {
              total: {
                unscaledValue: '2477437',
                scale: '2',
              },
              mean: {
                unscaledValue: '8258123333333333',
                scale: '12',
              },
              median: {
                unscaledValue: '819419',
                scale: '2',
              },
              min: {
                unscaledValue: '814296',
                scale: '2',
              },
              max: {
                unscaledValue: '843722',
                scale: '2',
              },
            },
            lastSixMonths: {
              total: {
                unscaledValue: '4943726',
                scale: '2',
              },
              mean: {
                unscaledValue: '8258123333333333',
                scale: '12',
              },
              median: {
                unscaledValue: '819419',
                scale: '2',
              },
              min: {
                unscaledValue: '814296',
                scale: '2',
              },
              max: {
                unscaledValue: '843722',
                scale: '2',
              },
            },
          },
          occurrences: {
            count: 12,
            first: '2025-05-18',
            last: '2026-04-18',
          },
          streamIds: ['32ab49258a9843778a7c5ed166b42b25'],
          summaryBySubTypes: {
            salarySubTypeSalary: {
              accountIds: ['063c3cb6ff7c4fcfa248329a3d7c6326'],
              currencyCode: 'GBP',
              summaryByMonths: {
                lastThreeMonths: {
                  total: {
                    unscaledValue: '24774370000000003',
                    scale: '12',
                  },
                  mean: {
                    unscaledValue: '8258123333333333',
                    scale: '12',
                  },
                  median: {
                    unscaledValue: '819419',
                    scale: '2',
                  },
                  min: {
                    unscaledValue: '814296',
                    scale: '2',
                  },
                  max: {
                    unscaledValue: '843722',
                    scale: '2',
                  },
                },
                lastSixMonths: {
                  total: {
                    unscaledValue: '4943726000000001',
                    scale: '11',
                  },
                  mean: {
                    unscaledValue: '8239543333333333',
                    scale: '12',
                  },
                  median: {
                    unscaledValue: '8218945',
                    scale: '3',
                  },
                  min: {
                    unscaledValue: '795676',
                    scale: '2',
                  },
                  max: {
                    unscaledValue: '846243',
                    scale: '2',
                  },
                },
              },
              summaryByTransactions: {
                lastThreeMonths: {
                  total: {
                    unscaledValue: '2477437',
                    scale: '2',
                  },
                  mean: {
                    unscaledValue: '8258123333333333',
                    scale: '12',
                  },
                  median: {
                    unscaledValue: '819419',
                    scale: '2',
                  },
                  min: {
                    unscaledValue: '814296',
                    scale: '2',
                  },
                  max: {
                    unscaledValue: '843722',
                    scale: '2',
                  },
                },
                lastSixMonths: {
                  total: {
                    unscaledValue: '4943726',
                    scale: '2',
                  },
                  mean: {
                    unscaledValue: '8258123333333333',
                    scale: '12',
                  },
                  median: {
                    unscaledValue: '819419',
                    scale: '2',
                  },
                  min: {
                    unscaledValue: '814296',
                    scale: '2',
                  },
                  max: {
                    unscaledValue: '843722',
                    scale: '2',
                  },
                },
              },
              occurrences: {
                count: 12,
                first: '2025-05-18',
                last: '2026-04-18',
              },
              streamIds: ['32ab49258a9843778a7c5ed166b42b25'],
            },
          },
        },
      },
    },
    streams: [
      {
        id: '32ab49258a9843778a7c5ed166b42b25',
        accountId: '063c3cb6ff7c4fcfa248329a3d7c6326',
        type: 'SALARY',
        currencyCode: 'GBP',
        summaryByMonths: {
          lastThreeMonths: {
            total: {
              unscaledValue: '24774370000000003',
              scale: '12',
            },
            mean: {
              unscaledValue: '8258123333333333',
              scale: '12',
            },
            median: {
              unscaledValue: '819419',
              scale: '2',
            },
            min: {
              unscaledValue: '814296',
              scale: '2',
            },
            max: {
              unscaledValue: '843722',
              scale: '2',
            },
          },
          lastSixMonths: {
            total: {
              unscaledValue: '4943726000000001',
              scale: '11',
            },
            mean: {
              unscaledValue: '8239543333333333',
              scale: '12',
            },
            median: {
              unscaledValue: '8218945',
              scale: '3',
            },
            min: {
              unscaledValue: '795676',
              scale: '2',
            },
            max: {
              unscaledValue: '846243',
              scale: '2',
            },
          },
        },
        summaryByTransactions: {
          lastThreeMonths: {
            total: {
              unscaledValue: '2477437',
              scale: '2',
            },
            mean: {
              unscaledValue: '8258123333333333',
              scale: '12',
            },
            median: {
              unscaledValue: '819419',
              scale: '2',
            },
            min: {
              unscaledValue: '814296',
              scale: '2',
            },
            max: {
              unscaledValue: '843722',
              scale: '2',
            },
          },
          lastSixMonths: {
            total: {
              unscaledValue: '4943726',
              scale: '2',
            },
            mean: {
              unscaledValue: '8258123333333333',
              scale: '12',
            },
            median: {
              unscaledValue: '819419',
              scale: '2',
            },
            min: {
              unscaledValue: '814296',
              scale: '2',
            },
            max: {
              unscaledValue: '843722',
              scale: '2',
            },
          },
        },
        occurrences: {
          count: 12,
          first: '2025-05-18',
          last: '2026-04-18',
        },
        transactions: [
          {
            id: '2539cce490454f909864703383bbde14',
            description: 'income',
            time: '2026-04-18T10:00:00Z',
            amount: {
              value: {
                unscaledValue: '80616',
                scale: '1',
              },
              currencyCode: 'GBP',
            },
            accountId: '063c3cb6ff7c4fcfa248329a3d7c6326',
          },
          {
            id: '4d066d3418f54ee19a72f025b634ad79',
            description: 'income',
            time: '2026-03-18T11:00:00Z',
            amount: {
              value: {
                unscaledValue: '814296',
                scale: '2',
              },
              currencyCode: 'GBP',
            },
            accountId: '063c3cb6ff7c4fcfa248329a3d7c6326',
          },
          {
            id: '41f592261a1349c38cb209aca873e66a',
            description: 'income',
            time: '2026-02-18T11:00:00Z',
            amount: {
              value: {
                unscaledValue: '819419',
                scale: '2',
              },
              currencyCode: 'GBP',
            },
            accountId: '063c3cb6ff7c4fcfa248329a3d7c6326',
          },
          {
            id: '363c25b76eb04849b17f2c8698bd5479',
            description: 'income',
            time: '2026-01-18T11:00:00Z',
            amount: {
              value: {
                unscaledValue: '843722',
                scale: '2',
              },
              currencyCode: 'GBP',
            },
            accountId: '063c3cb6ff7c4fcfa248329a3d7c6326',
          },
          {
            id: '929466e5a7534dedad0b0c8d42d5c877',
            description: 'income',
            time: '2025-12-18T11:00:00Z',
            amount: {
              value: {
                unscaledValue: '795676',
                scale: '2',
              },
              currencyCode: 'GBP',
            },
            accountId: '063c3cb6ff7c4fcfa248329a3d7c6326',
          },
          {
            id: '728c8131a2314e0f84c1d32717fbd787',
            description: 'income',
            time: '2025-11-18T11:00:00Z',
            amount: {
              value: {
                unscaledValue: '846243',
                scale: '2',
              },
              currencyCode: 'GBP',
            },
            accountId: '063c3cb6ff7c4fcfa248329a3d7c6326',
          },
          {
            id: '1c7f53997cad4b6cb7ef9306fc4af95b',
            description: 'income',
            time: '2025-10-18T10:00:00Z',
            amount: {
              value: {
                unscaledValue: '82437',
                scale: '1',
              },
              currencyCode: 'GBP',
            },
            accountId: '063c3cb6ff7c4fcfa248329a3d7c6326',
          },
          {
            id: '7f06381d8a434412a0f9ac65cc5e7767',
            description: 'income',
            time: '2025-09-18T10:00:00Z',
            amount: {
              value: {
                unscaledValue: '848395',
                scale: '2',
              },
              currencyCode: 'GBP',
            },
            accountId: '063c3cb6ff7c4fcfa248329a3d7c6326',
          },
          {
            id: '75ab527408374f03b50d2afe5c69b2fb',
            description: 'income',
            time: '2025-08-18T10:00:00Z',
            amount: {
              value: {
                unscaledValue: '813209',
                scale: '2',
              },
              currencyCode: 'GBP',
            },
            accountId: '063c3cb6ff7c4fcfa248329a3d7c6326',
          },
          {
            id: '8422974cce454519b1515ff98c73764e',
            description: 'income',
            time: '2025-07-18T10:00:00Z',
            amount: {
              value: {
                unscaledValue: '816653',
                scale: '2',
              },
              currencyCode: 'GBP',
            },
            accountId: '063c3cb6ff7c4fcfa248329a3d7c6326',
          },
          {
            id: '9754282456944ddc9444438478135b82',
            description: 'income',
            time: '2025-06-18T10:00:00Z',
            amount: {
              value: {
                unscaledValue: '829451',
                scale: '2',
              },
              currencyCode: 'GBP',
            },
            accountId: '063c3cb6ff7c4fcfa248329a3d7c6326',
          },
          {
            id: '968096a43e784e139f6805308001de8e',
            description: 'income',
            time: '2025-05-18T10:00:00Z',
            amount: {
              value: {
                unscaledValue: '818404',
                scale: '2',
              },
              currencyCode: 'GBP',
            },
            accountId: '063c3cb6ff7c4fcfa248329a3d7c6326',
          },
        ],
        subType: 'SALARY_SUB_TYPE_SALARY',
      },
    ],
    primaryIncomeStreamId: '32ab49258a9843778a7c5ed166b42b25',
  },
  appId: '4f7f0640b15745a8ba55cb4021f4f098',
  userId: 'c845eda57a6f4d14930fcd163204f6b8',
};
