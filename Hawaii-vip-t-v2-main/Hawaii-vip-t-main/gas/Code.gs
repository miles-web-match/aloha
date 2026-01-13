/**
 * Hawaii VIP Concierge - Contact Form WebApp (Google Apps Script)
 *
 * ✅ 目的
 * 1) お問い合わせをスプレッドシートへ保存
 * 2) 管理者へ通知メール
 * 3) お客様へ自動返信メール
 *
 * ---- 事前準備 ----
 * 1) Googleスプレッドシートを作成
 * 2) シート名を `inquiries`（変更したい場合は SHEET_NAME を変更）
 * 3) Apps Script にこのコードを貼り付け
 * 4) スクリプトプロパティを設定（下記参照）
 *
 * ---- スクリプトプロパティ（必須）----
 * SPREADSHEET_ID : 保存先スプレッドシートID
 * ADMIN_EMAIL    : 通知先（あなたのメール）
 * FROM_NAME      : 自動返信の差出人名（例: Hawaii VIP Concierge）
 * REPLY_SUBJECT  : 自動返信の件名（任意）
 *
 * ---- デプロイ ----
 * 1) 「デプロイ」→「新しいデプロイ」→「ウェブアプリ」
 * 2) 実行するユーザー：自分
 * 3) アクセスできるユーザー：全員
 * 4) 発行されたURLをフロントの VITE_GAS_ENDPOINT に設定
 */

const SHEET_NAME = 'inquiries';

function doPost(e) {
  try {
    const raw = (e && e.postData && e.postData.contents) ? e.postData.contents : '';
    const data = raw ? JSON.parse(raw) : {};

    const props = PropertiesService.getScriptProperties();
    const ssId = props.getProperty('SPREADSHEET_ID');
    const adminEmail = props.getProperty('ADMIN_EMAIL');
    const fromName = props.getProperty('FROM_NAME') || 'Hawaii VIP Concierge';
    const replySubject = props.getProperty('REPLY_SUBJECT') || 'お問い合わせありがとうございます';

    if (!ssId) throw new Error('Missing SPREADSHEET_ID (Script Properties)');
    if (!adminEmail) throw new Error('Missing ADMIN_EMAIL (Script Properties)');

    const name = String(data.name || '').trim();
    const email = String(data.email || '').trim();
    const phone = String(data.phone || '').trim();
    const message = String(data.message || '').trim();
    const pageUrl = String(data.pageUrl || '').trim();
    const submittedAt = String(data.submittedAt || '').trim();

    // Save to Sheet
    const ss = SpreadsheetApp.openById(ssId);
    const sheet = ss.getSheetByName(SHEET_NAME) || ss.insertSheet(SHEET_NAME);

    // header
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(['receivedAt', 'name', 'email', 'phone', 'message', 'pageUrl', 'submittedAt']);
    }

    const receivedAt = new Date();
    sheet.appendRow([receivedAt, name, email, phone, message, pageUrl, submittedAt]);

    // Notify admin
    const adminSubject = `【新規問い合わせ】${name || '（お名前未入力）'}`;
    const adminBody =
      `新規お問い合わせが届きました。\n\n` +
      `■ お名前: ${name}\n` +
      `■ メール: ${email}\n` +
      `■ 電話番号: ${phone}\n` +
      `■ 内容:\n${message}\n\n` +
      `■ ページ: ${pageUrl}\n` +
      `■ submittedAt: ${submittedAt}\n` +
      `■ receivedAt: ${receivedAt}\n`;

    MailApp.sendEmail({
      to: adminEmail,
      subject: adminSubject,
      body: adminBody,
      replyTo: email || undefined,
      name: fromName,
    });

    // Auto-reply to customer (if email exists)
    if (email) {
      const replyBody =
        `${name || 'お客様'}\n\n` +
        `お問い合わせありがとうございます。\n` +
        `内容を確認のうえ、担当よりご連絡いたします。\n\n` +
        `---\n` +
        `【送信内容】\n` +
        `${message}\n` +
        `---\n\n` +
        `${fromName}\n`;

      MailApp.sendEmail({
        to: email,
        subject: replySubject,
        body: replyBody,
        name: fromName,
      });
    }

    return ContentService
      .createTextOutput(JSON.stringify({ ok: true }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ ok: false, error: String(err) }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
