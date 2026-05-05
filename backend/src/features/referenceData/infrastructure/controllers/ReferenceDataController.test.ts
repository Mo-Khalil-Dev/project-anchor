import { Result } from '../../../shared/result';
import { ReferenceDataController } from './ReferenceDataController';

describe('ReferenceDataController', () => {
  const execute = jest.fn();
  const getReferenceDataUseCase = { execute } as any;
  const completeAssessmentUseCase = { execute: jest.fn() } as any;
  const failAssessmentUseCase = { execute: jest.fn() } as any;
  const selectPaymentPlanUseCase = { execute: jest.fn() } as any;
  const controller = new ReferenceDataController(
    getReferenceDataUseCase,
    completeAssessmentUseCase,
    failAssessmentUseCase,
    selectPaymentPlanUseCase,
  );

  const buildRes = () =>
    ({
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    }) as any;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns 401 when request has no authenticated user', async () => {
    const res = buildRes();

    await controller.getReferenceData({} as any, res);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: 'Unauthorized' });
  });

  it('returns 200 with data when use case succeeds', async () => {
    const data = { nextStep: 'PAYMENT_PLANS' };
    execute.mockResolvedValue(Result.ok(data));
    const res = buildRes();

    await controller.getReferenceData({ user: { id: 'user-1' } } as any, res);

    expect(execute).toHaveBeenCalledWith({ userId: 'user-1' });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ success: true, data });
  });

  it('returns 400 when use case fails', async () => {
    execute.mockResolvedValue(Result.fail(new Error('bad input')));
    const res = buildRes();

    await controller.getReferenceData({ user: { id: 'user-1' } } as any, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'bad input' });
  });
});
