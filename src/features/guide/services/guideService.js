// src/features/guide/services/guideService.js
//
// The Reversia Guide's answering engine — the companion Daniel had before
// (the scrapped AIGuideModal bottom sheet) brought back as a full screen.
//
// It answers from the app's own data first, so it works fully with no API
// key at all:
//   - food questions → the Natural Food Guide (rating, carb band, tip, swap)
//   - "what should I eat?" → today's meals from the 7-day meal plan
//   - "check my sugar" → the user's recent glucose logs
//   - "plan my week" → the Reversal Plan's current week, phase and milestone
//   - water questions → today's logged water vs the 8-glass goal
//
// When EXPO_PUBLIC_OPENAI_API_KEY is set, the same questions are offered
// to OpenAI (gpt-4o-mini, the old modal's model and system prompt) and the
// local answer is the fallback if that call fails. No key is ever
// hardcoded and no key is required.
//
// Pure helpers only (no navigation, no Firestore), so they are safe to
// use in Jest tests.

import { FOOD_GUIDE } from "../../food-guide/data/foodGuideData";
import { getFoodById } from "../../food-guide/services/foodGuideService";
import { getDayPlan } from "../../meal-plan/services/mealPlanService";
import { SLOT_LABELS } from "../../meal-plan/data/mealPlanData";
import { PLAN_LENGTH_WEEKS } from "../../reversal/data/planData";
import {
  getPhaseForWeek,
  getNextMilestone,
  calculateProgress,
} from "../../reversal/services/reversalService";
import { toMgdl, toDate } from "../../insights/services/foodSugarService";

export const GUIDE_SYSTEM_PROMPT =
  "You are Reversia: provide concise, culturally-aware meal guidance for Nigerian foods. Keep answers short and actionable.";

export const GUIDE_CHIPS = [
  "Is this food safe?",
  "What should I eat?",
  "Check my sugar",
  "Plan my week",
];

// The same short safety note every feature in the app carries.
export const GUIDE_SAFETY_LINE =
  "This is general guidance from your own logs and the Food Guide — not medical advice, and it doesn't replace your doctor.";

const WATER_GOAL_GLASSES = 8;

function normalize(text) {
  return (text || "").toLowerCase();
}

function words(text) {
  return normalize(text)
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((word) => word.length >= 3);
}

/**
 * Foods from the guide mentioned in a question, best match first.
 * Scores a full-name match highest, then an alias, then shared words.
 */
export function findFoodsInQuestion(question) {
  const q = normalize(question);
  const qWords = new Set(words(question));
  return FOOD_GUIDE.map((food) => {
    let score = 0;
    if (q.includes(normalize(food.name))) score += 10;
    (food.aliases || []).forEach((alias) => {
      const aliasNorm = normalize(alias);
      if (qWords.has(aliasNorm) || q.includes(aliasNorm)) score += 5;
    });
    words(food.name).forEach((word) => {
      if (qWords.has(word)) score += 2;
    });
    words(food.id.replace(/-/g, " ")).forEach((word) => {
      if (qWords.has(word)) score += 1;
    });
    return { food, score };
  })
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score || a.food.name.localeCompare(b.food.name))
    .map((entry) => entry.food);
}

function foodAnswer(food, others = []) {
  const ratingWord =
    food.rating === "safe"
      ? "Safe"
      : food.rating === "caution"
      ? "Caution"
      : "Avoid";
  const lines = [
    `${food.name} — ${ratingWord}.`,
    `Carb load: ${food.load} (${food.carbs} per ${food.amount}).`,
  ];
  if (food.tip) lines.push(food.tip);
  if (food.swapTo) {
    const swap = getFoodById(food.swapTo);
    if (swap) lines.push(`Swap: try ${swap.name} instead.`);
  }
  if (others.length > 0) {
    lines.push(
      `I also spotted ${others
        .map((item) => item.name)
        .join(", ")} — ask me about one of them for the detail.`
    );
  }
  return lines.join("\n");
}

