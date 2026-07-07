import {
  createSteps,
  mergeStepsWithChecklist,
  initializeChecklistTemplate,
} from '../steps';
import type { ChecklistItem } from '@/shared/types/api';

const staticSteps = createSteps();

describe('createSteps', () => {
  it('returns array of 4 steps', () => {
    const steps = createSteps();
    expect(steps).toHaveLength(4);
  });

  it('each step has id, title, description, link, time', () => {
    const steps = createSteps();
    steps.forEach(step => {
      expect(step).toHaveProperty('id');
      expect(step).toHaveProperty('title');
      expect(step).toHaveProperty('description');
      expect(step).toHaveProperty('link');
      expect(step).toHaveProperty('time');
    });
  });

  it('ids are sequential starting from 1', () => {
    const steps = createSteps();
    expect(steps.map(s => s.id)).toEqual([1, 2, 3, 4]);
  });
});

describe('mergeStepsWithChecklist', () => {
  it('merges static steps with API data', () => {
    const checklist: ChecklistItem[] = [
      {
        _id: '1',
        title: '',
        completed: true,
        status: 'completed',
        videoProgress: 0,
        completionDate: null,
      },
      {
        _id: '2',
        title: '',
        completed: false,
        status: 'in progress',
        videoProgress: 0,
        completionDate: null,
      },
    ];
    const result = mergeStepsWithChecklist(staticSteps, checklist);
    expect(result[0].completed).toBe(true);
    expect(result[0].status).toBe('completed');
    expect(result[1].completed).toBe(false);
    expect(result[1].status).toBe('in progress');
  });

  it('preserves static step properties', () => {
    const checklist: ChecklistItem[] = [
      {
        _id: '1',
        title: '',
        completed: true,
        status: 'completed',
        videoProgress: 0,
        completionDate: null,
      },
    ];
    const result = mergeStepsWithChecklist(staticSteps, checklist);
    expect(result[0].title).toBe(staticSteps[0].title);
    expect(result[0].description).toBe(staticSteps[0].description);
    expect(result[0].link).toBe(staticSteps[0].link);
    expect(result[0].time).toBe(staticSteps[0].time);
  });

  it('overrides completed/status from API data', () => {
    const checklist: ChecklistItem[] = [
      {
        _id: '1',
        title: '',
        completed: true,
        status: 'completed',
        videoProgress: 0,
        completionDate: null,
      },
      {
        _id: '2',
        title: '',
        completed: true,
        status: 'completed',
        videoProgress: 0,
        completionDate: null,
      },
      {
        _id: '3',
        title: '',
        completed: false,
        status: 'not started',
        videoProgress: 0,
        completionDate: null,
      },
      {
        _id: '4',
        title: '',
        completed: false,
        status: 'not started',
        videoProgress: 0,
        completionDate: null,
      },
    ];
    const result = mergeStepsWithChecklist(staticSteps, checklist);
    expect(result[0].completed).toBe(true);
    expect(result[0].status).toBe('completed');
    expect(result[2].completed).toBe(false);
    expect(result[2].status).toBe('not started');
  });

  it('returns original steps when checklist is null', () => {
    const result = mergeStepsWithChecklist(
      staticSteps,
      null as unknown as never
    );
    expect(result).toHaveLength(4);
    result.forEach(step => {
      expect(step.completed).toBe(false);
      expect(step.status).toBe('not started');
    });
  });

  it('returns original steps when checklist is empty array', () => {
    const result = mergeStepsWithChecklist(staticSteps, []);
    expect(result).toHaveLength(4);
    result.forEach(step => {
      expect(step.completed).toBe(false);
      expect(step.status).toBe('not started');
    });
  });

  it('normalizes inProgress status', () => {
    const checklist: ChecklistItem[] = [
      {
        _id: '1',
        title: '',
        completed: false,
        status: 'in progress',
        videoProgress: 0,
        completionDate: null,
      },
    ];
    const result = mergeStepsWithChecklist(staticSteps, checklist);
    expect(result[0].status).toBe('in progress');
  });

  it('normalizes notStarted status', () => {
    const checklist: ChecklistItem[] = [
      {
        _id: '1',
        title: '',
        completed: false,
        status: 'not started',
        videoProgress: 0,
        completionDate: null,
      },
    ];
    const result = mergeStepsWithChecklist(staticSteps, checklist);
    expect(result[0].status).toBe('not started');
  });

  it('uses API title when provided and non-empty', () => {
    const checklist: ChecklistItem[] = [
      {
        _id: '1',
        title: 'Custom Title',
        completed: false,
        status: 'not started',
        videoProgress: 0,
        completionDate: null,
      },
    ];
    const result = mergeStepsWithChecklist(staticSteps, checklist);
    expect(result[0].title).toBe('Custom Title');
  });

  it('falls back to static title when API title is empty', () => {
    const checklist: ChecklistItem[] = [
      {
        _id: '1',
        title: '  ',
        completed: false,
        status: 'not started',
        videoProgress: 0,
        completionDate: null,
      },
    ];
    const result = mergeStepsWithChecklist(staticSteps, checklist);
    expect(result[0].title).toBe(staticSteps[0].title);
  });

  it('normalizes started status', () => {
    const checklist: ChecklistItem[] = [
      {
        _id: '1',
        title: '',
        completed: false,
        status: 'started',
        videoProgress: 0,
        completionDate: null,
      },
    ];
    const result = mergeStepsWithChecklist(staticSteps, checklist);
    expect(result[0].status).toBe('started');
  });
});

describe('initializeChecklistTemplate', () => {
  it('returns a template item for each static step', () => {
    const template = initializeChecklistTemplate();
    expect(template).toHaveLength(4);
  });

  it('maps static step fields to template fields', () => {
    const template = initializeChecklistTemplate();
    const first = template[0];
    expect(first.id).toBe(1);
    expect(first.taskId).toBe(1);
    expect(first.title).toBe(staticSteps[0].title);
    expect(first.completed).toBe(false);
    expect(first.status).toBe('not started');
    expect(first.videoProgress).toBe(0);
    expect(first.completionDate).toBeNull();
    expect(first.link).toBe(staticSteps[0].link);
    expect(first.time).toBe(staticSteps[0].time);
    expect(first.isExternal).toBe(staticSteps[0].isExternal);
  });
});
