import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { AdminSliceState, CaseReviewTab } from '@/types';

export type { AdminSliceState };

const initialState: AdminSliceState = {
  caseReviewTab: 'overview',
  modifyPlanMode: false,
  requestInfoMode: false,
  escalateMode: false,
};

const adminSlice = createSlice({
  name: 'admin',
  initialState,
  reducers: {
    setSelectedCaseId: (state, action: PayloadAction<string | undefined>) => {
      state.selectedCaseId = action.payload;
    },
    setCaseReviewTab: (state, action: PayloadAction<CaseReviewTab>) => {
      state.caseReviewTab = action.payload;
    },
    setModifyPlanMode: (state, action: PayloadAction<boolean>) => {
      state.modifyPlanMode = action.payload;
    },
    setRequestInfoMode: (state, action: PayloadAction<boolean>) => {
      state.requestInfoMode = action.payload;
    },
    setEscalateMode: (state, action: PayloadAction<boolean>) => {
      state.escalateMode = action.payload;
    },
    resetAdmin: () => initialState,
  },
});

export const {
  setSelectedCaseId,
  setCaseReviewTab,
  setModifyPlanMode,
  setRequestInfoMode,
  setEscalateMode,
  resetAdmin,
} = adminSlice.actions;

export default adminSlice.reducer;
