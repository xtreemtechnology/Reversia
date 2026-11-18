// src/features/reversal/data/planData.js
//
// Static content for the 12-week Reversal Plan.
// Pure data — no imports, no network, safe to use in Jest tests.
//
// The plan is general wellness guidance built around whole, natural foods.
// It is NOT medical advice and never promises a cure or guaranteed remission.

export const PLAN_LENGTH_WEEKS = 12;

export const PHASES = [
  {
    id: "reset",
    weeks: [1, 2, 3],
    title: "Reset",
    description:
      "Cut back on sugar and processed food so your blood sugar stops spiking after every meal.",
    focus: "Cut sugar, drink water, fill half your plate with vegetables.",
    habits: [
      "No sugary drinks — water or unsweetened zobo instead",
      "Half your plate vegetables at lunch and dinner",
      "Walk 10 minutes after your biggest meal",
    ],
  },
  {
    id: "rebuild",
    weeks: [4, 5, 6],
    title: "Rebuild",
    description:
      "Rebuild your meals around natural staples — beans, fish, eggs, vegetables and whole grains.",
    focus: "Natural staples first, fried food less often, protein at every meal.",
    habits: [
      "Swap white rice for beans, ofada rice or oats most days",
      "Eat a natural protein at every meal — beans, fish, eggs or moi moi",
      "Boiled or grilled instead of fried — boiled plantain, grilled fish",
    ],
  },
  {
    id: "steady",
    weeks: [7, 8, 9],
    title: "Steady",
    description:
      "Make the new habits automatic so you do not have to think about every meal.",
    focus: "Plan ahead, keep moving, log every day.",
    habits: [
      "Plan 3 natural meals ahead each week",
      "Cook at home 5 days a week",
      "Walk 30 minutes most days",
    ],
  },
  {
    id: "sustain",
    weeks: [10, 11, 12],
    title: "Sustain",
    description:
      "Keep the habits for life and review your numbers with your doctor.",
    focus: "Review, keep your favourite natural meals, get family support.",
    habits: [
      "Review your HbA1c and fasting sugar with your doctor",
      "Keep your 3 favourite natural meals in regular rotation",
      "Share your progress with family so they support you",
    ],
  },
];

export const WEEKLY_GOALS = [
  {
    week: 1,
    title: "Cut the sugar",
    goals: [
      "No sugary drinks for 7 days — water or unsweetened zobo",
      "No added sugar in tea, pap or coffee",
      "Log every meal you eat",
    ],
    naturalFoodFocus: "Water, unsweetened zobo, vegetables with every meal.",
  },
  {
    week: 2,
    title: "Half plate vegetables",
    goals: [
      "Half your plate vegetables at lunch and dinner",
      "Eat one fruit a day — pawpaw, orange or garden eggs",
      "Walk 10 minutes after dinner",
    ],
    naturalFoodFocus: "Ugu, bitter leaf, okra, carrots, cabbage, garden eggs.",
  },
  {
    week: 3,
    title: "First check-in",
    goals: [
      "Log your fasting sugar 3 times this week",
      "Compare it with your starting number",
      "Note which meals kept you steady",
    ],
    naturalFoodFocus: "Keep the week 1 and 2 habits going — nothing new to buy.",
  },
  {
    week: 4,
    title: "Beans are your friend",
    goals: [
      "Eat beans or moi moi at least 4 times this week",
      "Swap white rice for beans or ofada rice twice",
      "Drink water before each meal",
    ],
    naturalFoodFocus: "Beans, moi moi, akara (grilled or lightly fried), lentils.",
  },
  {
    week: 5,
    title: "Smarter swallows",
    goals: [
      "Choose wheat or unripe plantain swallow over eba twice",
      "Eat your soup with plenty of vegetables",
      "Stop eating when you feel full, not stuffed",
    ],
    naturalFoodFocus: "Wheat meal, unripe plantain swallow, vegetable soups.",
  },
  {
    week: 6,
    title: "Halfway check-in",
    goals: [
      "Log your fasting sugar 3 times this week",
      "Look back at your best and worst meals so far",
      "Pick one habit to keep and one to improve",
    ],
    naturalFoodFocus: "Your best natural meals from weeks 1 to 5, repeated.",
  },
  {
    week: 7,
    title: "Protein at every meal",
    goals: [
      "Add beans, fish, eggs or chicken to every meal",
      "Eat eggs or oats for breakfast 4 times",
      "Keep fried food to once this week",
    ],
    naturalFoodFocus: "Eggs, fish (mackerel, catfish), beans, groundnuts.",
  },
  {
    week: 8,
    title: "Move after meals",
    goals: [
      "Walk 10 minutes after every main meal",
      "Reach 30 minutes of walking on 5 days",
      "Stretch or dance for 10 minutes on 2 days",
    ],
    naturalFoodFocus: "No new food rule this week — let movement do the work.",
  },
  {
    week: 9,
    title: "Steady habits",
    goals: [
      "Plan 3 natural meals ahead for the week",
      "Cook at home 5 days this week",
      "Log your fasting sugar 3 times",
    ],
    naturalFoodFocus: "Your 3 favourite natural meals, cooked at home.",
  },
  {
    week: 10,
    title: "Cook more, eat out less",
    goals: [
      "Cook your own lunch 5 days this week",
      "Prepare a big pot of beans or soup on Sunday",
      "Carry water with you instead of buying soft drinks",
    ],
    naturalFoodFocus: "Batch cooking: beans, vegetable soup, grilled fish.",
  },
  {
    week: 11,
    title: "Sleep and stress",
    goals: [
      "Sleep 7 hours on 5 nights this week",
      "No heavy meal within 3 hours of bed",
      "Take 10 quiet minutes for yourself each day",
    ],
    naturalFoodFocus: "Light evening meals — soup, salad, boiled yam with fish.",
  },
  {
    week: 12,
    title: "Review with your clinician",
    goals: [
      "Book a check-up and take your logged numbers with you",
      "Ask your doctor about your HbA1c and fasting sugar",
      "Choose the 3 habits you will keep for life",
    ],
    naturalFoodFocus: "Everything you learned — your own natural food routine.",
  },
];

