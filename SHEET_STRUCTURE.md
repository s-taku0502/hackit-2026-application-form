# Google Sheets 構成ガイド

このドキュメントでは、HacKit 2026 申し込みフォーム用のスプレッドシート構成を詳しく説明します。

## 概要

スプレッドシートには以下の3つのシートが必要です：
1. **Events** - チーム申し込みデータ
2. **Personal** - 個人申し込みデータ
3. **Settings** - イベント設定情報

---

## Events シート（チーム申し込み）

### ヘッダー行（1行目）

以下のカラムをこの順序で設定してください：

| 列 | カラム名 | 説明 |
|----|---------|------|
| A | submittedAt | 申し込み日時（ISO 8601形式） |
| B | projectName | プロジェクト名 |
| C | teamSize | チームサイズ |
| D | leaderName | リーダー名 |
| E | leaderEmail | リーダーメール |
| F | hasFirstYear | 1年生を含むか（yes/no） |
| G | teamDescription | チーム説明 |
| H | agreeCancel | 同意：キャンセル規約（true/false） |
| I | agreePrivacy | 同意：プライバシーポリシー（true/false） |
| J | agreeShare | 同意：情報共有（true/false） |
| K | agreeLottery | 同意：抽選（true/false） |
| L | hasAllergy | アレルギー有無（yes/no） |
| M | allergyDetail | アレルギー詳細 |
| N | member01_class | メンバー1の学年クラス |
| O | member01_number | メンバー1の学籍番号 |
| P | member01_name | メンバー1の名前 |
| Q | member01_furigana | メンバー1のふりがな |
| R | member01_githubUrl | メンバー1の GitHub URL |
| S | member01_gender | メンバー1の性別 |
| T | member02_class | メンバー2の学年クラス |
| U | member02_number | メンバー2の学籍番号 |
| V | member02_name | メンバー2の名前 |
| W | member02_furigana | メンバー2のふりがな |
| X | member02_githubUrl | メンバー2の GitHub URL |
| Y | member02_gender | メンバー2の性別 |
| Z | member03_class | メンバー3の学年クラス |
| AA | member03_number | メンバー3の学籍番号 |
| AB | member03_name | メンバー3の名前 |
| AC | member03_furigana | メンバー3のふりがな |
| AD | member03_githubUrl | メンバー3の GitHub URL |
| AE | member03_gender | メンバー3の性別 |
| AF | member04_class | メンバー4の学年クラス |
| AG | member04_number | メンバー4の学籍番号 |
| AH | member04_name | メンバー4の名前 |
| AI | member04_furigana | メンバー4のふりがな |
| AJ | member04_githubUrl | メンバー4の GitHub URL |
| AK | member04_gender | メンバー4の性別 |
| AL | member05_class | メンバー5の学年クラス |
| AM | member05_number | メンバー5の学籍番号 |
| AN | member05_name | メンバー5の名前 |
| AO | member05_furigana | メンバー5のふりがな |
| AP | member05_githubUrl | メンバー5の GitHub URL |
| AQ | member05_gender | メンバー5の性別 |
| AR | productName | プロダクト名 |
| AS | teamPassphrase | チーム合言葉 |
| AT | githubUrl | GitHub URL（メイン） |
| AU | githubUrlSub | GitHub URL（サブ） |
| AV | publicSite | 公開サイト URL |
| AW | publicSiteSub | 公開サイト URL（サブ） |

### 重要なポイント

- **メンバー情報は個別カラムに展開**: JSON形式ではなく、各メンバーの情報が個別のカラムに入ります
- **最大5名まで対応**: `member01` から `member05` まで
- **入力されなかったメンバーは空**: 3人で登録した場合、`member04` と `member05` のカラムは空のままになります
- **同意事項は個別カラム**: `agreeCancel`, `agreePrivacy`, `agreeShare`, `agreeLottery` は個別のカラムに `true` または `false` で保存されます
- **アレルギー情報は個別カラム**: `hasAllergy` と `allergyDetail` は個別のカラムに保存されます

### 例：3人チームの場合

```
A: 2026-04-07T15:30:40.000Z
B: MyAwesomeProject
C: 3
D: 田中太郎
E: c1234567@st.kanazawa-it.ac.jp
F: yes
G: 素晴らしいプロジェクトです
H: TRUE
I: TRUE
J: TRUE
K: TRUE
L: no
M: 
N: 1年A組
O: 1234567
P: 田中太郎
Q: たなかたろう
R: https://github.com/tanaka
S: male
T: 2年B組
U: 2345678
V: 鈴木花子
W: すずきはなこ
X: https://github.com/suzuki
Y: female
Z: 3年C組
AA: 3456789
AB: 佐藤次郎
AC: さとうじろう
AD: https://github.com/sato
AE: male
AF: (空)
AG: (空)
...
```

