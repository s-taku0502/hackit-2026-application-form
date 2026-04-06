import { NextResponse } from 'next/server';

const GAS_WEBAPP_URL = process.env.GAS_WEBAPP_URL;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { type, data } = body;

    if (!GAS_WEBAPP_URL) {
      console.warn('GAS_WEBAPP_URL not configured. Using mock mode.');
      console.log('Mock mode - Request:', { type, data });
      return NextResponse.json({ ok: true, warning: 'GAS Web App not configured' });
    }

    // GAS Web アプリに POST リクエストを送信
    const response = await fetch(GAS_WEBAPP_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Origin': new URL(request.url).origin,
      },
      body: JSON.stringify({ type, data }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`GAS Web App responded with status ${response.status}:`, errorText);
      return NextResponse.json(
        { ok: false, error: `GAS Web App error: ${response.status}` },
        { status: 500 }
      );
    }

    const result = await response.json();
    return NextResponse.json(result);

  } catch (error: any) {
    console.error('Submit API Error:', error.message);
    return NextResponse.json(
      { ok: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    if (!GAS_WEBAPP_URL) {
      console.warn('GAS_WEBAPP_URL not configured. Returning empty list.');
      return NextResponse.json([]);
    }

    // GAS Web アプリから チーム一覧を取得
    const response = await fetch(GAS_WEBAPP_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ type: 'get_teams' }),
    });

    if (!response.ok) {
      console.error(`GAS Web App responded with status ${response.status}`);
      return NextResponse.json([]);
    }

    const result = await response.json();
    return NextResponse.json(result.data || []);

  } catch (error: any) {
    console.error('Submit GET API Error:', error.message);
    return NextResponse.json([]);
  }
}
