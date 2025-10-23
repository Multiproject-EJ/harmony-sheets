/**
 * Budget Blueprint — Google Apps Script automation
 * -------------------------------------------------
 * Provides helper actions for the Budget Blueprint Google Sheet demo.
 * - Adds a custom menu for quick actions
 * - Opens the HTML dashboard sidebar defined in budget-blueprint.html
 * - Aggregates transaction and budget data for the sidebar UI
 * - Supports logging new transactions from the sidebar form
 */

const BUDGET_BLUEPRINT = {
  sheets: {
    transactions: "Transactions",
    categories: "Categories",
    monthly: "Monthly Summary"
  },
  namedRanges: {
    monthlyBudget: "Monthly_Budget",
    monthlySavingsTarget: "Monthly_Savings_Target"
  }
};

function onOpen() {
  const ui = SpreadsheetApp.getUi();
  ui.createMenu("Budget Blueprint")
    .addItem("Open budget dashboard", "showBudgetBlueprint")
    .addItem("Quick add transaction", "openQuickAddDialog")
    .addSeparator()
    .addItem("Refresh monthly summary", "refreshMonthlySummary")
    .addToUi();
}

function showBudgetBlueprint() {
  const template = HtmlService.createTemplateFromFile("budget-blueprint");
  template.dashboard = buildBudgetSnapshot();

  const html = template
    .evaluate()
    .setTitle("Budget Blueprint")
    .setSandboxMode(HtmlService.SandboxMode.IFRAME)
    .setWidth(360);

  SpreadsheetApp.getUi().showSidebar(html);
}

function openQuickAddDialog() {
  const template = HtmlService.createTemplateFromFile("budget-blueprint");
  template.dashboard = buildBudgetSnapshot();
  const html = template
    .evaluate()
    .setTitle("Quick add transaction")
    .setSandboxMode(HtmlService.SandboxMode.IFRAME)
    .setWidth(420)
    .setHeight(520);

  SpreadsheetApp.getUi().showModalDialog(html, "Log a new transaction");
}

function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}

function buildBudgetSnapshot() {
  const sheet = SpreadsheetApp.getActive();
  const transactionsSheet = sheet.getSheetByName(BUDGET_BLUEPRINT.sheets.transactions);
  const monthlySheet = sheet.getSheetByName(BUDGET_BLUEPRINT.sheets.monthly);

  const recentTransactions = transactionsSheet
    ? readTransactions_(transactionsSheet).slice(0, 10)
    : [];
  const monthlyTotals = monthlySheet ? readMonthlyTotals_(monthlySheet) : [];
  const savingsTarget = getNamedRangeValue_(BUDGET_BLUEPRINT.namedRanges.monthlySavingsTarget);
  const monthlyBudget = getNamedRangeValue_(BUDGET_BLUEPRINT.namedRanges.monthlyBudget);

  return {
    generatedAt: new Date().toISOString(),
    budgeted: monthlyBudget,
    savingsTarget,
    totals: monthlyTotals,
    recentTransactions
  };
}

function readTransactions_(sheet) {
  const values = sheet.getDataRange().getValues();
  const headers = values.shift();
  const indexes = {
    date: headers.indexOf("Date"),
    description: headers.indexOf("Description"),
    category: headers.indexOf("Category"),
    amount: headers.indexOf("Amount"),
    account: headers.indexOf("Account")
  };

  return values
    .filter((row) => row.some((cell) => cell !== ""))
    .map((row) => ({
      date: indexes.date > -1 ? Utilities.formatDate(new Date(row[indexes.date]), Session.getScriptTimeZone(), "yyyy-MM-dd") : "",
      description: indexes.description > -1 ? String(row[indexes.description]) : "",
      category: indexes.category > -1 ? String(row[indexes.category]) : "Uncategorized",
      amount: indexes.amount > -1 ? Number(row[indexes.amount]) : 0,
      account: indexes.account > -1 ? String(row[indexes.account]) : "Checking"
    }))
    .sort((a, b) => (a.date > b.date ? -1 : 1));
}