export const MILESTONES = [
  {
    week: 3,
    title: "First check-in",
    description: "Compare your fasting sugar with where you started.",
  },
  {
    week: 6,
    title: "Halfway there",
    description: "Six weeks of natural eating — review what worked best.",
  },
  {
    week: 9,
    title: "Steady habits",
    description: "Your new meals and walks should feel normal by now.",
  },
  {
    week: 12,
    title: "Review with your clinician",
    description:
      "Take your logs to your doctor and agree on the next steps together.",
  },
];

// Reuses the exact values and labels from post-onboarding, so a baseline
// saved during onboarding matches a baseline saved in the plan setup.
export const HBA1C_OPTIONS = [
  { value: "below_5_7", label: "Below 5.7% (normal)" },
  { value: "5_7_6_4", label: "5.7-6.4% (prediabetes)" },
  { value: "6_5_7", label: "6.5-7% (diabetes)" },
  { value: "7_8", label: "7-8% (needs attention)" },
  { value: "above_8", label: "Above 8% (high risk)" },
  { value: "unknown", label: "I don't know yet" },
];

export const FASTING_OPTIONS = [
  { value: "below_100", label: "Below 100 mg/dL (normal)" },
  { value: "100_125", label: "100-125 mg/dL (prediabetes)" },
  { value: "126_150", label: "126-150 mg/dL (diabetes)" },
  { value: "151_200", label: "151-200 mg/dL (needs attention)" },
  { value: "above_200", label: "Above 200 mg/dL (high risk)" },
  { value: "unknown", label: "I don't know yet" },
];

export const PRIMARY_GOAL_OPTIONS = [
  { value: "lower_fasting", label: "Lower my fasting sugar" },
  { value: "lower_hba1c", label: "Lower my HbA1c" },
  { value: "eat_natural", label: "Eat more natural foods" },
  { value: "feel_energized", label: "Feel more energized" },
];

export const SAFETY_NOTE =
  "If you take insulin or other glucose-lowering medicine, talk to your doctor before changing your food or activity — your dose may need adjusting as your sugar improves.";

export const REVERSAL_DISCLAIMER =
  "Reversia is a wellness guide that supports healthy eating and daily habits. It does not replace medical care, and it does not promise a cure or guaranteed remission. An HbA1c below 5.7% or fasting sugar below 100 mg/dL are goals to discuss with your clinician, not a diagnosis. Always talk to your doctor before changing your medication or diet, especially if you take insulin or other glucose-lowering medicine.";
