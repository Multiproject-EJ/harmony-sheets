/****************************************************
 * SHEET | Subscription Tracker — Server (v0.4.1)
 * - Daily email reminders (enable/disable/test)
 * - getUpcoming() is timezone-aware (Settings.timezone)
 * - Keeps all v0.3.x functionality
 ****************************************************/

const ST = {
  VERSION: 'v0.4.1',
  SUBS_SHEET: 'Subscriptions',
  SETTINGS_SHEET: 'Settings',
  TZ: Session.getScriptTimeZone() || 'Europe/Oslo',

  SUBS_HEADERS: [
    'id', 'name', 'category', 'amount', 'currency', 'freq',
    'nextBillDate', 'autoRenew', 'payment', 'notes',
    'logoUrl', 'website',
    'createdAt', 'updatedAt'
  ],

  SETTINGS_HEADERS: [
    'currency', 'leadDays', 'theme', 'categories', 'timezone'
  ],

  DEFAULT_SETTINGS: {
    currency: '$',
    leadDays: 7,
    theme: 'theme-graphite',
    categories: 'Streaming, Music, Productivity, Utilities, Cloud, Shopping, Health & Fitness, Gaming, Education, Design',
    timezone: Session.getScriptTimeZone() || 'Europe/Oslo'
  },
};

/** ===== Menu ===== */
function onOpen() {
  ensureSetup_();
  SpreadsheetApp.getUi()
    .createMenu('🧾 Subscriptions')
    .addItem('Open Tracker', 'showSubscriptionTracker')
    .addSeparator()
    .addSubMenu(
      SpreadsheetApp.getUi().createMenu('Demo Data')
        .addItem('➕ Add demo data', 'seedDemoData_')
        .addItem('🧹 Clear demo data', 'clearDemoData_')
    )
    .addSeparator()
    .addSubMenu(
      SpreadsheetApp.getUi().createMenu('Reminders')
        .addItem('Enable daily reminder (09:00)', 'createDailyReminderTrigger')
        .addItem('Disable daily reminder', 'deleteDailyReminderTrigger')
        .addSeparator()
        .addItem('✉️ Send test reminder now', 'sendReminder')
    )
    .addToUi();
}

function showSubscriptionTracker() {
  ensureSetup_();
  const html = HtmlService.createHtmlOutputFromFile('dialog')
    .setWidth(1200)
    .setHeight(760);
  SpreadsheetApp.getUi().showModalDialog(html, 'Subscription Tracker');
}

/** ===== Setup & Utils ===== */
function ensureSetup_() {
  const ss = SpreadsheetApp.getActive();

  // Subscriptions
  let subs = ss.getSheetByName(ST.SUBS_SHEET);
  if (!subs) {
    subs = ss.insertSheet(ST.SUBS_SHEET);
    subs.getRange(1,1,1,ST.SUBS_HEADERS.length).setValues([ST.SUBS_HEADERS]);
    subs.getRange(1,1,1,ST.SUBS_HEADERS.length).setFontWeight('bold').setBackground('#eef2f7');
    const amtCol = ST.SUBS_HEADERS.indexOf('amount')+1;
    subs.getRange(2, amtCol, 2000, 1).setNumberFormat('0.00');
    const dtCol = ST.SUBS_HEADERS.indexOf('nextBillDate')+1;
    subs.getRange(2, dtCol, 2000, 1).setNumberFormat('yyyy-mm-dd');
    const createdCol = ST.SUBS_HEADERS.indexOf('createdAt')+1;
    const updatedCol = ST.SUBS_HEADERS.indexOf('updatedAt')+1;
    subs.getRange(2, createdCol, 2000, 2).setNumberFormat('yyyy-mm-dd hh:mm');
  }

  // Settings
  let settings = ss.getSheetByName(ST.SETTINGS_SHEET);
  if (!settings) {
    settings = ss.insertSheet(ST.SETTINGS_SHEET);
    settings.getRange(1,1,1,ST.SETTINGS_HEADERS.length)
      .setValues([ST.SETTINGS_HEADERS])
      .setFontWeight('bold').setBackground('#eef2f7');
    const d = ST.DEFAULT_SETTINGS;
    settings.getRange(2,1,1,ST.SETTINGS_HEADERS.length)
      .setValues([[d.currency, d.leadDays, d.theme, d.categories, d.timezone]]);
  } else if (settings.getLastRow() < 2) {
    const d = ST.DEFAULT_SETTINGS;
    settings.getRange(2,1,1,ST.SETTINGS_HEADERS.length)
      .setValues([[d.currency, d.leadDays, d.theme, d.categories, d.timezone]]);
  }
}