function foodSafetyPrompt() {
  return [
    "Tell me which food — for example, try “Is beans safe?” or “Can I eat jollof rice?”",
    "Safe everyday choices in the guide include Beans (Ewa), Moi Moi, vegetable soup and grilled fish.",
  ].join("\n");
}

function mealsAnswer(now) {
  const planDay = ((now.getDay() + 6) % 7) + 1;
  const dayPlan = getDayPlan(planDay);
  if (!dayPlan) {
    return "I couldn't find today's meals in the 7-day plan. Open the Plan tab to see the full week.";
  }
  const lines = [`Today is Day ${dayPlan.day} — ${dayPlan.title}.`];
  dayPlan.meals.forEach((meal) => {
    lines.push(`${SLOT_LABELS[meal.slot] || meal.slot}: ${meal.title}.`);
  });
  return lines.join("\n");
}

function glucoseAnswer(logs, now) {
  const readings = (logs || []).filter((log) => log?.category === "glucose");
  if (readings.length === 0) {
    return "You haven't logged a glucose reading yet. Log one from the Track tab and I'll summarise it here.";
  }
  const latest = readings[0];
  const latestMgdl = Math.round(toMgdl(latest.value, latest.unit));
  const when = toDate(latest.createdAt);
  const whenText = when
    ? when.toLocaleDateString([], { weekday: "short" }) +
      " " +
      when.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })
    : "recently";
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const weekReadings = readings.filter((reading) => {
    const date = toDate(reading.createdAt);
    return date && date >= weekAgo;
  });
  const average =
    weekReadings.length > 0
      ? Math.round(
          weekReadings.reduce(
            (sum, reading) => sum + toMgdl(reading.value, reading.unit),
            0
          ) / weekReadings.length
        )
      : null;
  const todayCount = readings.filter((reading) => {
    const date = toDate(reading.createdAt);
    return date && date.toDateString() === now.toDateString();
  }).length;

  const lines = [
    `Your latest reading is ${latestMgdl} mg/dL (${whenText})${
      latest.context ? `, ${latest.context}` : ""
    }.`,
  ];
  if (average !== null) {
    lines.push(
      `Your 7-day average is ${average} mg/dL across ${
        weekReadings.length
      } reading${weekReadings.length === 1 ? "" : "s"}.`
    );
  }
  lines.push(
    todayCount > 0
      ? `You've logged ${todayCount} reading${
          todayCount === 1 ? "" : "s"
        } today.`
      : "You haven't logged a reading today yet."
  );
  return lines.join("\n");
}

function planAnswer(plan, now) {
  if (!plan?.startDate) {
    return [
      "You haven't started the 12-week Reversal Plan yet.",
      "It runs in four phases — Reset, Rebuild, Steady, Sustain — with natural food, small habits and a weekly check-in.",
      "Open the Plan tab and start it when you're ready.",
    ].join("\n");
  }
  const progress = calculateProgress(plan.startDate, now);
  const phase = getPhaseForWeek(progress.week);
  const next = getNextMilestone(progress.week);
  const lines = [
    `You're on week ${progress.week} of ${PLAN_LENGTH_WEEKS}${
      phase ? ` — the ${phase.title} phase` : ""
    }.`,
  ];
  if (phase) lines.push(`This week's focus: ${phase.focus}`);
  if (next) {
    lines.push(
      `Next milestone: ${next.title} (week ${next.week}) — ${next.description}`
    );
  } else {
    lines.push(
      "Final week — take your logs to your doctor and agree on the next steps together."
    );
  }
  return lines.join("\n");
}

