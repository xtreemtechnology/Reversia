export const MEAL_WINDOWS = [
  { id: 'breakfast', label: 'Breakfast', start: 5,  end: 10 },
  { id: 'lunch',     label: 'Lunch',     start: 11, end: 14 },
  { id: 'snack',     label: 'Snack',     start: 14, end: 17 },
  { id: 'dinner',    label: 'Dinner',    start: 17, end: 22 },
];

export function detectMeal(date = new Date()){
  const h = date.getHours();
  const found = MEAL_WINDOWS.find(w => h >= w.start && h < w.end);
  return found ? found.id : 'other';
}

export const MEAL_LABELS = MEAL_WINDOWS.reduce((acc, w) => (acc[w.id] = w.label, acc), { other: 'Other' });