function sheet_(name){ return SpreadsheetApp.getActive().getSheetByName(name); }
function now_(){ return Utilities.formatDate(new Date(), ST.TZ, "yyyy-MM-dd' 'HH:mm"); }
function dateISO_(d){
  if(!d) return '';
  const dt = (d instanceof Date) ? d : new Date(d);
  if (isNaN(dt.getTime())) return '';
  return Utilities.formatDate(dt, ST.TZ, 'yyyy-MM-dd');
}
function parseISO_(s){
  if(!s) return null;
  const dt = new Date(s);
  return isNaN(dt.getTime()) ? null : dt;
}
function genId_(){ return 's' + Math.random().toString(36).slice(2,9); }

/** ===== Public endpoints for UI ===== */
function getSubscriptionsAndSettings() {
  try {
    ensureSetup_();

    // Settings
    const setSheet = sheet_(ST.SETTINGS_SHEET);
    const svals = (setSheet.getLastRow() >= 2)
      ? setSheet.getRange(2,1,1,ST.SETTINGS_HEADERS.length).getValues()[0]
      : [];
    const settings = {};
    ST.SETTINGS_HEADERS.forEach((h,i)=> settings[h] = (svals && svals[i] !== undefined && svals[i] !== '') ? svals[i] : ST.DEFAULT_SETTINGS[h]);

    // Subscriptions
    const subsSheet = sheet_(ST.SUBS_SHEET);
    const last = subsSheet.getLastRow();
    const rows = last > 1 ? subsSheet.getRange(2,1,last-1, ST.SUBS_HEADERS.length).getValues() : [];
    const subs = rows.map(r=>{ const o={}; ST.SUBS_HEADERS.forEach((h,i)=> o[h]=r[i]); return o; });

    return { settings, subs, ok: true, version: ST.VERSION };
  } catch (err) {
    const settings = { ...ST.DEFAULT_SETTINGS };
    return { settings, subs: [], ok: false, error: String(err && err.message || err), version: ST.VERSION };
  }
}

function upsertSubscription(rec) {
  ensureSetup_();
  const sheet = sheet_(ST.SUBS_SHEET);
  if (!rec) throw new Error('No record received');

  const headers = ST.SUBS_HEADERS;
  const idxMap = {}; headers.forEach((h,i)=> idxMap[h]=i);

  const id = rec.id && String(rec.id).trim() ? String(rec.id).trim() : genId_();

  const rowObj = {
    id,
    name: (rec.name||'').trim(),
    category: (rec.category||'').trim(),
    amount: Number(rec.amount||0),
    currency: (rec.currency||'').trim(),
    freq: (rec.freq||'Monthly').trim(),
    nextBillDate: dateISO_(rec.nextBillDate),
    autoRenew: (rec.autoRenew||'Yes').trim(),
    payment: (rec.payment||'').trim(),
    notes: (rec.notes||'').trim(),
    logoUrl: (rec.logoUrl||'').trim(),
    website: (rec.website||'').trim(),
    createdAt: '',
    updatedAt: now_()
  };

  const last = sheet.getLastRow();
  const ids = last > 1 ? sheet.getRange(2,1,last-1,1).getValues().map(r=>r[0]) : [];
  const pos = ids.indexOf(id);

  if (pos >= 0) {
    const rowNum = 2 + pos;
    const createdCol = idxMap['createdAt']+1;
    const existingCreated = sheet.getRange(rowNum, createdCol).getValue();
    rowObj.createdAt = existingCreated || now_();
    const finalArr = ST.SUBS_HEADERS.map(h => h==='createdAt' ? rowObj.createdAt : rowObj[h]);
    sheet.getRange(rowNum,1,1,ST.SUBS_HEADERS.length).setValues([finalArr]);
  } else {
    rowObj.createdAt = now_();
    const finalArr = ST.SUBS_HEADERS.map(h => rowObj[h]);
    sheet.appendRow(finalArr);
  }
  return { ok:true, rec: { ...rowObj } };
}

