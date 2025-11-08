/**
 * Ultimate Fitness & Health Command Center — Google Apps Script automation
 * -----------------------------------------------------------------------
 * Draft automation for the Harmony Sheets fitness pipeline concept.
 * Provides helper menu actions, assembles dashboard data, and supports
 * logging quick workouts and wellness notes from the sidebar demo.
 */

const ULTIMATE_FITNESS = {
  sheets: {
    readiness: "Readiness",
    training: "Training Log",
    meals: "Meals",
    habits: "Habits"
  },
  namedRanges: {
    dailyFocus: "Daily_Focus",
    targetSleep: "Target_Sleep"
  }
};

function onOpen() {
  const ui = SpreadsheetApp.getUi();
  ui.createMenu("Ultimate Fitness")
    .addItem("Open fitness dashboard", "showFitnessDashboard")
    .addItem("Quick add workout", "openWorkoutDialog")
    .addItem("Log recovery note", "openRecoveryDialog")
    .addSeparator()
    .addItem("Refresh readiness data", "refreshReadinessSnapshot")
    .addToUi();
}

function showFitnessDashboard() {
  const template = HtmlService.createTemplateFromFile("ultimate-fitness-health");
  template.snapshot = buildFitnessSnapshot();

  const html = template
    .evaluate()
    .setTitle("Ultimate Fitness & Health")
    .setSandboxMode(HtmlService.SandboxMode.IFRAME)
    .setWidth(420);

  SpreadsheetApp.getUi().showSidebar(html);
}

function openWorkoutDialog() {
  const template = HtmlService.createTemplateFromFile("ultimate-fitness-health");
  template.snapshot = buildFitnessSnapshot();
  template.dialogMode = "workout";

  const html = template
    .evaluate()
    .setTitle("Quick add workout")
    .setSandboxMode(HtmlService.SandboxMode.IFRAME)
    .setWidth(420)
    .setHeight(520);

  SpreadsheetApp.getUi().showModalDialog(html, "Log workout");
}

function openRecoveryDialog() {
  const template = HtmlService.createTemplateFromFile("ultimate-fitness-health");
  template.snapshot = buildFitnessSnapshot();
  template.dialogMode = "recovery";

  const html = template
    .evaluate()
    .setTitle("Recovery + wellness note")
    .setSandboxMode(HtmlService.SandboxMode.IFRAME)
    .setWidth(420)
    .setHeight(440);

  SpreadsheetApp.getUi().showModalDialog(html, "Recovery note");
}

function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}

function buildFitnessSnapshot() {
  const sheet = SpreadsheetApp.getActive();
  const readinessSheet = sheet.getSheetByName(ULTIMATE_FITNESS.sheets.readiness);
  const trainingSheet = sheet.getSheetByName(ULTIMATE_FITNESS.sheets.training);
  const mealsSheet = sheet.getSheetByName(ULTIMATE_FITNESS.sheets.meals);
  const habitsSheet = sheet.getSheetByName(ULTIMATE_FITNESS.sheets.habits);

  const readiness = readinessSheet ? readReadiness_(readinessSheet) : [];
  const workouts = trainingSheet ? readWorkouts_(trainingSheet, 5) : [];
  const meals = mealsSheet ? readMeals_(mealsSheet, 3) : [];
  const habitScore = habitsSheet ? averageHabits_(habitsSheet) : 0;

  return {
    generatedAt: new Date().toISOString(),
    focus: getNamedRangeValue_(ULTIMATE_FITNESS.namedRanges.dailyFocus),
    targetSleep: getNamedRangeValue_(ULTIMATE_FITNESS.namedRanges.targetSleep),
    readiness,
    workouts,
    meals,
    habitScore
  };
}

function refreshReadinessSnapshot() {
  const sheet = SpreadsheetApp.getActive();
  const readinessSheet = sheet.getSheetByName(ULTIMATE_FITNESS.sheets.readiness);
  if (!readinessSheet) {
    SpreadsheetApp.getUi().alert("No 'Readiness' sheet found.");
    return;
  }

  const now = new Date();
  readinessSheet.getRange("A1").setValue("Updated " + now.toLocaleString());
}

