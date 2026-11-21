import React, { useState, useCallback } from "react";
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  Share,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../../theme/ThemeProvider";
import { useUserLogs } from "../../../hooks/useUserLogs";
import { useUserProfile } from "../../../hooks/useUserProfile";
import { classifyReading, toMgdl } from "../../../utils/glucose";

// ─── Date Helpers ─────────────────────────────────────────────────────────────

const fmtDate = (d) =>
  new Date(d).toLocaleDateString("en-NG", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

const fmtDateShort = (d) =>
  new Date(d).toLocaleDateString("en-NG", {
    month: "short",
    day: "numeric",
  });

/** Resolve a Firestore Timestamp or ISO string to a JS Date */
const toDate = (val) => {
  if (!val) return null;
  if (val?.toDate) return val.toDate(); // Firestore Timestamp
  if (val?.seconds) return new Date(val.seconds * 1000); // plain seconds obj
  return new Date(val);
};

// ─── Stat helpers ─────────────────────────────────────────────────────────────

const avg = (arr) =>
  arr.length ? Math.round(arr.reduce((s, v) => s + v, 0) / arr.length) : 0;

const avgFixed = (arr, dec = 1) =>
  arr.length
    ? (arr.reduce((s, v) => s + v, 0) / arr.length).toFixed(dec)
    : "0.0";

const mode = (arr) => {
  if (!arr.length) return "N/A";
  const freq = {};
  arr.forEach((v) => {
    freq[v] = (freq[v] || 0) + 1;
  });
  return Object.entries(freq).sort((a, b) => b[1] - a[1])[0][0];
};

const topN = (arr, n = 3) => {
  if (!arr.length) return "None";
  const freq = {};
  arr.forEach((v) => {
    freq[v] = (freq[v] || 0) + 1;
  });
  return Object.entries(freq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, n)
    .map(([k]) => k)
    .join(", ");
};

const topEntry = (arr) => {
  if (!arr.length) return { name: "None", count: 0 };
  const freq = {};
  arr.forEach((v) => {
    freq[v] = (freq[v] || 0) + 1;
  });
  const [name, count] = Object.entries(freq).sort((a, b) => b[1] - a[1])[0];
  return { name, count };
};

// ─── Glucose classification ───────────────────────────────────────────────────
// The shared classifier (src/utils/glucose.js, brief 0.1) — a low
// reading is never counted as "normal" here. Buckets for the summary:
//   low     — urgent_low, low (< 70 mg/dL)
//   inRange — normal, in_target, and below_target (70–79 fasting for a
//             diagnosed user: not low, so it sits with in-range here;
//             the log screen still shows it as "Below target")
//   high    — above_target, diabetes_range, very_high, moderate, elevated
const LOW_LEVELS = ["urgent_low", "low"];
const IN_RANGE_LEVELS = ["normal", "in_target", "below_target"];

const classifyGlucoseLevel = (reading, diagnosis) =>
  classifyReading(reading.value, {
    context: reading.context,
    diagnosis,
  }).level;

// ─── Report builder ───────────────────────────────────────────────────────────

const buildReport = (logs, days, diagnosis) => {
  const now = new Date();
  const cutoff = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
  const startLabel = fmtDate(cutoff);
  const endLabel = fmtDate(now);

  const inRange = logs.filter((log) => {
    const d = toDate(log.createdAt);
    return d && d >= cutoff;
  });

  // ── GLUCOSE ──
  const glucoseLogs = inRange.filter((l) => l.category === "glucose");
  const glucoseReadings = glucoseLogs
    .map((l) => ({
      // Convert to mg/dL first (brief 0.1): a mmol/L log used to be
      // counted and averaged as if it were mg/dL.
      value: toMgdl(
        parseFloat(l.value || l.glucoseLevel || l.level || 0),
        l.unit
      ),
      // Glucose logs store `context` ("fasting", "before_meal", …),
      // not `isFasting` or `type` — the old check was always false.
      context: l.context || "random",
      isFasting: l.context === "fasting" || l.context === "before_meal",
      date: toDate(l.createdAt),
    }))
    .filter((r) => r.value !== null && r.value > 0);

  const fastingValues = glucoseReadings
    .filter((r) => r.isFasting)
    .map((r) => r.value);
  const postMealValues = glucoseReadings
    .filter((r) => !r.isFasting)
    .map((r) => r.value);

  const lowCount = glucoseReadings.filter((r) =>
    LOW_LEVELS.includes(classifyGlucoseLevel(r, diagnosis))
  ).length;
  const inRangeCount = glucoseReadings.filter((r) =>
    IN_RANGE_LEVELS.includes(classifyGlucoseLevel(r, diagnosis))
  ).length;
  const highCount = glucoseReadings.length - lowCount - inRangeCount;

  const pct = (n) =>
    glucoseReadings.length ? Math.round((n / glucoseReadings.length) * 100) : 0;

  const sortedByValue = [...glucoseReadings].sort((a, b) => b.value - a.value);
  const highest = sortedByValue[0];
  const lowest = sortedByValue[sortedByValue.length - 1];

  // ── MEALS ──
  const mealLogs = inRange.filter((l) => l.category === "meal");
  const mealNames = mealLogs.map(
    (l) => l.mealName || l.name || l.food || "Unknown"
  );
  const mealTypeCounts = { Breakfast: 0, Lunch: 0, Dinner: 0, Snack: 0 };
  mealLogs.forEach((l) => {
    const t = l.mealType || l.type || "";
    const key = Object.keys(mealTypeCounts).find(
      (k) => k.toLowerCase() === t.toLowerCase()
    );
    if (key) mealTypeCounts[key]++;
  });
  const topMeal = topEntry(mealNames);

  // ── HYDRATION ──
  const hydrationLogs = inRange.filter(
    (l) => l.category === "hydration" || l.category === "water"
  );
  const hydrationByDay = {};
  hydrationLogs.forEach((l) => {
    const d = toDate(l.createdAt);
    if (!d) return;
    const key = d.toDateString();
    const glasses =
      parseFloat(l.glasses || l.cups || l.amount || l.quantity || 1) || 1;
    hydrationByDay[key] = (hydrationByDay[key] || 0) + glasses;
  });
  const hydrationDays = Object.values(hydrationByDay);
  const daysMetGoal = hydrationDays.filter((g) => g >= 8).length;

  // ── SLEEP ──
  const sleepLogs = inRange.filter((l) => l.category === "sleep");
  const sleepDurations = sleepLogs
    .map((l) =>
      parseFloat(l.duration || l.hours || l.sleepDuration || l.hoursSlept || 0)
    )
    .filter((v) => v > 0);
  const sleepQualities = sleepLogs
    .map((l) => l.quality || l.sleepQuality || "")
    .filter(Boolean);

  // ── BODY CHECK ──
  const bodyLogs = inRange.filter((l) => l.category === "body_check");
  const moods = bodyLogs.map((l) => l.mood || "").filter(Boolean);
  const symptoms = bodyLogs.flatMap((l) => l.symptoms || l.symptomsList || []);
  const energyScores = bodyLogs
    .map((l) => parseFloat(l.energyLevel || l.energy || 0))
    .filter((v) => v > 0);

  // ── ASSEMBLE TEXT ──
  const pad = (str, width = 38) => str.padEnd(width, "─");

  const lines = [
    "REVERSIA HEALTH REPORT",
    `Generated: ${fmtDate(now)}`,
    `Period: ${startLabel} to ${endLabel}`,
    "",
    pad("── GLUCOSE READINGS "),
    `Total readings: ${glucoseReadings.length}`,
    `Fasting average: ${
      fastingValues.length ? avg(fastingValues) : "N/A"
    } mg/dL`,
    `Post-meal average: ${
      postMealValues.length ? avg(postMealValues) : "N/A"
    } mg/dL`,
    `Readings low (< 70 mg/dL): ${pct(lowCount)}%`,
    `Readings in range: ${pct(inRangeCount)}%`,
    `Readings high (above target): ${pct(highCount)}%`,
    highest
      ? `Highest reading: ${highest.value} mg/dL (${fmtDateShort(
          highest.date
        )})`
      : "Highest reading: N/A",
    lowest
      ? `Lowest reading: ${lowest.value} mg/dL (${fmtDateShort(lowest.date)})`
      : "Lowest reading: N/A",
    "",
    pad("── MEALS LOGGED "),
    `Total logs: ${mealLogs.length}`,
    mealNames.length
      ? `Most frequent: ${topMeal.name} (${topMeal.count} time${
          topMeal.count !== 1 ? "s" : ""
        })`
      : "Most frequent: N/A",
    `Meal types: Breakfast ${mealTypeCounts.Breakfast}, Lunch ${mealTypeCounts.Lunch}, Dinner ${mealTypeCounts.Dinner}, Snack ${mealTypeCounts.Snack}`,
    "",
    pad("── HYDRATION "),
    `Days tracked: ${hydrationDays.length}`,
    `Average glasses/day: ${
      hydrationDays.length ? avgFixed(hydrationDays) : "0.0"
    }`,
    `Days meeting 8-glass goal: ${daysMetGoal}`,
    "",
    pad("── SLEEP "),
    `Nights logged: ${sleepLogs.length}`,
    `Average duration: ${
      sleepDurations.length ? avgFixed(sleepDurations) : "0.0"
    } hrs`,
    `Most common quality: ${
      sleepQualities.length ? mode(sleepQualities) : "N/A"
    }`,
    "",
    pad("── BODY CHECK-INS "),
    `Total: ${bodyLogs.length}`,
    `Most common mood: ${moods.length ? mode(moods) : "N/A"}`,
    `Most reported symptoms: ${topN(symptoms)}`,
    `Average energy score: ${
      energyScores.length ? avgFixed(energyScores) : "N/A"
    }/10`,
    "",
    pad("── NOTES "),
    "This report was generated by Reversia.",
    "Data reflects self-reported logs only.",
    "Please discuss with your healthcare provider.",
  ];

  const stats = {
    totalLogs: inRange.length,
    glucoseCount: glucoseReadings.length,
    fastingAvg: fastingValues.length ? avg(fastingValues) : null,
    postMealAvg: postMealValues.length ? avg(postMealValues) : null,
    normalPct: pct(inRangeCount),
    mealCount: mealLogs.length,
    hydrationDaysCount: hydrationDays.length,
    avgGlasses: hydrationDays.length ? avgFixed(hydrationDays) : "0.0",
    sleepCount: sleepLogs.length,
    avgSleep: sleepDurations.length ? avgFixed(sleepDurations) : "0.0",
    bodyCheckCount: bodyLogs.length,
  };

  return { text: lines.join("\n"), stats };
};

// ─── Range pill options ───────────────────────────────────────────────────────

const RANGE_OPTIONS = [
  { label: "7 Days", days: 7 },
  { label: "14 Days", days: 14 },
  { label: "30 Days", days: 30 },
  { label: "90 Days", days: 90 },
];

// ─── Component ────────────────────────────────────────────────────────────────

export default function ExportReportScreen({ navigation }) {
  const { colors } = useTheme();
  const { logs, loading: logsLoading } = useUserLogs(500);
  const { userData: profile } = useUserProfile();

  const [selectedDays, setSelectedDays] = useState(30);
  const [generating, setGenerating] = useState(false);
  const [report, setReport] = useState(null); // { text, stats }

  const handleGenerate = useCallback(async () => {
    setGenerating(true);
    setReport(null);
    // Slight delay so the spinner renders before heavy computation
    await new Promise((r) => setTimeout(r, 300));
    try {
      const result = buildReport(logs, selectedDays, profile?.diabetesType);
      setReport(result);
    } finally {
      setGenerating(false);
    }
  }, [logs, selectedDays, profile?.diabetesType]);

  const handleShare = useCallback(async () => {
    if (!report) return;
    try {
      await Share.share({
        message: report.text,
        title: "Reversia Health Report",
      });
    } catch (_) {
      // User cancelled — silent
    }
  }, [report]);

  // Reset report when range changes
  const handleSelectDays = (days) => {
    setSelectedDays(days);
    setReport(null);
  };

  const s = useStyles(colors);

  return (
    <SafeAreaView style={[s.safe, { backgroundColor: colors.background }]}>
      {/* ── Header ── */}
      <View style={[s.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={s.backBtn}
          activeOpacity={0.7}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="chevron-back" size={24} color={colors.foreground} />
        </TouchableOpacity>
        <View style={s.headerCenter}>
          <Text style={[s.headerTitle, { color: colors.foreground }]}>
            Health Report
          </Text>
          <Text style={[s.headerSub, { color: colors.mutedForeground }]}>
            Share with doctor
          </Text>
        </View>
        <View style={s.backBtn} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={s.content}
      >
        {/* ── Date range selector ── */}
        <View style={s.section}>
          <Text style={[s.sectionLabel, { color: colors.mutedForeground }]}>
            SELECT PERIOD
          </Text>
          <View style={s.pillRow}>
            {RANGE_OPTIONS.map((opt) => {
              const active = selectedDays === opt.days;
              return (
                <TouchableOpacity
                  key={opt.days}
                  onPress={() => handleSelectDays(opt.days)}
                  activeOpacity={0.75}
                  style={[
                    s.pill,
                    {
                      backgroundColor: active ? colors.primary : colors.card,
                      borderColor: active ? colors.primary : colors.border,
                    },
                  ]}
                >
                  <Text
                    style={[
                      s.pillText,
                      {
                        color: active ? "#FFFFFF" : colors.mutedForeground,
                        fontWeight: active ? "700" : "500",
                      },
                    ]}
                  >
                    {opt.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* ── Info banner ── */}
        <View
          style={[
            s.infoBanner,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
        >
          <Ionicons
            name="information-circle-outline"
            size={18}
            color={colors.primary}
          />
          <Text style={[s.infoBannerText, { color: colors.mutedForeground }]}>
            {logsLoading
              ? "Loading your logs…"
              : `${logs.length} log${
                  logs.length !== 1 ? "s" : ""
                } available. Report will cover the last ${selectedDays} days.`}
          </Text>
        </View>

        {/* ── Generate button ── */}
        {!generating && !report && (
          <TouchableOpacity
            onPress={handleGenerate}
            activeOpacity={0.85}
            disabled={logsLoading}
            style={[
              s.primaryBtn,
              {
                backgroundColor: logsLoading
                  ? colors.mutedForeground
                  : colors.primary,
              },
            ]}
          >
            <Ionicons name="document-text" size={20} color="#FFFFFF" />
            <Text style={s.primaryBtnText}>Generate Report</Text>
          </TouchableOpacity>
        )}

        {/* ── Generating spinner ── */}
        {generating && (
          <View
            style={[
              s.spinnerCard,
              { backgroundColor: colors.card, borderColor: colors.border },
            ]}
          >
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={[s.spinnerText, { color: colors.mutedForeground }]}>
              Building your report…
            </Text>
          </View>
        )}

        {/* ── Preview & share ── */}
        {report && !generating && (
          <>
            {/* Summary card */}
            <View
              style={[
                s.previewCard,
                { backgroundColor: colors.card, borderColor: colors.border },
              ]}
            >
              <View style={s.previewHeader}>
                <Ionicons
                  name="checkmark-circle"
                  size={22}
                  color={colors.primary}
                />
                <Text style={[s.previewTitle, { color: colors.foreground }]}>
                  Report Ready
                </Text>
              </View>

              <Text
                style={[s.previewPeriod, { color: colors.mutedForeground }]}
              >
                Last {selectedDays} days · {report.stats.totalLogs} total logs
              </Text>

              <View style={[s.divider, { backgroundColor: colors.border }]} />

              <View style={s.statsGrid}>
                <StatCell
                  label="Glucose"
                  value={report.stats.glucoseCount}
                  unit="readings"
                  colors={colors}
                />
                <StatCell
                  label="Fasting Avg"
                  value={
                    report.stats.fastingAvg != null
                      ? `${report.stats.fastingAvg}`
                      : "—"
                  }
                  unit="mg/dL"
                  colors={colors}
                />
                <StatCell
                  label="Meals"
                  value={report.stats.mealCount}
                  unit="logged"
                  colors={colors}
                />
                <StatCell
                  label="Avg Sleep"
                  value={report.stats.avgSleep}
                  unit="hrs"
                  colors={colors}
                />
                <StatCell
                  label="Hydration"
                  value={`${report.stats.avgGlasses}`}
                  unit="gl/day"
                  colors={colors}
                />
                <StatCell
                  label="In range %"
                  value={`${report.stats.normalPct}%`}
                  unit="glucose"
                  colors={colors}
                />
              </View>
            </View>

            {/* Share button */}
            <TouchableOpacity
              onPress={handleShare}
              activeOpacity={0.85}
              style={[s.primaryBtn, { backgroundColor: colors.primary }]}
            >
              <Ionicons name="share-outline" size={20} color="#FFFFFF" />
              <Text style={s.primaryBtnText}>Share Report</Text>
            </TouchableOpacity>

            {/* Regenerate */}
            <TouchableOpacity
              onPress={handleGenerate}
              activeOpacity={0.75}
              style={[s.secondaryBtn, { borderColor: colors.border }]}
            >
              <Ionicons
                name="refresh-outline"
                size={18}
                color={colors.mutedForeground}
              />
              <Text
                style={[s.secondaryBtnText, { color: colors.mutedForeground }]}
              >
                Regenerate
              </Text>
            </TouchableOpacity>

            {/* Text preview */}
            <View
              style={[
                s.textPreview,
                { backgroundColor: colors.card, borderColor: colors.border },
              ]}
            >
              <Text
                style={[s.textPreviewLabel, { color: colors.mutedForeground }]}
              >
                REPORT PREVIEW
              </Text>
              <Text
                style={[s.textPreviewBody, { color: colors.foreground }]}
                selectable
              >
                {report.text}
              </Text>
            </View>
          </>
        )}

        {/* ── Disclaimer ── */}
        <Text style={[s.disclaimer, { color: colors.mutedForeground }]}>
          This report contains self-reported data only. Always consult a
          qualified healthcare professional.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── StatCell ─────────────────────────────────────────────────────────────────

function StatCell({ label, value, unit, colors }) {
  return (
    <View style={statStyles.cell}>
      <Text style={[statStyles.value, { color: colors.foreground }]}>
        {value}
      </Text>
      <Text style={[statStyles.unit, { color: colors.mutedForeground }]}>
        {unit}
      </Text>
      <Text style={[statStyles.label, { color: colors.mutedForeground }]}>
        {label}
      </Text>
    </View>
  );
}

const statStyles = StyleSheet.create({
  cell: {
    width: "33.33%",
    alignItems: "center",
    paddingVertical: 12,
  },
  value: {
    fontSize: 18,
    fontWeight: "700",
  },
  unit: {
    fontSize: 11,
    marginTop: 1,
  },
  label: {
    fontSize: 11,
    fontWeight: "600",
    marginTop: 2,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
});

// ─── Styles ───────────────────────────────────────────────────────────────────

const useStyles = (colors) =>
  StyleSheet.create({
    safe: { flex: 1 },
    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 16,
      paddingVertical: 14,
      borderBottomWidth: StyleSheet.hairlineWidth,
    },
    backBtn: {
      width: 36,
      height: 36,
      alignItems: "center",
      justifyContent: "center",
    },
    headerCenter: { flex: 1, alignItems: "center" },
    headerTitle: {
      fontSize: 17,
      fontWeight: "700",
      letterSpacing: 0.1,
    },
    headerSub: {
      fontSize: 12,
      marginTop: 1,
    },
    content: {
      paddingHorizontal: 20,
      paddingTop: 24,
      paddingBottom: 60,
      gap: 16,
    },
    section: { gap: 10 },
    sectionLabel: {
      fontSize: 11,
      fontWeight: "700",
      letterSpacing: 1,
      textTransform: "uppercase",
    },
    pillRow: {
      flexDirection: "row",
      gap: 10,
    },
    pill: {
      flex: 1,
      alignItems: "center",
      paddingVertical: 10,
      borderRadius: 100,
      borderWidth: 1.5,
    },
    pillText: { fontSize: 13 },
    infoBanner: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
      padding: 14,
      borderRadius: 14,
      borderWidth: 1,
    },
    infoBannerText: { flex: 1, fontSize: 13, lineHeight: 18 },
    primaryBtn: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 10,
      height: 54,
      borderRadius: 100,
    },
    primaryBtnText: {
      color: "#FFFFFF",
      fontSize: 16,
      fontWeight: "700",
    },
    secondaryBtn: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
      height: 46,
      borderRadius: 100,
      borderWidth: 1.5,
    },
    secondaryBtnText: { fontSize: 14, fontWeight: "600" },
    spinnerCard: {
      alignItems: "center",
      justifyContent: "center",
      gap: 16,
      paddingVertical: 40,
      borderRadius: 20,
      borderWidth: 1,
    },
    spinnerText: { fontSize: 14, fontWeight: "500" },
    previewCard: {
      borderRadius: 20,
      borderWidth: 1,
      padding: 20,
      gap: 12,
    },
    previewHeader: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
    },
    previewTitle: {
      fontSize: 16,
      fontWeight: "700",
    },
    previewPeriod: { fontSize: 13 },
    divider: { height: StyleSheet.hairlineWidth },
    statsGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
    },
    textPreview: {
      borderRadius: 16,
      borderWidth: 1,
      padding: 16,
      gap: 10,
    },
    textPreviewLabel: {
      fontSize: 10,
      fontWeight: "700",
      letterSpacing: 1,
      textTransform: "uppercase",
    },
    textPreviewBody: {
      fontSize: 12,
      lineHeight: 18,
      fontFamily: "monospace",
    },
    disclaimer: {
      fontSize: 12,
      textAlign: "center",
      lineHeight: 18,
      paddingHorizontal: 8,
    },
  });
