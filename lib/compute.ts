import { Assessment, StatusKey, ChecklistSection, ActivitiesCategory } from '@/types';
import checklistData from '@/data/checklist.json';
import activitiesData from '@/data/activities.json';

const checklist = checklistData as { sections: ChecklistSection[] };
const activities = activitiesData as { categories: ActivitiesCategory[] };

const STATUS_WEIGHTS: Record<StatusKey, number> = {
  CAN_DO: 0,
  WITH_HELP: 1,
  CANNOT: 2,
  NOT_TESTED: 0.5,
  NOT_INTERESTED: 0.5,
};

const BAND_MIDPOINTS: Record<string, number> = {
  '3-4': 3.5,
  '4-5': 4.5,
  '5-6': 5.5,
};

export interface ComputedResults {
  childAge: number;
  strengths: Array<{ id: string; text: string; bonus: boolean }>;
  reserves: Array<{ id: string; text: string; sectionTitle: string }>;
  prioritySections: Array<{
    section: ChecklistSection;
    score: number;
    workerActivities: string[];
    parentActivities: string[];
  }>;
  summaryText: string;
}

export function computeResults(state: Assessment): ComputedResults {
  const childAge = BAND_MIDPOINTS[state.ageBandId] ?? 3.5;
  const strengths: ComputedResults['strengths'] = [];
  const reserves: ComputedResults['reserves'] = [];

  // Compute section scores
  const sectionScores: { section: ChecklistSection; score: number }[] = [];

  for (const section of checklist.sections) {
    let sectionScore = 0;
    for (const item of section.items) {
      const status = state.statuses[item.id];
      if (!status) continue;
      const statusWeight = STATUS_WEIGHTS[status];
      const ageRelevance = childAge >= item.expected_age ? 1 : 0.3;
      sectionScore += statusWeight * ageRelevance * section.category_weight;

      // Strengths
      if (status === 'CAN_DO') {
        const bonus = childAge < item.expected_age;
        strengths.push({ id: item.id, text: item.text, bonus });
      }

      // Reserves
      if ((status === 'WITH_HELP' || status === 'CANNOT') && childAge >= item.expected_age) {
        reserves.push({ id: item.id, text: item.text, sectionTitle: section.title });
      }
    }
    sectionScores.push({ section, score: sectionScore });
  }

  // Priority sections: top 3 with score > 0
  const prioritySections = sectionScores
    .filter(s => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map(({ section, score }) => {
      const cat = activities.categories.find(c => c.id === section.id);
      const workerActivities = cat ? cat.worker.slice(0, 2) : [];
      const parentActivities = cat ? cat.parent.slice(0, 2) : [];
      return { section, score, workerActivities, parentActivities };
    });

  // Summary text
  const priorityNames = prioritySections.map(p => p.section.title);
  const summaryText = priorityNames.length > 0
    ? `Doporučujeme zaměřit se na: ${priorityNames.join(', ')}.`
    : 'Dítě si vede dobře ve všech oblastech. Pokračujte v podpoře.';

  return { childAge, strengths, reserves, prioritySections, summaryText };
}