function waterAnswer(logs, now) {
  const todayStr = now.toDateString();
  const glasses = (logs || [])
    .filter((log) => {
      const date = toDate(log?.createdAt);
      return (
        date &&
        date.toDateString() === todayStr &&
        (log?.category === "water" || log?.category === "hydration")
      );
    })
    .reduce((sum, log) => {
      if (typeof log?.glasses === "number") return sum + log.glasses;
      if (typeof log?.liters === "number")
        return sum + Math.max(1, Math.round(log.liters / 0.25));
      return sum + 1;
    }, 0);
  if (glasses === 0) {
    return `You haven't logged any water today yet — the daily goal is ${WATER_GOAL_GLASSES} glasses.`;
  }
  return glasses >= WATER_GOAL_GLASSES
    ? `You've logged ${glasses} glasses of water today — goal reached. Well done.`
    : `You've logged ${glasses} of ${WATER_GOAL_GLASSES} glasses of water today — ${
        WATER_GOAL_GLASSES - glasses
      } more to reach the goal.`;
}

function fallbackAnswer() {
  return [
    "I can help with three things right now:",
    "• A food — ask “Is beans safe?” or “Can I eat jollof rice?” and I'll check the Food Guide.",
    "• Today's meals — ask “What should I eat?” for today's plan.",
    "• Your sugar or your plan — ask “Check my sugar” or “Plan my week” and I'll read your own logs.",
  ].join("\n");
}

/**
 * Answer a question from the app's own data. Returns
 * { text, topic } where topic is one of
 * food | meals | sugar | plan | water | general.
 * Every answer ends with the safety line.
 */
export function answerLocally(question, context = {}) {
  const { logs = [], plan = null, now = new Date() } = context;
  const q = normalize(question);
  const foods = findFoodsInQuestion(question);

  // Intent first: "what should I eat" and "how much water" are questions
  // about today's meals and water, even though "water" is also a food in
  // the guide and "eat" appears in food-safety phrasing. Only then fall
  // through to food matches, the food-safety prompt, and sugar.
  let text;
  let topic;
  if (
    /what should i eat|what to eat|eat today|hungry|meal.*today|today.*meal/.test(
      q
    )
  ) {
    text = mealsAnswer(now);
    topic = "meals";
  } else if (
    /how much water|glasses.*water|water.*today|drank|drunk|hydrat|thirst/.test(
      q
    )
  ) {
    text = waterAnswer(logs, now);
    topic = "water";
  } else if (/plan|week|milestone|phase/.test(q)) {
    text = planAnswer(plan, now);
    topic = "plan";
  } else if (foods.length > 0) {
    text = foodAnswer(foods[0], foods.slice(1, 3));
    topic = "food";
  } else if (/is .* safe|can i eat|should i eat|is .* ok|is .* okay/.test(q)) {
    text = foodSafetyPrompt();
    topic = "food";
  } else if (/sugar|glucose|reading/.test(q)) {
    text = glucoseAnswer(logs, now);
    topic = "sugar";
  } else {
    text = fallbackAnswer();
    topic = "general";
  }

  return { text: `${text}\n\n${GUIDE_SAFETY_LINE}`, topic };
}

async function fetchOpenAIResponse(question) {
  const key = process.env.EXPO_PUBLIC_OPENAI_API_KEY;
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: GUIDE_SYSTEM_PROMPT },
        { role: "user", content: question },
      ],
      max_tokens: 250,
      temperature: 0.6,
    }),
  });
  const json = await res.json();
  return json?.choices?.[0]?.message?.content || null;
}

/**
 * Ask the Guide. Uses OpenAI when EXPO_PUBLIC_OPENAI_API_KEY is set and
 * the call succeeds; otherwise (and always, when no key is set) answers
 * from the app's own data. Returns { text, source, topic }.
 */
export async function askGuide(question, context = {}) {
  const key = process.env.EXPO_PUBLIC_OPENAI_API_KEY;
  if (key) {
    try {
      const text = await fetchOpenAIResponse(question);
      if (text) {
        return {
          text: `${text}\n\n${GUIDE_SAFETY_LINE}`,
          source: "openai",
          topic: "general",
        };
      }
    } catch (err) {
      console.warn("Guide OpenAI fetch failed, using local answers", err);
    }
  }
  return { ...answerLocally(question, context), source: "local" };
}
