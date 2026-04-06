import { NextResponse } from 'next/server';
import { getSheetValues } from '../google-sheets';

const SPREADSHEET_ID = process.env.GOOGLE_SHEET_ID!;

export async function GET() {
  // 開発環境では、環境変数が設定されていない場合、モックデータを返す
  if (process.env.NODE_ENV !== 'production' && !process.env.GOOGLE_SHEET_ID) {
    console.log('Development mode: Returning mock settings.');
    return NextResponse.json({
      enabled: true,
      eventApplicationStart: '2026-01-01T00:00:00.000Z',
      eventApplicationEnd: '2026-12-31T23:59:59.000Z',
      teamRegistrationEnd: '2026-12-31T23:59:59.000Z',
      submissionDeadline: '2026-12-31T23:59:59.000Z',
    });
  }

  try {
    // スプレッドシートの 'Settings' シートから設定を取得
    const rows = await getSheetValues(SPREADSHEET_ID, 'Settings!A:B');
    
    if (!rows || rows.length === 0) {
      return NextResponse.json({ enabled: false });
    }

    const settings: any = { enabled: true };
    rows.forEach(row => {
      if (row[0] && row[1]) {
        // 値が "true"/"false" の場合は boolean に変換
        let value: any = row[1];
        if (value === 'true') value = true;
        if (value === 'false') value = false;
        settings[row[0]] = value;
      }
    });

    return NextResponse.json(settings);
  } catch (error) {
    console.error('Settings API Error:', error);
    // エラー時はデフォルト設定を返すか、enabled: false を返す
    return NextResponse.json({ enabled: false });
  }
}