function getNamedRangeValue_(name) {
  const range = SpreadsheetApp.getActive().getRangeByName(name);
  return range ? range.getDisplayValue() : "";
}

function readReadiness_(sheet) {
  const values = sheet.getDataRange().getValues();
  if (values.length <= 1) return [];
  const headers = values.shift();
  const dateIndex = headers.indexOf("Date");
  const hrvIndex = headers.indexOf("HRV");
  const rhrIndex = headers.indexOf("RHR");
  const scoreIndex = headers.indexOf("Score");

  return values
    .filter((row) => row.some((cell) => cell !== ""))
    .map((row) => ({
      date: dateIndex > -1 ? formatDate_(row[dateIndex]) : "",
      hrv: hrvIndex > -1 ? Number(row[hrvIndex]) : null,
      rhr: rhrIndex > -1 ? Number(row[rhrIndex]) : null,
      score: scoreIndex > -1 ? Number(row[scoreIndex]) : null
    }))
    .slice(0, 7);
}

function readWorkouts_(sheet, limit) {
  const values = sheet.getDataRange().getValues();
  if (values.length <= 1) return [];
  const headers = values.shift();
  const dateIndex = headers.indexOf("Date");
  const sessionIndex = headers.indexOf("Session");
  const durationIndex = headers.indexOf("Duration");
  const intensityIndex = headers.indexOf("Intensity");

  return values
    .filter((row) => row[dateIndex] || row[sessionIndex])
    .map((row) => ({
      date: formatDate_(row[dateIndex]),
      session: String(row[sessionIndex] || ""),
      duration: Number(row[durationIndex] || 0),
      intensity: String(row[intensityIndex] || "Moderate")
    }))
    .slice(0, limit || values.length);
}

function readMeals_(sheet, limit) {
  const values = sheet.getDataRange().getValues();
  if (values.length <= 1) return [];
  const headers = values.shift();
  const timeIndex = headers.indexOf("Time");
  const mealIndex = headers.indexOf("Meal");
  const proteinIndex = headers.indexOf("Protein");

  return values
    .filter((row) => row[mealIndex])
    .map((row) => ({
      time: String(row[timeIndex] || ""),
      meal: String(row[mealIndex] || ""),
      protein: Number(row[proteinIndex] || 0)
    }))
    .slice(0, limit || values.length);
}

function averageHabits_(sheet) {
  const values = sheet.getDataRange().getValues();
  if (values.length <= 1) return 0;
  const headers = values.shift();
  const scoreIndex = headers.indexOf("Score");
  if (scoreIndex === -1) return 0;

  const scores = values
    .map((row) => Number(row[scoreIndex] || 0))
    .filter((score) => !isNaN(score));

  if (scores.length === 0) return 0;
  const total = scores.reduce((sum, score) => sum + score, 0);
  return Math.round((total / scores.length) * 10) / 10;
}

function formatDate_(value) {
  if (!value) return "";
  if (value instanceof Date) {
    return Utilities.formatDate(value, Session.getScriptTimeZone(), "MMM d");
  }
  const maybeDate = new Date(value);
  if (!isNaN(maybeDate.getTime())) {
    return Utilities.formatDate(maybeDate, Session.getScriptTimeZone(), "MMM d");
  }
  return String(value);
}

function handleWorkoutSubmit(payload) {
  const sheet = SpreadsheetApp.getActive().getSheetByName(ULTIMATE_FITNESS.sheets.training);
  if (!sheet) {
    throw new Error("Training Log sheet not found");
  }
  sheet.insertRowBefore(2);
  sheet.getRange(2, 1, 1, 5).setValues([
    [
      new Date(),
      payload.session || "",
      payload.block || "",
      payload.duration || 0,
      payload.intensity || "Moderate"
    ]
  ]);
}

function handleRecoverySubmit(payload) {
  const sheet = SpreadsheetApp.getActive().getSheetByName(ULTIMATE_FITNESS.sheets.readiness);
  if (!sheet) {
    throw new Error("Readiness sheet not found");
  }
  sheet.insertRowBefore(2);
  sheet.getRange(2, 1, 1, 5).setValues([
    [
      new Date(),
      payload.hrv || "",
      payload.rhr || "",
      payload.score || "",
      payload.note || ""
    ]
  ]);
}
