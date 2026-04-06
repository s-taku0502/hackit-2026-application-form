import { NextResponse } from 'next/server';
import { appendToSheet, getSheetValues, updateSheetRow } from '../google-sheets';

const SPREADSHEET_ID = process.env.GOOGLE_SHEET_ID;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { type, data } = body;

    if (!SPREADSHEET_ID) {
      console.warn('GOOGLE_SHEET_ID not configured. Data will not be persisted.');
      return NextResponse.json({ ok: true, warning: 'Google Sheets not configured' });
    }

    if (type === 'event') {
      // チーム申し込み
      const values = [
        [
          data.submittedAt,
          data.projectName,
          data.teamSize,
          data.leaderName,
          data.leaderEmail,
          data.hasFirstYear,
          data.teamDescription,
          JSON.stringify(data.members),
          JSON.stringify(data.agreements),
          JSON.stringify(data.allergy),
        ],
      ];
      await appendToSheet(SPREADSHEET_ID, 'Events!A:J', values);
    } else if (type === 'personal') {
      // 個人申し込み
      const values = [
        [
          data.submittedAt,
          data.projectName,
          data.name,
          data.studentId,
          data.gradeClass,
          data.leaderEmail,
          data.hasHackathonExperience,
          data.experienceDetail,
          JSON.stringify(data.technologies),
          JSON.stringify(data.agreements),
          JSON.stringify(data.allergy),
        ],
      ];
      await appendToSheet(SPREADSHEET_ID, 'Personal!A:K', values);
    } else if (type === 'team_update') {
      // チーム情報更新（プロダクト登録など）
      const rows = await getSheetValues(SPREADSHEET_ID, 'Events!A:Z');
      if (rows && rows.length > 0) {
        const teamNameIndex = 1; // B列がチーム名
        const rowIndex = rows.findIndex(row => row[teamNameIndex] === data.teamName);
        
        if (rowIndex !== -1) {
          const range = `Events!K${rowIndex + 1}:P${rowIndex + 1}`;
          const updateValues = [[
            data.productName || '',
            data.teamPassphrase || '',
            data.githubUrl || '',
            data.githubUrlBackup || '',
            data.publicSite || '',
            data.publicSiteBackup || '',
          ]];
          await updateSheetRow(SPREADSHEET_ID, range, updateValues);
        } else {
          const values = [[
            data.submittedAt,
            data.teamName,
            '', // teamSize
            data.leaderName,
            data.leaderEmail,
            '', // hasFirstYear
            '', // teamDescription
            '', // members
            '', // agreements
            '', // allergy
            data.productName || '',
            data.teamPassphrase || '',
            data.githubUrl || '',
            data.githubUrlBackup || '',
            data.publicSite || '',
            data.publicSiteBackup || '',
          ]];
          await appendToSheet(SPREADSHEET_ID, 'Events!A:P', values);
        }
      }
    }

    return NextResponse.json({ ok: true });
  } catch (error: any) {
    console.error('Submit API Error:', error.message);
    // クライアントに詳細なエラーを返す（デバッグ用）
    return NextResponse.json({ 
      ok: false, 
      error: error.message,
      details: error.response?.data?.error?.message || 'No detailed error message available'
    }, { status: 500 });
  }
}

export async function GET() {
  try {
    if (!SPREADSHEET_ID) {
      console.warn('GOOGLE_SHEET_ID not configured. Returning empty list.');
      return NextResponse.json([]);
    }

    const rows = await getSheetValues(SPREADSHEET_ID, 'Events!A:Z');
    if (!rows || rows.length === 0) return NextResponse.json([]);
    
    const headers = rows[0];
    const data = rows.slice(1).map(row => {
      const obj: any = {};
      headers.forEach((header: string, index: number) => {
        obj[header] = row[index];
      });
      return obj;
    });
    
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Submit GET API Error:', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
