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

// 日本時間（JST）のタイムゾーン
const JST_TIMEZONE = 'Asia/Tokyo';

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
 * UTC の ISO 8601 文字列を日本時間の日時文字列に変換
 * @param {string} isoString - ISO 8601 形式の文字列（例：2026-04-07T15:30:40.000Z）
 * @returns {string} 日本時間の文字列（例：2026/04/07 15:30:40）
 */
function convertToJST(isoString) {
  if (!isoString) return '';
  try {
    const date = new Date(isoString);
    const jstDate = Utilities.formatDate(date, JST_TIMEZONE, 'yyyy/MM/dd HH:mm:ss');
    return jstDate;
  } catch (error) {
    Logger.log('Error converting to JST:', error.toString());
    return isoString;
  }
}

/**
 * チーム申し込みデータを保存
 * Events シートのカラム順序（A～AW）:
 * A: submittedAt
 * B: projectName
 * C: teamSize
 * D: leaderName
 * E: leaderEmail
 * F: hasFirstYear
 * G: teamDescription
 * H: agreeCancel
 * I: agreePrivacy
 * J: agreeShare
 * K: agreeLottery
 * L: hasAllergy
 * M: allergyDetail
 * N-S: member01 (class, number, name, furigana, githubUrl, gender)
 * T-Y: member02 (class, number, name, furigana, githubUrl, gender)
 * Z-AE: member03 (class, number, name, furigana, githubUrl, gender)
 * AF-AK: member04 (class, number, name, furigana, githubUrl, gender)
 * AL-AQ: member05 (class, number, name, furigana, githubUrl, gender)
 * AR: productName
 * AS: teamPassphrase
 * AT: githubUrl
 * AU: githubUrlSub
 * AV: publicSite
 * AW: publicSiteSub
 */
function saveEventData(data) {
  try {
    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName('Events');
    if (!sheet) {
      return { ok: false, error: 'Events sheet not found' };
    }

    // メンバー情報を個別カラムに展開（最大5名）
    const memberColumns = [];
    for (let i = 1; i <= 5; i++) {
      const member = data.members && data.members[i - 1] ? data.members[i - 1] : {};
      memberColumns.push(
        member.gradeClass || '',      // class
        member.studentId || '',       // number
        member.name || '',            // name
        member.furigana || '',        // furigana
        member.githubUrl || '',       // githubUrl
        member.gender || ''           // gender
      );
    }

    // 基本情報 (A-M) - submittedAt は日本時間に変換
    const baseData = [
      convertToJST(data.submittedAt),  // 日本時間に変換
      data.projectName,
      data.teamSize,
      data.leaderName,
      data.leaderEmail,
      data.hasFirstYear,
      data.teamDescription,
      data.agreements.agreeCancel || false,
      data.agreements.agreePrivacy || false,
      data.agreements.agreeShare || false,
      data.agreements.agreeLottery || false,
      data.allergy.hasAllergy || '',
      data.allergy.allergyDetail || '',
    ];

    // プロダクト情報 (AR-AW)
    const productData = [
      data.productName || '',
      data.teamPassphrase || '',
      data.githubUrl || '',
      data.githubUrlBackup || '',
      data.publicSite || '',
      data.publicSiteBackup || '',
    ];

    // 全データを結合
    const row = [...baseData, ...memberColumns, ...productData];

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
 * Personal シートのカラム順序（A～R）:
 * A: submittedAt
 * B: projectName
 * C: gradeClass
 * D: studentId
 * E: name
 * F: furigana
 * G: gender
 * H: leaderName
 * I: leaderEmail
 * J: hasHackathonExperience
 * K: experienceDetail
 * L: technologies
 * M: agreeCancel
 * N: agreePrivacy
 * O: agreeShare
 * P: agreeLottery
 * Q: hasAllergy
 * R: allergyDetail
 */
function savePersonalData(data) {
  try {
    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName('Personal');
    if (!sheet) {
      return { ok: false, error: 'Personal sheet not found' };
    }

    // technologies は配列なので、カンマ区切りの文字列に変換
    const technologiesStr = Array.isArray(data.technologies) ? data.technologies.join(', ') : '';

    const row = [
      convertToJST(data.submittedAt),  // 日本時間に変換
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
      technologiesStr,
      data.agreements.agreeCancel || false,
      data.agreements.agreePrivacy || false,
      data.agreements.agreeShare || false,
      data.agreements.agreeLottery || false,
      data.allergy.hasAllergy || '',
      data.allergy.allergyDetail || '',
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
      // AR～AW列（列番号44～49）
      const range = sheet.getRange(rowIndex, 44, 1, 6);
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

      const baseData = [
        convertToJST(data.submittedAt),
        data.teamName,
        '', // teamSize
        data.leaderName,
        data.leaderEmail,
        '', // hasFirstYear
        '', // teamDescription
        '', // agreeCancel
        '', // agreePrivacy
        '', // agreeShare
        '', // agreeLottery
        '', // hasAllergy
        '', // allergyDetail
      ];

      const productData = [
        data.productName || '',
        data.teamPassphrase || '',
        data.githubUrl || '',
        data.githubUrlBackup || '',
        data.publicSite || '',
        data.publicSiteBackup || '',
      ];

      const row = [...baseData, ...memberColumns, ...productData];
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
 * Settings シートは横並び構成（1行目がキー、2行目が値）
 * A1: eventApplicationStart, B1: eventApplicationEnd, C1: teamRegistrationEnd, D1: submissionDeadline
 * A2: 2026-01-01T00:00:00Z, B2: 2026-12-31T23:59:59Z, C2: ..., D2: ...
 */
function getSettings() {
  try {
    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName('Settings');
    if (!sheet) {
      return { ok: false, error: 'Settings sheet not found' };
    }

    const values = sheet.getDataRange().getValues();
    if (values.length < 2) {
      return { ok: false, error: 'Settings sheet is empty' };
    }

    // 1行目がキー、2行目が値の横並び構成
    const keys = values[0];
    const vals = values[1];

    const settings = { enabled: true };

    // キーと値をマッピング
    for (let i = 0; i < keys.length; i++) {
      const key = keys[i];
      let value = vals[i];

      if (!key) continue;

      // 日時文字列の場合、ISO 8601 形式に統一
      if (typeof value === 'string' && (key.includes('Start') || key.includes('End') || key.includes('Deadline'))) {
        // 既に ISO 8601 形式の場合はそのまま使用
        if (value.includes('T')) {
          settings[key] = value;
        } else {
          // 日本時間の文字列の場合は ISO 8601 に変換
          try {
            const date = new Date(value);
            settings[key] = date.toISOString();
          } catch (e) {
            Logger.log('Error parsing date:', value);
            settings[key] = value;
          }
        }
      } else {
        // 値が "true"/"false" の場合は boolean に変換
        if (value === 'true') value = true;
        if (value === 'false') value = false;
        settings[key] = value;
      }
    }

    Logger.log('Settings retrieved:', settings);
    return { ok: true, data: settings };
  } catch (error) {
    Logger.log('Error getting settings:', error.toString());
    return { ok: false, error: error.toString() };
  }
}