function readMonthlyTotals_(sheet) {
  const values = sheet.getDataRange().getValues();
  if (values.length <= 1) return [];
  const headers = values.shift();
  const monthIndex = headers.indexOf("Month");
  const spentIndex = headers.indexOf("Spent");
  const plannedIndex = headers.indexOf("Planned");
  const savedIndex = headers.indexOf("Saved");

  return values
    .filter((row) => row[monthIndex] && row.some((cell) => cell !== ""))
    .map((row) => ({
      month: row[monthIndex],
      spent: Number(row[spentIndex] || 0),
      planned: Number(row[plannedIndex] || 0),
      saved: Number(row[savedIndex] || 0)
    }));
}

function getNamedRangeValue_(name) {
  if (!name) return 0;
  const range = SpreadsheetApp.getActive().getRangeByName(name);
  if (!range) return 0;
  const value = range.getValue();
  return typeof value === "number" ? value : Number(value) || 0;
}

function refreshMonthlySummary() {
  const sheet = SpreadsheetApp.getActive().getSheetByName(BUDGET_BLUEPRINT.sheets.monthly);
  if (!sheet) return;

  const totals = buildCategoryTotals_();
  const header = ["Month", "Planned", "Spent", "Saved"];
  const rows = totals.map((item) => [item.month, item.planned, item.spent, item.saved]);
  sheet.clearContents();
  sheet.getRange(1, 1, 1, header.length).setValues([header]);
  if (rows.length) {
    sheet.getRange(2, 1, rows.length, header.length).setValues(rows);
  }
  return buildBudgetSnapshot();
}

function buildCategoryTotals_() {
  const sheet = SpreadsheetApp.getActive().getSheetByName(BUDGET_BLUEPRINT.sheets.transactions);
  if (!sheet) return [];

  const values = sheet.getDataRange().getValues();
  const headers = values.shift();
  const monthIndex = headers.indexOf("Month");
  const plannedIndex = headers.indexOf("Planned");
  const spentIndex = headers.indexOf("Amount");
  const savedIndex = headers.indexOf("Saved");

  const totals = new Map();

  values.forEach((row) => {
    const month = monthIndex > -1 && row[monthIndex] ? row[monthIndex] : "Unassigned";
    if (!totals.has(month)) {
      totals.set(month, { month, planned: 0, spent: 0, saved: 0 });
    }
    const entry = totals.get(month);
    entry.planned += plannedIndex > -1 ? Number(row[plannedIndex] || 0) : 0;
    entry.spent += spentIndex > -1 ? Number(row[spentIndex] || 0) : 0;
    entry.saved += savedIndex > -1 ? Number(row[savedIndex] || 0) : 0;
  });

  return Array.from(totals.values());
}

function addTransaction(formInput) {
  const { date, description, amount, category, account } = formInput;
  const sheet = SpreadsheetApp.getActive().getSheetByName(BUDGET_BLUEPRINT.sheets.transactions);
  if (!sheet) {
    throw new Error("Transactions sheet not found.");
  }

  const normalizedDate = date ? new Date(date) : new Date();
  const normalizedAmount = Number(amount);
  const month = Utilities.formatDate(normalizedDate, Session.getScriptTimeZone(), "yyyy-MM");

  sheet.appendRow([
    normalizedDate,
    description || "",
    category || "Uncategorized",
    normalizedAmount,
    account || "Checking",
    month,
    "",
    ""
  ]);

  return buildBudgetSnapshot();
}

function getCategories() {
  const sheet = SpreadsheetApp.getActive().getSheetByName(BUDGET_BLUEPRINT.sheets.categories);
  if (!sheet) return [];
  const values = sheet.getDataRange().getValues();
  values.shift();
  return values
    .map((row) => row[0])
    .filter((value) => value)
    .map((name) => String(name));
}
