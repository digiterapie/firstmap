export type StatusKey = 'ZVLADA' | 'NEZVLADA' | 'DOPOMOC';

export type AgeBandId = '3-4' | '5-6';
export type ContextId = 'doma' | 'venku' | 'klub' | 'jiné';

export interface ChecklistItem {
  id: string;
  text: string;
}

export interface ChecklistSection {
  id: string;
  title: string;
  category_weight: number;
  items: ChecklistItem[];
}

export interface ChecklistData {
  version: string;
  age_bands: {
    '3-4': ChecklistSection[];
    '5-6': ChecklistSection[];
  };
}

export interface ActivitiesCategory {
  id: string;
  worker: string[];
  parent: string[];
}

export interface ActivitiesData {
  version: string;
  categories: ActivitiesCategory[];
}

export interface Assessment {
  childNickname: string;
  ageBandId: AgeBandId | '';
  context: ContextId | '';
  generalNote: string;
  dateISO: string;
  statuses: Record<string, StatusKey>;
  sectionNotes: Record<string, string>;
  selectedWorkerActivities: string[];
  selectedParentActivities: string[];
  customWorkerActivities: string[];
  customParentActivities: string[];
  finalNote: string;
  confirmed: boolean;
}

export type AssessmentAction =
  | { type: 'SET_STUDIO'; payload: Partial<Assessment> }
  | { type: 'SET_STATUS'; itemId: string; status: StatusKey }
  | { type: 'SET_SECTION_NOTE'; sectionId: string; note: string }
  | { type: 'RESET_SECTION'; sectionId: string; itemIds: string[] }
  | { type: 'TOGGLE_WORKER_ACTIVITY'; activity: string }
  | { type: 'TOGGLE_PARENT_ACTIVITY'; activity: string }
  | { type: 'ADD_CUSTOM_WORKER'; text: string }
  | { type: 'REMOVE_CUSTOM_WORKER'; index: number }
  | { type: 'ADD_CUSTOM_PARENT'; text: string }
  | { type: 'REMOVE_CUSTOM_PARENT'; index: number }
  | { type: 'SET_FINAL_NOTE'; note: string }
  | { type: 'SET_CONFIRMED'; value: boolean }
  | { type: 'RESET_ALL' };
