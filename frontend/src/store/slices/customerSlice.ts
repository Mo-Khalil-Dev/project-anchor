import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import {
  CustomerSliceState,
  AssessmentData,
  CustomerJourneyStep,
  PaymentPlanType,
  HardshipLevel,
} from '@/types';

export type { CustomerSliceState };

const initialState: CustomerSliceState = {
  currentStep: 'home',
  bankConnected: false,
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
      state.selectedPlan = action.payload;
    },
    setAssessment: (state, action: PayloadAction<AssessmentData>) => {
      state.assessment = action.payload;
    },
    setHardshipLevel: (state, action: PayloadAction<HardshipLevel | undefined>) => {
      state.hardshipLevel = action.payload;
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
  resetCustomer,
} = customerSlice.actions;

export default customerSlice.reducer;
