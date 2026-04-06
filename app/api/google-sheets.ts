import { google } from 'googleapis';

const SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];

async function getSheetsClient() {
  const clientEmail = process.env.GOOGLE_CLIENT_EMAIL;
  const privateKey = process.env.GOOGLE_PRIVATE_KEY;

  // 環境変数が未設定の場合はnullを返す
  if (!clientEmail || !privateKey) {
    console.warn('Google Sheets credentials not configured. Using mock mode.');
    return null;
  }

  try {
    // 秘密鍵の改行コードを正しく処理する
    const formattedKey = privateKey.replace(/\\n/g, '\n');

    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: clientEmail,
        private_key: formattedKey,
      },
      scopes: SCOPES,
    });
    return google.sheets({ version: 'v4', auth });
  } catch (error) {
    console.error('Failed to initialize Google Sheets client:', error);
    throw error;
  }
}

export async function appendToSheet(spreadsheetId: string, range: string, values: any[][]) {
  const sheets = await getSheetsClient();
  
  if (!sheets || !spreadsheetId) {
    console.log('Mock mode: appendToSheet called with', { range, values });
    return { ok: true };
  }

  try {
    const result = await sheets.spreadsheets.values.append({
      spreadsheetId,
      range,
      valueInputOption: 'RAW',
      requestBody: {
        values,
      },
    });
    return result;
  } catch (error: any) {
    console.error(`Error appending to sheet (${range}):`, error.message);
    if (error.response && error.response.data) {
      console.error('Detailed error response:', JSON.stringify(error.response.data));
    }
    throw error;
  }
}

export async function getSheetValues(spreadsheetId: string, range: string) {
  const sheets = await getSheetsClient();
  
  if (!sheets || !spreadsheetId) {
    console.log('Mock mode: getSheetValues called with', { range });
    return [];
  }

  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range,
    });
    return response.data.values || [];
  } catch (error: any) {
    console.error(`Error getting sheet values (${range}):`, error.message);
    throw error;
  }
}

export async function updateSheetRow(spreadsheetId: string, range: string, values: any[][]) {
  const sheets = await getSheetsClient();
  
  if (!sheets || !spreadsheetId) {
    console.log('Mock mode: updateSheetRow called with', { range, values });
    return { ok: true };
  }

  try {
    const result = await sheets.spreadsheets.values.update({
      spreadsheetId,
      range,
      valueInputOption: 'RAW',
      requestBody: {
        values,
      },
    });
    return result;
  } catch (error: any) {
    console.error(`Error updating sheet row (${range}):`, error.message);
    throw error;
  }
}
