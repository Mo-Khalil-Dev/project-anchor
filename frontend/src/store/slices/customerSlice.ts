import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import {
  CustomerSliceState,
  AssessmentData,
  CustomerJourneyStep,
  PaymentPlanType,
  HardshipLevel,
  BankJourneyState,
  BankConnectionData,
  BankError,
} from '@/types';

export type { CustomerSliceState };

const initialState: CustomerSliceState = {
  currentStep: 'home',
  bankConnected: false,
  selectedPlan: undefined,
};

const customerSlice = createSlice({
  name: 'customer',
  initialState,
  reducers: {
    setCurrentStep: (state, action: PayloadAction<CustomerJourneyStep>) => {
      state.currentStep = action.payload;
    },
    setBankConnected: (state, action: PayloadAction<boolean>) => {
      state.bankConnected = action.payload;
    },
    setSelectedPlan: (state, action: PayloadAction<PaymentPlanType | undefined>) => {
      console.log('[Redux] setSelectedPlan reducer called with:', action.payload);
      state.selectedPlan = action.payload;
      console.log('[Redux] state.selectedPlan is now:', state.selectedPlan);
    },
    setAssessment: (state, action: PayloadAction<AssessmentData>) => {
      state.assessment = action.payload;
    },
    setHardshipLevel: (state, action: PayloadAction<HardshipLevel | undefined>) => {
      state.hardshipLevel = action.payload;
    },
    setBankJourneyState: (state, action: PayloadAction<BankJourneyState>) => {
      state.bankJourneyState = action.payload;
    },
    setBankConnectionData: (state, action: PayloadAction<BankConnectionData>) => {
      state.bankConnectionData = action.payload;
    },
    setBankError: (state, action: PayloadAction<BankError | undefined>) => {
      state.bankError = action.payload;
    },
    resetBankJourney: (state) => {
      state.bankJourneyState = undefined;
      state.bankConnectionData = undefined;
      state.bankError = undefined;
    },
    resetCustomer: () => initialState,
  },
});

export const {
  setCurrentStep,
  setBankConnected,
  setSelectedPlan,
  setAssessment,
  setHardshipLevel,
  setBankJourneyState,
  setBankConnectionData,
  setBankError,
  resetBankJourney,
  resetCustomer,
} = customerSlice.actions;

export default customerSlice.reducer;
