import { NextResponse } from 'next/server';

const GAS_WEBAPP_URL = process.env.GAS_WEBAPP_URL;

// 日本時間（JST）のタイムゾーンオフセット（+9時間）
const JST_OFFSET = 9 * 60 * 60 * 1000;

/**
 * ISO 8601 文字列を日本時間の Date オブジェクトに変換
 */
function parseJSTDate(isoString: string): Date {
  const utcDate = new Date(isoString);
  return new Date(utcDate.getTime() + JST_OFFSET);
}

export async function GET() {
  // 開発環境では、環境変数が設定されていない場合、モックデータを返す
  if (process.env.NODE_ENV !== 'production' && !GAS_WEBAPP_URL) {
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
    if (!GAS_WEBAPP_URL) {
      return NextResponse.json({ enabled: false });
    }

    // GAS Web アプリから設定情報を取得
    const response = await fetch(GAS_WEBAPP_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ type: 'get_settings' }),
    });

    if (!response.ok) {
      console.error(`GAS Web App responded with status ${response.status}`);
      return NextResponse.json({ enabled: false });
    }

    const result = await response.json();
    const settings = result.data || { enabled: false };

    // 日時フィールドが ISO 8601 形式であることを確認
    if (settings.eventApplicationStart) {
      settings.eventApplicationStart = new Date(settings.eventApplicationStart).toISOString();
    }
    if (settings.eventApplicationEnd) {
      settings.eventApplicationEnd = new Date(settings.eventApplicationEnd).toISOString();
    }
    if (settings.teamRegistrationEnd) {
      settings.teamRegistrationEnd = new Date(settings.teamRegistrationEnd).toISOString();
    }
    if (settings.submissionDeadline) {
      settings.submissionDeadline = new Date(settings.submissionDeadline).toISOString();
    }

    return NextResponse.json(settings);

  } catch (error: any) {
    console.error('Settings API Error:', error.message);
    return NextResponse.json({ enabled: false });
  }
}
