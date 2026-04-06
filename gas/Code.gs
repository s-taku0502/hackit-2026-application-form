// Google Apps Script (GAS) コード
// スプレッドシートに直接データを保存するWebアプリ

// スプレッドシートのID（後で設定）
const SPREADSHEET_ID = ''; // 環境変数から取得するか、ここに直接指定

// 許可するオリジン（CORS対応）
const ALLOWED_ORIGINS = [
  'http://localhost:3000',
  'http://localhost:3001',
  // 本番環境のURLを追加
  // 'https://your-domain.com'
];

/**
 * POST リクエストを処理する
 * @param {Object} e - イベントオブジェクト
 */
function doPost(e) {
  try {
    // CORSプリフライトリクエストに対応
    const origin = e.parameter.origin || 'unknown';
    const headers = {
      'Access-Control-Allow-Origin': ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0],
      'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Content-Type': 'application/json; charset=utf-8'
    };

    // リクエストボディをパース
    const payload = JSON.parse(e.postData.contents);
    const { type, data } = payload;

    Logger.log('Received request:', { type, data });

    let result;

    if (type === 'event') {
      // チーム申し込みデータを保存
      result = saveEventData(data);
    } else if (type === 'personal') {
      // 個人申し込みデータを保存
      result = savePersonalData(data);
    } else if (type === 'team_update') {
      // チーム情報更新
      result = updateTeamData(data);
    } else if (type === 'get_teams') {
      // チーム一覧を取得
      result = getTeams();
    } else if (type === 'get_settings') {
      // 設定情報を取得
      result = getSettings();
    } else {
      result = { ok: false, error: 'Unknown request type' };
    }

    return ContentService
      .createTextOutput(JSON.stringify(result))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    Logger.log('Error:', error.toString());
    return ContentService
      .createTextOutput(JSON.stringify({
        ok: false,
        error: error.toString()
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * OPTIONS リクエストを処理（CORS プリフライト）
 */
function doGet(e) {
  return ContentService
    .createTextOutput(JSON.stringify({ ok: true, message: 'GAS Web App is running' }))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * チーム申し込みデータを保存
 * メンバー情報を個別カラムに展開（member01_class, member01_number, member01_name, member01_furigana, member01_githubUrl, member01_gender ... member05_gender）
 */
function saveEventData(data) {
  try {
    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName('Events');
    if (!sheet) {
      return { ok: false, error: 'Events sheet not found' };
    }

    // メンバー情報を個別カラムに展開
    const memberColumns = [];
    for (let i = 1; i <= 5; i++) {
      const member = data.members && data.members[i - 1] ? data.members[i - 1] : {};
      memberColumns.push(
        member.gradeClass || '',
        member.studentId || '',
        member.name || '',
        member.furigana || '',
        member.githubUrl || '',
        member.gender || ''
      );
    }

    const row = [
      data.submittedAt,
      data.projectName,
      data.teamSize,
      data.leaderName,
      data.leaderEmail,
      data.hasFirstYear,
      data.teamDescription,
      JSON.stringify(data.agreements),
      JSON.stringify(data.allergy),
      ...memberColumns,
    ];

    sheet.appendRow(row);
    Logger.log('Event data saved successfully');
    return { ok: true, message: 'Event data saved' };
  } catch (error) {
    Logger.log('Error saving event data:', error.toString());
    return { ok: false, error: error.toString() };
  }
}

/**
 * 個人申し込みデータを保存
 * ふりがなフィールドを含む
 */
function savePersonalData(data) {
  try {
    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName('Personal');
    if (!sheet) {
      return { ok: false, error: 'Personal sheet not found' };
    }

    const row = [
      data.submittedAt,
      data.projectName,
      data.gradeClass,
      data.studentId,
      data.name,
      data.furigana,
      data.gender,
      data.leaderName,
      data.leaderEmail,
      data.hasHackathonExperience,
      data.experienceDetail,
      JSON.stringify(data.technologies),
      JSON.stringify(data.agreements),
      JSON.stringify(data.allergy),
    ];

    sheet.appendRow(row);
    Logger.log('Personal data saved successfully');
    return { ok: true, message: 'Personal data saved' };
  } catch (error) {
    Logger.log('Error saving personal data:', error.toString());
    return { ok: false, error: error.toString() };
  }
}

/**
 * チーム情報を更新
 */
function updateTeamData(data) {
  try {
    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName('Events');
    if (!sheet) {
      return { ok: false, error: 'Events sheet not found' };
    }

    // チーム名で既存行を検索
    const values = sheet.getDataRange().getValues();
    const teamNameColumnIndex = 1; // B列（0-indexed）

    let rowIndex = -1;
    for (let i = 1; i < values.length; i++) {
      if (values[i][teamNameColumnIndex] === data.teamName) {
        rowIndex = i + 1; // シートの行番号は1-indexed
        break;
      }
    }

    if (rowIndex !== -1) {
      // 既存行を更新（プロダクト情報など）
      // 列の位置は Events シートの構成に応じて調整
      const range = sheet.getRange(rowIndex, 31, 1, 6); // AA列から6列分
      range.setValues([[
        data.productName || '',
        data.teamPassphrase || '',
        data.githubUrl || '',
        data.githubUrlBackup || '',
        data.publicSite || '',
        data.publicSiteBackup || '',
      ]]);
      Logger.log('Team data updated successfully');
    } else {
      // 新規行を追加
      const memberColumns = [];
      for (let i = 1; i <= 5; i++) {
        const member = data.members && data.members[i - 1] ? data.members[i - 1] : {};
        memberColumns.push(
          member.gradeClass || '',
          member.studentId || '',
          member.name || '',
          member.furigana || '',
          member.githubUrl || '',
          member.gender || ''
        );
      }

      const row = [
        data.submittedAt,
        data.teamName,
        '', // teamSize
        data.leaderName,
        data.leaderEmail,
        '', // hasFirstYear
        '', // teamDescription
        '', // agreements
        '', // allergy
        ...memberColumns,
        data.productName || '',
        data.teamPassphrase || '',
        data.githubUrl || '',
        data.githubUrlBackup || '',
        data.publicSite || '',
        data.publicSiteBackup || '',
      ];
      sheet.appendRow(row);
      Logger.log('Team data added as new row');
    }

    return { ok: true, message: 'Team data updated' };
  } catch (error) {
    Logger.log('Error updating team data:', error.toString());
    return { ok: false, error: error.toString() };
  }
}

/**
 * チーム一覧を取得
 */
function getTeams() {
  try {
    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName('Events');
    if (!sheet) {
      return { ok: false, error: 'Events sheet not found' };
    }

    const values = sheet.getDataRange().getValues();
    if (values.length <= 1) {
      return { ok: true, data: [] };
    }

    // ヘッダーを取得
    const headers = values[0];
    const teams = [];

    // データ行をオブジェクトに変換
    for (let i = 1; i < values.length; i++) {
      const obj = {};
      headers.forEach((header, index) => {
        obj[header] = values[i][index];
      });
      teams.push(obj);
    }

    return { ok: true, data: teams };
  } catch (error) {
    Logger.log('Error getting teams:', error.toString());
    return { ok: false, error: error.toString() };
  }
}

/**
 * 設定情報を取得
 */
function getSettings() {
  try {
    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName('Settings');
    if (!sheet) {
      return { ok: false, error: 'Settings sheet not found' };
    }

    const values = sheet.getDataRange().getValues();
    const settings = { enabled: true };

    // キーと値のペアをオブジェクトに変換
    for (let i = 0; i < values.length; i++) {
      const key = values[i][0];
      let value = values[i][1];

      // 値が "true"/"false" の場合は boolean に変換
      if (value === 'true') value = true;
      if (value === 'false') value = false;

      if (key) {
        settings[key] = value;
      }
    }

    return { ok: true, data: settings };
  } catch (error) {
    Logger.log('Error getting settings:', error.toString());
    return { ok: false, error: error.toString() };
  }
}