function deleteSubscription(id) {
  ensureSetup_();
  if(!id) throw new Error('No id');
  const sheet = sheet_(ST.SUBS_SHEET);
  const last = sheet.getLastRow();
  if(last < 2) return { ok:true, deleted:false };
  const ids = sheet.getRange(2,1,last-1,1).getValues().map(r=>r[0]);
  const idx = ids.indexOf(id);
  if(idx >= 0){ sheet.deleteRow(2+idx); return { ok:true, deleted:true }; }
  return { ok:true, deleted:false };
}

/** Settings */
function getSettings() {
  ensureSetup_();
  const sh = sheet_(ST.SETTINGS_SHEET);
  const hasRow2 = sh.getLastRow() >= 2;
  const vals = hasRow2 ? sh.getRange(2,1,1,ST.SETTINGS_HEADERS.length).getValues()[0] : [];
  const obj = {}; ST.SETTINGS_HEADERS.forEach((h,i)=> obj[h]= (vals && vals[i]!==undefined && vals[i]!=='') ? vals[i] : ST.DEFAULT_SETTINGS[h]);
  return obj;
}

function saveSettings(s) {
  ensureSetup_();
  const sh = sheet_(ST.SETTINGS_SHEET);
  const row = ST.SETTINGS_HEADERS.map(h => (s && h in s) ? s[h] : ST.DEFAULT_SETTINGS[h]);
  sh.getRange(2,1,1,ST.SETTINGS_HEADERS.length).setValues([row]);
  return { ok:true };
}

/** ===== Demo data ===== */
function seedDemoData(){ return seedDemoData_(); }
function clearDemoData(){ return clearDemoData_(); }

function seedDemoData_() {
  ensureSetup_();
  const set = getSettings();
  const cur = set.currency || ST.DEFAULT_SETTINGS.currency;

  const demo = [
    ['s1','iCloud 2TB','Cloud',9.99,cur,'Monthly',dateISO_(offsetDays_( -2)),'Yes','Apple Pay','','https://logo.clearbit.com/apple.com','https://www.icloud.com', now_(), now_()],
    ['s2','Adobe Creative Cloud','Productivity',59.99,cur,'Monthly',dateISO_(offsetDays_( -1)),'Yes','Visa •••• 1234','All Apps','https://logo.clearbit.com/adobe.com','https://www.adobe.com', now_(), now_()],
    ['s3','Netflix2','Streaming',155,cur,'Monthly',dateISO_(offsetDays_(0)),'Yes','','','https://logo.clearbit.com/netflix.com','https://www.netflix.com', now_(), now_()],
    ['s4','Spotify','Music',9.99,cur,'Monthly',dateISO_(offsetDays_(1)),'Yes','Amex •••• 3005','Family','https://logo.clearbit.com/spotify.com','https://www.spotify.com', now_(), now_()],
    ['s5','Netflix','Streaming',15.99,cur,'Monthly',dateISO_(offsetDays_(9)),'Yes','Visa •••• 1234','Standard plan','https://logo.clearbit.com/netflix.com','https://www.netflix.com', now_(), now_()],
    ['s6','Canva Pro','Design',12.99,cur,'Monthly',dateISO_(offsetDays_(15)),'Yes','Visa •••• 1234','','https://logo.clearbit.com/canva.com','https://www.canva.com', now_(), now_()],
    ['s7','Amazon Prime','Shopping',139,cur,'Yearly',dateISO_(offsetDays_(26)),'Yes','Mastercard •••• 7788','Annual','https://logo.clearbit.com/amazon.com','https://www.amazon.com/prime', now_(), now_()],
  ];

  const sheet = sheet_(ST.SUBS_SHEET);
  const last = sheet.getLastRow();
  if (last > 1) sheet.getRange(2,1,last-1, ST.SUBS_HEADERS.length).clearContent();
  sheet.getRange(2,1,demo.length, ST.SUBS_HEADERS.length).setValues(demo);

  SpreadsheetApp.getActive().toast('Demo data added', 'Subscription Tracker', 3);
  return { ok:true, count: demo.length };
}

function clearDemoData_() {
  ensureSetup_();
  const sheet = sheet_(ST.SUBS_SHEET);
  const last = sheet.getLastRow();
  if (last > 1) sheet.getRange(2,1,last-1, ST.SUBS_HEADERS.length).clearContent();
  SpreadsheetApp.getActive().toast('Demo data cleared', 'Subscription Tracker', 3);
  return { ok:true };
}

function offsetDays_(days){
  const d = new Date(); d.setDate(d.getDate()+days); return d;
}

