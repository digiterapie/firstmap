'use client';
import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { Assessment, AssessmentAction } from '@/types';

const STORAGE_KEY = 'firstmap_assessment_v2';

const initialState: Assessment = {
  childNickname: '',
  ageBandId: '',
  context: '',
  generalNote: '',
  dateISO: new Date().toISOString().slice(0, 10),
  statuses: {},
  sectionNotes: {},
  selectedWorkerActivities: [],
  selectedParentActivities: [],
  customWorkerActivities: [],
  customParentActivities: [],
  finalNote: '',
  confirmed: false,
};

function reducer(state: Assessment, action: AssessmentAction): Assessment {
  switch (action.type) {
    case 'SET_STUDIO':
      return { ...state, ...action.payload };
    case 'SET_STATUS':
      return { ...state, statuses: { ...state.statuses, [action.itemId]: action.status } };
    case 'SET_SECTION_NOTE':
      return { ...state, sectionNotes: { ...state.sectionNotes, [action.sectionId]: action.note } };
    case 'RESET_SECTION': {
      const newStatuses = { ...state.statuses };
      action.itemIds.forEach(id => delete newStatuses[id]);
      const newNotes = { ...state.sectionNotes };
      delete newNotes[action.sectionId];
      return { ...state, statuses: newStatuses, sectionNotes: newNotes };
    }
    case 'TOGGLE_WORKER_ACTIVITY': {
      const exists = state.selectedWorkerActivities.includes(action.activity);
      return { ...state, selectedWorkerActivities: exists ? state.selectedWorkerActivities.filter(a => a !== action.activity) : [...state.selectedWorkerActivities, action.activity] };
    }
    case 'TOGGLE_PARENT_ACTIVITY': {
      const exists = state.selectedParentActivities.includes(action.activity);
      return { ...state, selectedParentActivities: exists ? state.selectedParentActivities.filter(a => a !== action.activity) : [...state.selectedParentActivities, action.activity] };
    }
    case 'ADD_CUSTOM_WORKER':
      return { ...state, customWorkerActivities: [...state.customWorkerActivities, action.text] };
    case 'ADD_CUSTOM_PARENT':
      return { ...state, customParentActivities: [...state.customParentActivities, action.text] };
    case 'REMOVE_CUSTOM_WORKER':
      return { ...state, customWorkerActivities: state.customWorkerActivities.filter((_, i) => i !== action.index) };
    case 'REMOVE_CUSTOM_PARENT':
      return { ...state, customParentActivities: state.customParentActivities.filter((_, i) => i !== action.index) };
    case 'SET_FINAL_NOTE':
      return { ...state, finalNote: action.note };
    case 'SET_CONFIRMED':
      return { ...state, confirmed: action.value };
    case 'RESET_ALL':
      return { ...initialState, dateISO: new Date().toISOString().slice(0, 10) };
    default:
      return state;
  }
}

const AssessmentContext = createContext<{
  state: Assessment;
  dispatch: React.Dispatch<AssessmentAction>;
} | null>(null);

export function AssessmentProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState, (init) => {
    if (typeof window === 'undefined') return init;
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return { ...init, ...JSON.parse(saved) };
    } catch {}
    return init;
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {}
  }, [state]);

  return (
    <AssessmentContext.Provider value={{ state, dispatch }}>
      {children}
    </AssessmentContext.Provider>
  );
}

export function useAssessment() {
  const ctx = useContext(AssessmentContext);
  if (!ctx) throw new Error('useAssessment must be used within AssessmentProvider');
  return ctx;
}
