import React, { useState, useEffect, useRef, useCallback } from "react";

// ══════════════════════════════════════════════════════════════════
// APPS SCRIPT BACKEND URL — DO NOT CHANGE
// ══════════════════════════════════════════════════════════════════
const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbxCR0_X2xe7ojq38W3XVt-3VAp3JISfH9DLwTolOi61TZcYAOOZhtD9oIJoMmZqU8rk/exec";

// ══════════════════════════════════════════════════════════════════
// UID GENERATOR — Unique identity for each submission
// ══════════════════════════════════════════════════════════════════
async function generateUID(name, dob, mobile) {
  const raw = (name + dob + mobile).toLowerCase().trim();
  const encoder = new TextEncoder();
  const data = encoder.encode(raw);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, "0")).join("").slice(0, 32);
}

// ══════════════════════════════════════════════════════════════════
// SUBMIT TO GOOGLE SHEETS — Silent automatic data transfer
// ══════════════════════════════════════════════════════════════════
async function submitToSheet(payload) {
  try {
    const response = await fetch(APPS_SCRIPT_URL, {
      method: "POST",
      headers: { "Content-Type": "text/plain" },
      body: JSON.stringify(payload)
    });
    const result = await response.json();
    console.log("Submission result:", result);
    return result;
  } catch (error) {
    console.error("Submission error:", error);
    return { status: "error", message: error.toString() };
  }
}

// ══════════════════════════════════════════════════════════════════
// DEVICE DETECTOR
// ══════════════════════════════════════════════════════════════════
function getDevice() {
  const ua = navigator.userAgent;
  if (/mobile/i.test(ua)) return "Mobile";
  if (/tablet|ipad/i.test(ua)) return "Tablet";
  return "Desktop";
}
