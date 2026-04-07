// ============================================================
// Cloudflare Worker: photo-wedding-inquiry
// デプロイ先: worker-autumn-cell-1da9.mk-cbe.workers.dev
// 環境変数: RESEND_API_KEY（Cloudflareダッシュボードで設定済み）
// ============================================================

export default {
  async fetch(request, env) {
    const cors = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    };

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: cors });
    }

    if (request.method !== 'POST') {
      return new Response('Method not allowed', { status: 405, headers: cors });
    }

    try {
      const d = await request.json();
      const to = (d['ご希望会場'] || '').includes('ALCAZAR')
        ? 'info@avvio.jp'
        : 'info-gtf@memolead.co.jp';

      const htmlBody = `
        <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:20px;">
          <h2 style="color:#5c4a36;border-bottom:2px solid #b89760;padding-bottom:8px;">
            📋 仮予約・お問合せ受信
          </h2>
          <table style="width:100%;border-collapse:collapse;margin-top:16px;">
            <tr style="background:#f8f3ec;">
              <th style="text-align:left;padding:10px 14px;color:#888;font-size:12px;width:40%;">お名前</th>
              <td style="padding:10px 14px;font-weight:bold;">${d['お名前'] || '—'}</td>
            </tr>
            <tr>
              <th style="text-align:left;padding:10px 14px;color:#888;font-size:12px;">お電話番号</th>
              <td style="padding:10px 14px;">${d['お電話番号'] || '—'}</td>
            </tr>
            <tr style="background:#f8f3ec;">
              <th style="text-align:left;padding:10px 14px;color:#888;font-size:12px;">メールアドレス</th>
              <td style="padding:10px 14px;">${d['メールアドレス'] || '—'}</td>
            </tr>
            <tr>
              <th style="text-align:left;padding:10px 14px;color:#888;font-size:12px;">ご希望会場</th>
              <td style="padding:10px 14px;">${d['ご希望会場'] || '—'}</td>
            </tr>
            <tr style="background:#f8f3ec;">
              <th style="text-align:left;padding:10px 14px;color:#888;font-size:12px;">ご希望プラン</th>
              <td style="padding:10px 14px;">${d['ご希望プラン'] || '—'}</td>
            </tr>
            <tr>
              <th style="text-align:left;padding:10px 14px;color:#888;font-size:12px;">ご要望・ご質問</th>
              <td style="padding:10px 14px;">${d['ご要望'] || '—'}</td>
            </tr>
          </table>
          <p style="margin-top:20px;font-size:12px;color:#aaa;">
            送信元：フォトウエディングLP チャットボット
          </p>
        </div>`;

      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${env.RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: 'フォトウエディング <noreply@nfz33.com>',
          to: [to],
          reply_to: (d['メールアドレス'] && d['メールアドレス'] !== '未入力')
            ? d['メールアドレス'] : undefined,
          subject: `【仮予約・お問合せ】${d['お名前']}様 - ${d['ご希望プラン']}`,
          html: htmlBody,
        }),
      });

      const result = await res.json();
      return new Response(JSON.stringify({ ok: res.ok, ...result }), {
        status: res.ok ? 200 : 500,
        headers: { 'Content-Type': 'application/json', ...cors },
      });

    } catch (e) {
      return new Response(JSON.stringify({ ok: false, error: e.message }), {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...cors },
      });
    }
  }
};
