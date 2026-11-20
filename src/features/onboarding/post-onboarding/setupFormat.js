// src/features/onboarding/post-onboarding/setupFormat.js
//
// Unit conversion + display formatting for the stepped setup flow.
// Canonical storage is always metric (kg for weight, cm for height);
// imperial units are display-only, converted at the edges.

export const KG_TO_LBS = 2.20462;
export const CM_PER_INCH = 2.54;

export function kgToLbs(kg) {
  return Math.round(kg * KG_TO_LBS);
}

export function lbsToKg(lbs) {
  return Math.round(lbs / KG_TO_LBS);
}

export function cmToFeetInches(cm) {
  const totalInches = Math.round(cm / CM_PER_INCH);
  const feet = Math.floor(totalInches / 12);
  const inches = totalInches % 12;
  return `${feet}'${inches}"`;
}

export function formatWeight(kg, unit) {
  if (unit === "lbs") return `${kgToLbs(kg)} lbs`;
  return `${kg} kg`;
}

export function formatHeight(cm, unit) {
  if (unit === "ft") return cmToFeetInches(cm);
  return `${cm} cm`;
}

/** Split a full name into firstName + lastName (rest of the words). */
export function splitName(fullName) {
  const parts = (fullName || "").trim().split(/\s+/).filter(Boolean);
  return {
    firstName: parts[0] || "",
    lastName: parts.slice(1).join(" "),
  };
}
