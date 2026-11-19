// src/__tests__/guideService.test.js
//
// Tests for the Reversia Guide's local answering engine (guideService).
// Pure-function tests only: fabricated logs and plan, no Firestore.

import {
  answerLocally,
  askGuide,
  findFoodsInQuestion,
  GUIDE_SAFETY_LINE,
} from "../features/guide/services/guideService";

const WEDNESDAY = new Date("2026-11-18T10:00:00Z"); // a Wednesday

const LOGS = [
  {
    id: "g1",
    category: "glucose",
    value: 118,
    unit: "mg/dL",
    context: "after breakfast",
    createdAt: "2026-11-18T08:30:00Z",
  },
  {
    id: "g2",
    category: "glucose",
    value: 142,
    unit: "mg/dL",
    context: "after lunch",
    createdAt: "2026-11-17T13:00:00Z",
  },
  {
    id: "m1",
    category: "meal",
    name: "Beans and vegetable soup",
    type: "lunch",
    createdAt: "2026-11-18T12:00:00Z",
  },
  {
    id: "w1",
    category: "water",
    glasses: 3,
    createdAt: "2026-11-18T09:00:00Z",
  },
  {
    id: "w2",
    category: "water",
    glasses: 2,
    createdAt: "2026-11-18T11:00:00Z",
  },
];

const PLAN = { startDate: "2026-11-02T08:00:00Z" }; // week 3 on Nov 18

describe("findFoodsInQuestion", () => {
  it("matches beans by name", () => {
    const found = findFoodsInQuestion("Is beans safe to eat?");
    expect(found.length).toBeGreaterThan(0);
    expect(found[0].id).toBe("beans-ewa");
  });

  it("matches jollof rice as the best match for a rice question", () => {
    const found = findFoodsInQuestion("Can I eat jollof rice?");
    expect(found[0].name).toMatch(/Jollof Rice/);
  });

  it("matches by alias (ewa)", () => {
    const found = findFoodsInQuestion("Is ewa okay for me?");
    expect(found[0].id).toBe("beans-ewa");
  });

  it("returns nothing when no food is mentioned", () => {
    expect(findFoodsInQuestion("What should I eat today?")).toEqual([]);
  });
});

describe("answerLocally", () => {
  it("answers a food question with its rating and tip", () => {
    const { text, topic } = answerLocally("Is beans safe?", {
      logs: LOGS,
      plan: PLAN,
      now: WEDNESDAY,
    });
    expect(topic).toBe("food");
    expect(text).toMatch(/Beans \(Ewa\)/);
    expect(text).toMatch(/Safe/);
  });

  it("rates jollof as caution", () => {
    const { text } = answerLocally("Can I eat jollof rice?", {
      logs: LOGS,
      plan: PLAN,
      now: WEDNESDAY,
    });
    expect(text).toMatch(/Caution/);
  });

  it("asks which food when the question names none", () => {
    const { text, topic } = answerLocally("Is this food safe?", {
      logs: LOGS,
      plan: PLAN,
      now: WEDNESDAY,
    });
    expect(topic).toBe("food");
    expect(text).toMatch(/which food/i);
  });

  it("answers what to eat from today's meal plan", () => {
    const { text, topic } = answerLocally("What should I eat today?", {
      logs: LOGS,
      plan: PLAN,
      now: WEDNESDAY,
    });
    expect(topic).toBe("meals");
    expect(text).toMatch(/Breakfast:/);
    expect(text).toMatch(/Lunch:/);
  });

  it("summarises recent glucose readings", () => {
    const { text, topic } = answerLocally("Check my sugar", {
      logs: LOGS,
      plan: PLAN,
      now: WEDNESDAY,
    });
    expect(topic).toBe("sugar");
    expect(text).toMatch(/118 mg\/dL/);
    expect(text).toMatch(/7-day average/);
  });

  it("says plainly when no glucose readings exist", () => {
    const { text } = answerLocally("Check my sugar", {
      logs: [],
      plan: PLAN,
      now: WEDNESDAY,
    });
    expect(text).toMatch(/haven't logged a glucose reading/i);
  });

  it("summarises the current plan week and phase", () => {
    const { text, topic } = answerLocally("Plan my week", {
      logs: LOGS,
      plan: PLAN,
      now: WEDNESDAY,
    });
    expect(topic).toBe("plan");
    expect(text).toMatch(/week 3 of 12/i);
    expect(text).toMatch(/Reset/);
  });

  it("says plainly when no plan has started", () => {
    const { text } = answerLocally("Plan my week", {
      logs: LOGS,
      plan: null,
      now: WEDNESDAY,
    });
    expect(text).toMatch(/haven't started/i);
  });

  it("summarises today's water against the goal", () => {
    const { text, topic } = answerLocally("How much water have I drunk?", {
      logs: LOGS,
      plan: PLAN,
      now: WEDNESDAY,
    });
    expect(topic).toBe("water");
    expect(text).toMatch(/5 of 8 glasses/);
  });

  it("falls back to what it can answer", () => {
    const { text, topic } = answerLocally("Tell me a joke", {
      logs: LOGS,
      plan: PLAN,
      now: WEDNESDAY,
    });
    expect(topic).toBe("general");
    expect(text).toMatch(/I can help with/);
  });

  it("carries the safety line on every answer", () => {
    const questions = [
      "Is beans safe?",
      "What should I eat today?",
      "Check my sugar",
      "Plan my week",
      "How much water have I drunk?",
      "Tell me a joke",
    ];
    questions.forEach((question) => {
      const { text } = answerLocally(question, {
        logs: LOGS,
        plan: PLAN,
        now: WEDNESDAY,
      });
      expect(text).toContain(GUIDE_SAFETY_LINE);
    });
  });
});

describe("askGuide", () => {
  it("answers locally when no OpenAI key is set", async () => {
    delete process.env.EXPO_PUBLIC_OPENAI_API_KEY;
    const result = await askGuide("Is beans safe?", {
      logs: LOGS,
      plan: PLAN,
      now: WEDNESDAY,
    });
    expect(result.source).toBe("local");
    expect(result.text).toMatch(/Safe/);
  });
});
