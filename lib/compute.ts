import { Assessment, StatusKey, ChecklistSection, ActivitiesCategory } from '@/types';
import checklistData from '@/data/checklist.json';
import activitiesData from '@/data/activities.json';

const checklist = checklistData as any;
const activities = activitiesData as { categories: ActivitiesCategory[] };

const STATUS_WEIGHTS: Record<StatusKey, number> = {
  ZVLADA: 0,
  DOPOMOC: 1,
  NEZVLADA: 2,
};

export function getSectionsForBand(ageBandId: string): ChecklistSection[] {
  if (ageBandId === '3-4') return checklist.age_bands['3-4'] as ChecklistSection[];
  if (ageBandId === '5-6') return checklist.age_bands['5-6'] as ChecklistSection[];
  return [];
}

export interface SectionScore {
  section: ChecklistSection;
  answered: number;
  total: number;
  zvlada: number;
  zvladaPct: number; // percentage of answered items that are ZVLADA
  score: number;
}

export interface ComputedResults {
  sectionScores: SectionScore[];
  strengths: Array<{ id: string; text: string; sectionTitle: string }>;
  reserves: Array<{ id: string; text: string; sectionTitle: string; status: StatusKey }>;
  prioritySections: Array<{
    section: ChecklistSection;
    score: number;
    workerActivities: string[];
    parentActivities: string[];
  }>;
  summaryText: string;
  totalAnswered: number;
  totalItems: number;
}

export function computeResults(state: Assessment): ComputedResults {
  const sections = getSectionsForBand(state.ageBandId);
  const strengths: ComputedResults['strengths'] = [];
  const reserves: ComputedResults['reserves'] = [];
  const sectionScores: SectionScore[] = [];

  let totalAnswered = 0;
  let totalItems = 0;

  for (const section of sections) {
    let score = 0;
    let answered = 0;
    let zvlada = 0;

    for (const item of section.items) {
      totalItems++;
      const status = state.statuses[item.id];
      if (!status) continue;
      answered++;
      totalAnswered++;

      const w = STATUS_WEIGHTS[status];
      score += w * section.category_weight;

      if (status === 'ZVLADA') {
        zvlada++;
        strengths.push({ id: item.id, text: item.text, sectionTitle: section.title });
      } else {
        reserves.push({ id: item.id, text: item.text, sectionTitle: section.title, status });
      }
    }

    const zvladaPct = answered > 0 ? (zvlada / answered) * 100 : 0;
    sectionScores.push({ section, answered, total: section.items.length, zvlada, zvladaPct, score });
  }

  const prioritySections = sectionScores
    .filter(s => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map(({ section, score }) => {
      const cat = activities.categories.find(c => c.id === section.id);
      return {
        section,
        score,
        workerActivities: cat ? cat.worker.slice(0, 2) : [],
        parentActivities: cat ? cat.parent.slice(0, 2) : [],
      };
    });

  const priorityNames = prioritySections.map(p => p.section.title);
  const summaryText = priorityNames.length > 0
    ? `Doporučujeme zaměřit se na: ${priorityNames.join(', ')}.`
    : 'Dítě si vede dobře ve všech oblastech. Pokračujte v podpoře.';

  return { sectionScores, strengths, reserves, prioritySections, summaryText, totalAnswered, totalItems };
}
