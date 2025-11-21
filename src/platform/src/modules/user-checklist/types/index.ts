// Re-export shared types to maintain consistency
export type {
  UpdateChecklistItem,
  ChecklistItem,
  UserChecklist,
} from '../../../shared/types/api';

// Extended types for internal use
export interface ChecklistStepItem {
  _id?: string | null; // Can be null for uninitialized items
  id: number;
  title: string;
  label?: string;
  description: string;
  completed: boolean;
  status: 'not started' | 'in progress' | 'completed' | 'started';
  link: string;
  time: string;
  isExternal?: boolean;
  videoProgress?: number;
  completionDate?: string | null;
}
