function doPost(e) {
  try {
    var payload = parsePayload_(e);
    var debug = PropertiesService.getScriptProperties().getProperty("DEBUG_MODE") === "true";

    // Honeypot: if this hidden field is filled, silently accept and stop.
    if (payload.website) {
      return corsJsonResponse_({ ok: true, message: "Received." });
    }

    validatePayload_(payload);
    appendLeadToSheet_(payload);
    sendLeadEmail_(payload);

    return corsJsonResponse_({ ok: true, message: "Lead captured." });
  } catch (err) {
    var msg = err.message || "Unexpected error.";
    Logger.log("Lead Capture Error: " + msg);
    return corsJsonResponse_({ ok: false, message: msg });
  }
}

function doOptions(e) {
  return corsJsonResponse_({ ok: true });
}

function parsePayload_(e) {
  var raw = (e && e.postData && e.postData.contents) ? e.postData.contents : "{}";
  var payload = {};

  try {
    payload = JSON.parse(raw);
  } catch (jsonErr) {
    payload = {};
  }

  var phoneNumber = payload.phoneNumber || payload.phone || payload["phone-number"] || payload.parentPhone || "";
  var emailAddress = payload.emailAddress || payload.email || payload["email-address"] || payload.parentEmail || "";

  return {
    parentName: String(payload.parentName || "").trim(),
    studentName: String(payload.studentName || "").trim(),
    phoneNumber: String(phoneNumber || "").trim(),
    emailAddress: String(emailAddress || "").trim(),
    studentStage: String(payload.studentStage || "").trim(),
    referralSource: String(payload.referralSource || "").trim(),
    website: String(payload.website || "").trim(),
    formLoadedAt: String(payload.formLoadedAt || "").trim(),
    submittedAt: String(payload.submittedAt || new Date().toISOString()).trim(),
    pageUrl: String(payload.pageUrl || "").trim(),
    timeZone: String(payload.timeZone || "").trim()
  };
}

function validatePayload_(payload) {
  if (!payload.parentName) {
    throw new Error("Parent name is required.");
  }
  if (!payload.studentName) {
    throw new Error("Student name is required.");
  }
  if (!payload.studentStage) {
    throw new Error("Student stage is required.");
  }
}

function appendLeadToSheet_(payload) {
  var sheetId = getScriptPropertyOrThrow_("LEAD_SHEET_ID");
  var sheetName = PropertiesService.getScriptProperties().getProperty("LEAD_SHEET_NAME") || "Leads";
  var ss = SpreadsheetApp.openById(sheetId);
  var sheet = ss.getSheetByName(sheetName) || ss.insertSheet(sheetName);

  if (sheet.getLastRow() === 0) {
    sheet.appendRow([
      "Timestamp",
      "Parent Name",
      "Student Name",
      "Phone Number",
      "Email Address",
      "Student Stage",
      "Referral Source",
      "Submitted At",
      "Time Zone",
      "Page URL"
    ]);
  }

  sheet.appendRow([
    new Date(),
    payload.parentName,
    payload.studentName,
    payload.phoneNumber,
    payload.emailAddress,
    payload.studentStage,
    payload.referralSource,
    payload.submittedAt,
    payload.timeZone,
    payload.pageUrl
  ]);
}

function sendLeadEmail_(payload) {
  var to = getScriptPropertyOrThrow_("LEAD_RECIPIENT_EMAIL");
  var subject = "Lead Capture";
  var body = [
    "New website lead captured:",
    "",
    "Parent Name: " + payload.parentName,
    "Student Name: " + payload.studentName,
    "Phone Number: " + payload.phoneNumber,
    "Email Address: " + payload.emailAddress,
    "Student Stage: " + payload.studentStage,
    "Referral Source: " + payload.referralSource,
    "Submitted At: " + payload.submittedAt,
    "Time Zone: " + payload.timeZone,
    "Page URL: " + payload.pageUrl
  ].join("\n");

  MailApp.sendEmail({
    to: to,
    subject: subject,
    body: body
  });
}

function getScriptPropertyOrThrow_(key) {
  var value = PropertiesService.getScriptProperties().getProperty(key);
  if (!value) {
    throw new Error("Missing Script Property: " + key);
  }
  return value;
}

function jsonResponse_(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

function corsJsonResponse_(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON)
    .addHeader("Access-Control-Allow-Origin", "*")
    .addHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
    .addHeader("Access-Control-Allow-Headers", "Content-Type, X-Requested-With");
}