/** ===== TZ helpers ===== */
function todayInTZ_(tz){
  // Midnight "today" in the chosen timezone as a Date
  const [y,m,d] = Utilities.formatDate(new Date(), tz, 'yyyy,MM,dd').split(',').map(Number);
  return new Date(y, m-1, d);
}
function dateFromISOInTZ_(iso){
  // Treat ISO yyyy-mm-dd as a date-only (no time)
  if(!iso) return null;
  const [y,m,d] = String(iso).split('-').map(Number);
  return new Date(y, m-1, d);
}

/** ===== Upcoming (TZ-aware) & Reminders ===== */
function getUpcoming(){
  ensureSetup_();
  const sets = getSettings();
  const tz = sets.timezone || ST.TZ;

  const subsSheet = sheet_(ST.SUBS_SHEET);
  const last = subsSheet.getLastRow();
  const rows = last > 1 ? subsSheet.getRange(2,1,last-1,ST.SUBS_HEADERS.length).getValues() : [];
  const subs = rows.map(r=>{ const o={}; ST.SUBS_HEADERS.forEach((h,i)=> o[h]=r[i]); return o; });

  const today = todayInTZ_(tz);
  const lead = Number(sets.leadDays || 7);

  const withDays = subs.map(s=>{
    const d = dateFromISOInTZ_(s.nextBillDate);
    if(!d) return {...s, daysUntil:null};
    const diff = Math.round((d - today)/86400000);
    return {...s, daysUntil: diff};
  });

  return {
    ok:true, settings:sets,
    overdue: withDays.filter(s=>s.daysUntil!==null && s.daysUntil<0),
    today:   withDays.filter(s=>s.daysUntil===0),
    soon:    withDays.filter(s=>s.daysUntil>0 && s.daysUntil<=lead)
  };
}

function sendReminder(){
  const data = getUpcoming();
  if(!data.ok) return {ok:false};
  const user = Session.getActiveUser().getEmail();
  const subj = '📌 Your subscription reminders';
  let body = 'Here is your upcoming subscription activity:\n\n';

  function section(title, arr){
    if(!arr.length) return;
    body += title+':\n';
    arr.forEach(s=>{
      body += ` - ${s.name} (${s.category||''}) ${(s.currency||'')}${Number(s.amount||0).toFixed(2)}, next: ${s.nextBillDate||''}\n`;
    });
    body+='\n';
  }
  section('Overdue', data.overdue);
  section('Today', data.today);
  section('Due soon', data.soon);

  if(body==='Here is your upcoming subscription activity:\n\n') body+='Nothing due 🎉';

  GmailApp.sendEmail(user, subj, body);
  return {ok:true, to:user, counts:{overdue:data.overdue.length, today:data.today.length, soon:data.soon.length}};
}

/** ===== Triggers (enable/disable daily reminder) ===== */
function createDailyReminderTrigger() {
  deleteDailyReminderTrigger();
  ScriptApp.newTrigger('sendReminder')
    .timeBased()
    .atHour(9)           // 09:00 in the project timezone
    .everyDays(1)
    .create();
  SpreadsheetApp.getActive().toast('Daily reminder trigger set for 09:00', 'Subscription Tracker', 3);
}

function deleteDailyReminderTrigger() {
  const all = ScriptApp.getProjectTriggers();
  all.forEach(t => {
    if (t.getHandlerFunction && t.getHandlerFunction() === 'sendReminder') {
      ScriptApp.deleteTrigger(t);
    }
  });
  SpreadsheetApp.getActive().toast('Removed sendReminder triggers (if any).', 'Subscription Tracker', 3);
}

/** ===== Diagnostics ===== */
function ping(){ return { ok:true, now: now_(), tz: ST.TZ, version: ST.VERSION }; }
function debugInfo(){
  ensureSetup_();
  const subs = sheet_(ST.SUBS_SHEET);
  const sets = sheet_(ST.SETTINGS_SHEET);
  return {
    ok:true,
    version: ST.VERSION,
    subsRows: subs.getLastRow(),
    subsCols: subs.getLastColumn(),
    settingsRows: sets.getLastRow(),
    settingsCols: sets.getLastColumn(),
    headersMatch: subs.getRange(1,1,1,ST.SUBS_HEADERS.length).getValues()[0].join('|') === ST.SUBS_HEADERS.join('|')
  };
}
