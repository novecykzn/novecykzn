import { google } from "googleapis";

let cachedAuth: InstanceType<typeof google.auth.JWT> | null = null;

function getJwt() {
  if (cachedAuth) return cachedAuth;
  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const key = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n");
  if (!email || !key) return null;
  cachedAuth = new google.auth.JWT({
    email,
    key,
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });
  return cachedAuth;
}

/**
 * Appends a row to the configured sheet. Returns 1-based row index of appended range (if available).
 */
export async function appendApplicationRow(row: (string | number)[]) {
  const jwt = getJwt();
  const sheetId = process.env.GOOGLE_SHEET_ID;
  if (!jwt || !sheetId) {
    console.warn("[sheets] Missing GOOGLE_* env; skipping sync");
    return { skipped: true as const };
  }
  await jwt.authorize();
  const sheets = google.sheets({ version: "v4", auth: jwt });
  const res = await sheets.spreadsheets.values.append({
    spreadsheetId: sheetId,
    range: "Applications!A:Z",
    valueInputOption: "USER_ENTERED",
    requestBody: { values: [row] },
  });
  const updated = res.data.updates?.updatedRange;
  const rowMatch = updated?.match(/(\d+)$/);
  const rowNumber = rowMatch ? parseInt(rowMatch[1], 10) : undefined;
  return { rowId: rowNumber != null ? String(rowNumber) : undefined };
}
