// src/features/meal-plan/data/mealPlanData.js
//
// 7-day meal plan, step 3 of the Reversal Plan follow-ups, after the
// 12-week Reversal Plan (PR #3) and the Natural Food Guide (PR #4).
// Every meal is built only from foods in
// src/features/food-guide/data/foodGuideData.js, referenced by id:
// safe foods are the base, caution foods appear only in a modest portion
// or paired with a safe food, and no avoid food (malt, Chapman, Fanta,
// Coke) is used anywhere. Ingredients are written with consistent
// wording and quantities so the weekly shopping list can group them.
//
// Carb notes ("low" / "medium") follow the foods used: "low" only when
// every food in the meal is low carb-load in the guide, "medium" when
// any food is medium or high load. They are a simple guide from the
// food data — NOT measured glycaemic index values. This is general
// wellness guidance, not medical advice: it does not replace medical
// care and never promises a cure. Anyone on insulin or glucose-lowering
// medicine should talk to their doctor before changing food or activity.

export const MEAL_SLOTS = ["breakfast", "lunch", "dinner", "snack"];

export const SLOT_LABELS = {
  breakfast: "Breakfast",
  lunch: "Lunch",
  dinner: "Dinner",
  snack: "Snack",
};

// One entry per day. Each day has breakfast, lunch and dinner, plus an
// optional snack where it fits naturally (Days 1, 3 and 5). No meal
// repeats on another day.
export const MEAL_PLAN = [
  {
    day: 1,
    title: "Start with beans & soup",
    meals: [
      {
        id: "d1-breakfast",
        day: 1,
        slot: "breakfast",
        title: "Oats & Boiled Eggs",
        foodIds: ["oatmeal", "boiled-egg"],
        description:
          "Plain oats with two boiled eggs — protein and fibre to start the day steady, with no added sugar.",
        ingredients: [
          "Oats (1 cup)",
          "Boiled eggs (2 large)",
          "Water (1 glass)",
        ],
        steps: [
          "Boil the eggs for 10 minutes, then peel them.",
          "Cook the oats in water until soft — no sugar, no honey.",
          "Serve the oats with the eggs and a glass of water.",
        ],
        prepTime: 10,
        carbNote: "medium",
        tip: "Keep the oats plain. Sweetened oats or honey turn a steady breakfast into a sugary one.",
      },
      {
        id: "d1-lunch",
        day: 1,
        slot: "lunch",
        title: "Beans Porridge & Chicken Stew",
        foodIds: ["beans-ewa", "chicken-stew"],
        description:
          "The plan's week 4 staple: beans with chicken stew. High protein and fibre for its carbs.",
        ingredients: [
          "Beans (1 cup)",
          "Chicken stew (1 serving)",
          "Water (1 glass)",
        ],
        steps: [
          "Cook the beans until soft, with onions and pepper.",
          "Warm the chicken stew and skim off extra oil.",
          "Serve one cup of beans with the stew and water.",
        ],
        prepTime: 35,
        carbNote: "medium",
        tip: "Beans are your friend in this plan — the protein and fibre slow the carbs down.",
      },
      {
        id: "d1-dinner",
        day: 1,
        slot: "dinner",
        title: "Pepper Soup",
        foodIds: ["pepper-soup", "water"],
        description:
          "A light, high-protein bowl to end the day — fish or meat pepper soup with water.",
        ingredients: ["Pepper soup (1 bowl)", "Water (1 glass)"],
        steps: [
          "Simmer fish or meat with pepper, onions and seasoning.",
          "Cook until the meat is tender and the soup is fragrant.",
          "Serve one bowl, with water instead of a soft drink.",
        ],
        prepTime: 25,
        carbNote: "low",
        tip: "A light evening meal. If you are still hungry, add vegetables rather than a second bowl.",
      },
      {
        id: "d1-snack",
        day: 1,
        slot: "snack",
        title: "Banana & Water",
        foodIds: ["banana", "water"],
        description:
          "One medium banana with a glass of water — a natural snack, best after a meal rather than alone.",
        ingredients: ["Banana (1 medium)", "Water (1 glass)"],
        steps: [
          "Choose one medium banana — not two or three.",
          "Peel the banana.",
          "Eat it with a glass of water.",
        ],
        prepTime: 2,
        carbNote: "medium",
        tip: "One banana, not two or three. Pairing it with water and eating it after a meal is steadier than snacking on it alone.",
      },
    ],
  },
  {
    day: 2,
    title: "Boiled, not fried",
    meals: [
      {
        id: "d2-breakfast",
        day: 2,
        slot: "breakfast",
        title: "Moi Moi & Boiled Egg",
        foodIds: ["moi-moi", "boiled-egg"],
        description:
          "Steamed beans with a boiled egg — the plan's natural protein for breakfast, not fried akara.",
        ingredients: [
          "Moi moi (1 wrap)",
          "Boiled eggs (2 large)",
          "Water (1 glass)",
        ],
        steps: [
          "Boil the eggs for 10 minutes, then peel them.",
          "Warm the moi moi wrap.",
          "Serve together with a glass of water.",
        ],
        prepTime: 12,
        carbNote: "medium",
        tip: "Moi moi is the steadier version of akara — same beans, steamed instead of fried.",
      },
      {
        id: "d2-lunch",
        day: 2,
        slot: "lunch",
        title: "Boiled Yam & Egusi Soup",
        foodIds: ["boiled-yam", "egusi-soup"],
        description:
          "One slice of boiled yam with egusi soup. Boiled beats fried or pounded yam, and the soup adds protein.",
        ingredients: [
          "Boiled yam (1 slice)",
          "Egusi soup (1 bowl)",
          "Water (1 glass)",
        ],
        steps: [
          "Boil the yam until soft and slice one piece.",
          "Warm the egusi soup.",
          "Serve the yam with the soup and water — one slice, not a big portion.",
        ],
        prepTime: 30,
        carbNote: "medium",
        tip: "One slice of yam with a full bowl of soup is steadier than a big portion of yam alone.",
      },
      {
        id: "d2-dinner",
        day: 2,
        slot: "dinner",
        title: "Grilled Chicken & Tomato Stew",
        foodIds: ["grilled-chicken", "tomato-stew"],
        description:
          "Grilled chicken with tomato stew and vegetables — almost no carbs, plenty of protein.",
        ingredients: [
          "Grilled chicken (100g)",
          "Tomato stew (1 serving)",
          "Water (1 glass)",
        ],
        steps: [
          "Grill the chicken — grilled, not fried.",
          "Warm the tomato stew.",
          "Serve with vegetables on the side and a glass of water.",
        ],
        prepTime: 20,
        carbNote: "low",
        tip: "Grilled chicken is the plan's preferred way to cook meat. Watch the oil in the stew.",
      },
    ],
  },
  {
    day: 3,
    title: "Small rice, more beans",
    meals: [
      {
        id: "d3-breakfast",
        day: 3,
        slot: "breakfast",
        title: "Boiled Eggs & Tomato Stew",
        foodIds: ["boiled-egg", "tomato-stew"],
        description:
          "A light, low-carb breakfast: boiled eggs with tomato stew and water.",
        ingredients: [
          "Boiled eggs (2 large)",
          "Tomato stew (1 serving)",
          "Water (1 glass)",
        ],
        steps: [
          "Boil the eggs for 10 minutes, then peel them.",
          "Warm the tomato stew.",
          "Serve the eggs with the stew and water.",
        ],
        prepTime: 12,
        carbNote: "low",
        tip: "Eggs have almost no carbs, so this is a good morning when yesterday was a heavier day.",
      },
      {
        id: "d3-lunch",
        day: 3,
        slot: "lunch",
        title: "Ofada Rice & Beans",
        foodIds: ["ofada-rice", "beans-ewa"],
        description:
          "A small cup of ofada rice with a full cup of beans — the beans do most of the work.",
        ingredients: [
          "Ofada rice (1 small cup)",
          "Beans (1 cup)",
          "Water (1 glass)",
        ],
        steps: [
          "Cook the ofada rice and the beans separately.",
          "Serve a small cup of rice with a full cup of beans.",
          "Add vegetables on the side and drink water.",
        ],
        prepTime: 40,
        carbNote: "medium",
        tip: "Ofada is the plan's better rice, but it is still 66g carbs a cup — keep the cup small and let the beans fill the plate.",
      },
      {
        id: "d3-dinner",
        day: 3,
        slot: "dinner",
        title: "Bitter Leaf Soup & Wheat Wrap",
        foodIds: ["bitter-leaf-soup", "wheat-meal"],
        description:
          "Vegetable soup with a small wheat wrap — the plan's better swallow, kept small.",
        ingredients: [
          "Bitter leaf soup (1 bowl)",
          "Wheat meal (1 small wrap)",
          "Water (1 glass)",
        ],
        steps: [
          "Warm the bitter leaf soup.",
          "Mould a small wheat wrap — smaller than usual.",
          "Serve the soup with the wrap and water.",
        ],
        prepTime: 15,
        carbNote: "medium",
        tip: "Wheat meal has more protein than eba, but it is still a large carb portion. Keep the wrap small and load the soup with vegetables.",
      },
      {
        id: "d3-snack",
        day: 3,
        slot: "snack",
        title: "Unsweetened Zobo",
        foodIds: ["zobo"],
        description:
          "A small glass of unsweetened zobo — the plan's drink, with no sugar added.",
        ingredients: ["Zobo, unsweetened (1 small glass)"],
        steps: [
          "Brew the zobo and let it cool.",
          "Pour one small glass.",
          "Drink it with no sugar added.",
        ],
        prepTime: 5,
        carbNote: "low",
        tip: "The plan means unsweetened zobo. Sweetened zobo is a caution, not a free drink — and water is always the safest choice.",
      },
    ],
  },
  {
    day: 4,
    title: "Soup & a small wrap",
    meals: [
      {
        id: "d4-breakfast",
        day: 4,
        slot: "breakfast",
        title: "Boiled Plantain & Eggs",
        foodIds: ["boiled-plantain", "boiled-egg"],
        description:
          "Boiled plantain with boiled eggs — the plan's swap for fried plantain (dodo), with protein alongside.",
        ingredients: [
          "Boiled plantain (1 medium)",
          "Boiled eggs (2 large)",
          "Water (1 glass)",
        ],
        steps: [
          "Boil the plantain until soft.",
          "Boil the eggs for 10 minutes, then peel them.",
          "Serve one plantain with the eggs and water.",
        ],
        prepTime: 15,
        carbNote: "medium",
        tip: "Boiled plantain instead of fried dodo — same food, no frying oil, steadier portion.",
      },
      {
        id: "d4-lunch",
        day: 4,
        slot: "lunch",
        title: "Yam Porridge & Chicken Stew",
        foodIds: ["yam-porridge", "chicken-stew"],
        description:
          "Yam porridge (asaro) with chicken stew — mostly yam, so the chicken and vegetables matter.",
        ingredients: [
          "Yam porridge (1 bowl)",
          "Chicken stew (1 serving)",
          "Water (1 glass)",
        ],
        steps: [
          "Cook the yam porridge with onions, pepper and a little palm oil.",
          "Warm the chicken stew and skim off extra oil.",
          "Serve one bowl of porridge with the stew and water.",
        ],
        prepTime: 35,
        carbNote: "medium",
        tip: "Yam porridge is mostly carbs, so adding chicken to the bowl makes it steadier than porridge alone.",
      },
      {
        id: "d4-dinner",
        day: 4,
        slot: "dinner",
        title: "Edikang Ikong & Wheat Wrap",
        foodIds: ["edikang-ikong", "wheat-meal"],
        description:
          "Vegetable-rich edikang ikong with a small wheat wrap — one of the best soup choices in the guide.",
        ingredients: [
          "Edikang ikong (1 bowl)",
          "Wheat meal (1 small wrap)",
          "Water (1 glass)",
        ],
        steps: [
          "Warm the edikang ikong.",
          "Mould a small wheat wrap.",
          "Serve the soup with the wrap and water.",
        ],
        prepTime: 15,
        carbNote: "medium",
        tip: "Edikang ikong is low carb and full of vegetables. The wrap is the carb here — keep it small.",
      },
    ],
  },
  {
    day: 5,
    title: "A little jollof, lots of beans",
    meals: [
      {
        id: "d5-breakfast",
        day: 5,
        slot: "breakfast",
        title: "Boiled Eggs & Suya",
        foodIds: ["boiled-egg", "suya"],
        description:
          "Boiled eggs with a stick of suya — low carb, high protein, and no cooking beyond the eggs.",
        ingredients: [
          "Boiled eggs (2 large)",
          "Suya (1 stick)",
          "Water (1 glass)",
        ],
        steps: [
          "Boil the eggs for 10 minutes, then peel them.",
          "Warm the suya stick.",
          "Serve together with a glass of water.",
        ],
        prepTime: 12,
        carbNote: "low",
        tip: "Go easy on the extra oil and salty spice mix on the suya.",
      },
      {
        id: "d5-lunch",
        day: 5,
        slot: "lunch",
        title: "Jollof Rice & Beans",
        foodIds: ["jollof-rice", "beans-ewa"],
        description:
          "A small portion of jollof with a full cup of beans and vegetables — never a full plate of jollof alone.",
        ingredients: [
          "Jollof rice (1 small cup)",
          "Beans (1 cup)",
          "Water (1 glass)",
        ],
        steps: [
          "Cook the jollof rice and the beans separately.",
          "Serve a small cup of jollof with a full cup of beans.",
          "Add vegetables on the side and drink water.",
        ],
        prepTime: 40,
        carbNote: "medium",
        tip: "The app's own meal analysis says to pair jollof with beans. A smaller portion with beans and vegetables is steadier than a full plate alone.",
      },
      {
        id: "d5-dinner",
        day: 5,
        slot: "dinner",
        title: "Okra Soup & Wheat Wrap",
        foodIds: ["okra-soup", "wheat-meal"],
        description:
          "Okra soup with a small wheat wrap — low carb and filling, and the draw of the soup helps a small wrap go further.",
        ingredients: [
          "Okra soup (1 bowl)",
          "Wheat meal (1 small wrap)",
          "Water (1 glass)",
        ],
        steps: [
          "Warm the okra soup.",
          "Mould a small wheat wrap.",
          "Serve the soup with the wrap and water.",
        ],
        prepTime: 15,
        carbNote: "medium",
        tip: "Okra soup is a good partner for a small portion of swallow — the soup does the filling, not the wrap.",
      },
      {
        id: "d5-snack",
        day: 5,
        slot: "snack",
        title: "Small Moi Moi",
        foodIds: ["moi-moi"],
        description:
          "A small wrap of moi moi on its own — steamed beans, a natural protein snack.",
        ingredients: ["Moi moi (1 small wrap)", "Water (1 glass)"],
        steps: [
          "Warm the small moi moi wrap.",
          "Let it cool for a minute before opening.",
          "Eat it with a glass of water.",
        ],
        prepTime: 5,
        carbNote: "medium",
        tip: "Moi moi is a good swap for fried akara when you want a bean snack.",
      },
    ],
  },
  {
    day: 6,
    title: "Small portions, big flavour",
    meals: [
      {
        id: "d6-breakfast",
        day: 6,
        slot: "breakfast",
        title: "Small Akara & Boiled Egg",
        foodIds: ["akara", "boiled-egg"],
        description:
          "A small portion of akara with a boiled egg — fried, so the portion stays small and the egg adds protein.",
        ingredients: [
          "Akara (3 small pieces)",
          "Boiled eggs (2 large)",
          "Water (1 glass)",
        ],
        steps: [
          "Boil the eggs for 10 minutes, then peel them.",
          "Fry a small batch of akara — three small pieces, not a full plate.",
          "Serve with the eggs and water.",
        ],
        prepTime: 20,
        carbNote: "medium",
        tip: "Akara is the same beans as moi moi, but fried — moi moi is the steadier version of the same food. Keep the akara portion small.",
      },
      {
        id: "d6-lunch",
        day: 6,
        slot: "lunch",
        title: "Basmati Rice & Chicken Stew",
        foodIds: ["basmati-rice", "chicken-stew"],
        description:
          "Half a cup of basmati rice with chicken stew and vegetables — lighter than jollof, still a big carb portion.",
        ingredients: [
          "Basmati rice (1/2 cup)",
          "Chicken stew (1 serving)",
          "Water (1 glass)",
        ],
        steps: [
          "Cook the basmati rice.",
          "Warm the chicken stew and skim off extra oil.",
          "Serve half a cup of rice with the stew, vegetables and water.",
        ],
        prepTime: 30,
        carbNote: "medium",
        tip: "Half a cup with vegetables and protein is steadier than a full cup of rice alone.",
      },
      {
        id: "d6-dinner",
        day: 6,
        slot: "dinner",
        title: "Afang Soup & Pounded Yam (small)",
        foodIds: ["afang-soup", "pounded-yam"],
        description:
          "Leafy afang soup with a small wrap of pounded yam — a small wrap, with plenty of soup.",
        ingredients: [
          "Afang soup (1 bowl)",
          "Pounded yam (1 small wrap)",
          "Water (1 glass)",
        ],
        steps: [
          "Warm the afang soup.",
          "Mould a small pounded yam wrap — smaller than usual.",
          "Serve the soup with the wrap and water.",
        ],
        prepTime: 20,
        carbNote: "medium",
        tip: "Pounded yam is 68g carbs a wrap with almost no protein. Wheat meal is the plan's steadier swap — and a smaller wrap with plenty of soup helps either way.",
      },
    ],
  },
  {
    day: 7,
    title: "Finish the week steady",
    meals: [
      {
        id: "d7-breakfast",
        day: 7,
        slot: "breakfast",
        title: "Oatmeal & Banana",
        foodIds: ["oatmeal", "banana"],
        description:
          "Plain oats with one medium banana — a natural breakfast, with the banana counted, not doubled.",
        ingredients: [
          "Oats (1 cup)",
          "Banana (1 medium)",
          "Water (1 glass)",
        ],
        steps: [
          "Cook the oats in water until soft — no sugar, no honey.",
          "Slice one medium banana over the oats.",
          "Serve with a glass of water.",
        ],
        prepTime: 10,
        carbNote: "medium",
        tip: "One banana, not two or three — and better with the oats after a meal pattern than alone.",
      },
      {
        id: "d7-lunch",
        day: 7,
        slot: "lunch",
        title: "Fried Rice & Grilled Chicken",
        foodIds: ["fried-rice", "grilled-chicken"],
        description:
          "A small cup of fried rice with grilled chicken — fried and carb-heavy, so the portion stays small.",
        ingredients: [
          "Fried rice (1 small cup)",
          "Grilled chicken (100g)",
          "Water (1 glass)",
        ],
        steps: [
          "Cook the fried rice with vegetables.",
          "Grill the chicken — grilled, not fried.",
          "Serve a small cup of rice with the chicken and water.",
        ],
        prepTime: 35,
        carbNote: "medium",
        tip: "Ofada rice with vegetables is the plan's closer swap for fried rice; beans is steadier still.",
      },
      {
        id: "d7-dinner",
        day: 7,
        slot: "dinner",
        title: "Oha Soup & Semovita (small)",
        foodIds: ["oha-soup", "semovita"],
        description:
          "Leafy oha soup with a small semovita wrap to close the week — a small wrap, with plenty of soup.",
        ingredients: [
          "Oha soup (1 bowl)",
          "Semovita (1 small wrap)",
          "Water (1 glass)",
        ],
        steps: [
          "Warm the oha soup.",
          "Mould a small semovita wrap — smaller than usual.",
          "Serve the soup with the wrap and water.",
        ],
        prepTime: 20,
        carbNote: "medium",
        tip: "Semovita has a little more protein than eba, but it is still 65g carbs a wrap. Wheat meal is the plan's steadier swap.",
      },
    ],
  },
];

export const MEAL_PLAN_DISCLAIMER =
  "Reversia is a wellness guide that supports healthy eating and daily habits. It does not replace medical care, and it does not promise a cure or guaranteed remission. Carb notes here are a simple guide from the foods' carbs, protein and preparation — not measured glycaemic index values — and your own blood sugar response may differ. Always talk to your doctor before changing your medication or diet, especially if you take insulin or other glucose-lowering medicine.";