---

## Personal シート（個人申し込み）

### ヘッダー行（1行目）

以下のカラムをこの順序で設定してください：

| 列 | カラム名 | 説明 |
|----|---------|------|
| A | submittedAt | 申し込み日時（ISO 8601形式） |
| B | projectName | プロジェクト名 |
| C | gradeClass | 学年クラス |
| D | studentId | 学籍番号 |
| E | name | 名前 |
| F | furigana | ふりがな |
| G | gender | 性別 |
| H | leaderName | リーダー名 |
| I | leaderEmail | リーダーメール |
| J | hasHackathonExperience | ハッカソン経験有無（yes/no） |
| K | experienceDetail | 経験詳細 |
| L | technologies | 使用技術（カンマ区切り） |
| M | agreeCancel | 同意：キャンセル規約（true/false） |
| N | agreePrivacy | 同意：プライバシーポリシー（true/false） |
| O | agreeShare | 同意：情報共有（true/false） |
| P | agreeLottery | 同意：抽選（true/false） |
| Q | hasAllergy | アレルギー有無（yes/no） |
| R | allergyDetail | アレルギー詳細 |

### 例

```
A: 2026-04-07T15:30:40.000Z
B: MyAwesomeProject
C: 1年A組
D: 1234567
E: 田中太郎
F: たなかたろう
G: male
H: 田中太郎
I: c1234567@st.kanazawa-it.ac.jp
J: yes
K: 去年のハッカソンで優勝しました
L: JavaScript, Python, React
M: TRUE
N: TRUE
O: TRUE
P: TRUE
Q: no
R: 
```

### 重要なポイント

- **technologies はカンマ区切り**: 配列ではなく、カンマで区切られた文字列として保存されます
- **同意事項は個別カラム**: `agreeCancel`, `agreePrivacy`, `agreeShare`, `agreeLottery` は個別のカラムに `true` または `false` で保存されます
- **アレルギー情報は個別カラム**: `hasAllergy` と `allergyDetail` は個別のカラムに保存されます

---

## Settings シート（設定情報）

### ヘッダー行（1行目）

| 列 | カラム名 | 説明 |
|----|---------|------|
| A | キー名 | 設定項目の名前 |
| B | 値 | 設定値 |

### 必須の設定項目

以下の4つの行を設定してください：

```
eventApplicationStart | 2026-01-01T00:00:00.000Z
eventApplicationEnd | 2026-12-31T23:59:59.000Z
teamRegistrationEnd | 2026-12-31T23:59:59.000Z
submissionDeadline | 2026-12-31T23:59:59.000Z
```

### 注意事項

- **日時形式**: ISO 8601形式（`YYYY-MM-DDTHH:mm:ss.sssZ`）で設定してください
- **タイムゾーン**: UTC（Z）で統一してください
- **追加の設定**: 必要に応じて、追加の行を追加できます

---

## セットアップチェックリスト

スプレッドシートをセットアップする際は、以下を確認してください：

- [ ] **Events** シートが作成されている
- [ ] **Personal** シートが作成されている
- [ ] **Settings** シートが作成されている
- [ ] Events シートのヘッダー行が正確に設定されている（A～AW）
- [ ] Personal シートのヘッダー行が正確に設定されている（A～R）
- [ ] Settings シートに4つの必須設定項目が入力されている
- [ ] Google Apps Script の `SPREADSHEET_ID` が正しく設定されている
- [ ] GAS Web アプリがデプロイされている
- [ ] `.env.local` に `GAS_WEBAPP_URL` が設定されている

---

## トラブルシューティング

### Q: データが正しく保存されていません
**A**: 以下を確認してください：
1. スプレッドシートのヘッダー行が正確に設定されているか
2. カラムの順番が正しいか（このドキュメントと一致しているか）
3. Google Apps Script のログに エラーメッセージが出ていないか

### Q: メンバー情報がずれて表示されます
**A**: Events シートのヘッダー行を確認してください。特に以下の点を確認：
- 列 A～M が基本情報で埋まっているか
- 列 N～S が `member01_*` で埋まっているか
- 列 T～Y が `member02_*` で埋まっているか

### Q: 個人申し込みのふりがなが保存されません
**A**: Personal シートのヘッダー行を確認してください。列 F に `furigana` が設定されているか確認してください。

### Q: 同意事項がJSON形式で保存されています
**A**: GAS コードを最新版に更新してください。同意事項は個別のカラムに `true` または `false` で保存されるようになりました。

---

## 参考資料

- [Google Apps Script 公式ドキュメント](https://developers.google.com/apps-script)
- [Google Sheets API](https://developers.google.com/sheets/api)
