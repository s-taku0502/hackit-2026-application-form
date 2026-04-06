import { google } from 'googleapis';

const SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];

async function getSheetsClient() {
  // 環境変数が未設定の場合はnullを返す
  if (!process.env.GOOGLE_CLIENT_EMAIL || !process.env.GOOGLE_PRIVATE_KEY) {
    console.warn('Google Sheets credentials not configured. Using mock mode.');
    return null;
  }

  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: process.env.GOOGLE_CLIENT_EMAIL,
      private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    },
    scopes: SCOPES,
  });
  return google.sheets({ version: 'v4', auth });
}

export async function appendToSheet(spreadsheetId: string, range: string, values: any[][]) {
  const sheets = await getSheetsClient();
  
  if (!sheets || !spreadsheetId) {
    console.log('Mock mode: appendToSheet called with', { range, values });
    return { ok: true };
  }

  try {
    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range,
      valueInputOption: 'RAW',
      requestBody: {
        values,
      },
    });
  } catch (error) {
    console.error('Error appending to sheet:', error);
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
  } catch (error) {
    console.error('Error getting sheet values:', error);
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
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range,
      valueInputOption: 'RAW',
      requestBody: {
        values,
      },
    });
  } catch (error) {
    console.error('Error updating sheet row:', error);
    throw error;
  }
}
