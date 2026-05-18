import { Resend } from 'resend';
import { NextRequest, NextResponse } from 'next/server';

const resend = new Resend(process.env.RESEND_API_KEY);

const BASE_URL = 'https://cybersage.vercel.app';

function buildEmailHtml(name: string, subject: string, message: string, timestamp: string) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>[Cybersage] Secure Uplink</title>
</head>
<body style="margin:0;padding:0;background:#060606;font-family:'Courier New',Courier,monospace;">

  <!-- Outer wrapper -->
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#060606;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="620" cellpadding="0" cellspacing="0" border="0" style="max-width:620px;width:100%;">

          <!-- ── TOP ACCENT LINE ───────────────────────────────────────── -->
          <tr>
            <td style="height:1px;background:linear-gradient(to right,transparent,#00FF9C,transparent);font-size:0;line-height:0;">&nbsp;</td>
          </tr>

          <!-- ── HEADER ─────────────────────────────────────────────────── -->
          <tr>
            <td style="background:#0a0a0a;border-left:1px solid rgba(0,255,156,0.12);border-right:1px solid rgba(0,255,156,0.12);padding:32px 40px 24px;">
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td>
                    <!-- Logo -->
                    <img
                      src="${BASE_URL}/logo/logo_white.png"
                      alt="Cybersage"
                      width="180"
                      style="display:block;height:auto;opacity:0.9;"
                    />
                  </td>
                  <td align="right" style="vertical-align:middle;">
                    <span style="font-family:'Courier New',monospace;font-size:7px;letter-spacing:0.28em;color:#00FF9C;font-weight:700;">SECURE_UPLINK</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- ── DIVIDER ─────────────────────────────────────────────────── -->
          <tr>
            <td style="height:1px;background:rgba(0,255,156,0.08);font-size:0;line-height:0;border-left:1px solid rgba(0,255,156,0.12);border-right:1px solid rgba(0,255,156,0.12);">&nbsp;</td>
          </tr>

          <!-- ── HERO BAND ───────────────────────────────────────────────── -->
          <tr>
            <td style="background:#0d0d0d;border-left:1px solid rgba(0,255,156,0.12);border-right:1px solid rgba(0,255,156,0.12);padding:28px 40px;">
              <p style="margin:0 0 10px;font-size:7px;letter-spacing:0.3em;color:#00FF9C;font-weight:700;text-transform:uppercase;">
                MODULE_05 // INBOUND_TRANSMISSION
              </p>
              <h1 style="margin:0;font-size:26px;font-weight:900;color:#F9FFF6;letter-spacing:-0.02em;line-height:1.1;">
                NEW&nbsp;<span style="color:#00FF9C;">CONTACT</span><br/>RECEIVED
              </h1>
              <p style="margin:10px 0 0;font-size:9px;letter-spacing:0.18em;color:rgba(249,255,246,0.3);">
                ${timestamp} // WAT (UTC+1)
              </p>
            </td>
          </tr>

          <!-- ── METADATA ROW ────────────────────────────────────────────── -->
          <tr>
            <td style="background:#0a0a0a;border-left:1px solid rgba(0,255,156,0.12);border-right:1px solid rgba(0,255,156,0.12);padding:0 40px;">
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <!-- Operator -->
                  <td width="50%" style="padding:20px 16px 20px 0;border-right:1px solid rgba(249,255,246,0.06);">
                    <p style="margin:0 0 6px;font-size:6.5px;letter-spacing:0.24em;color:rgba(249,255,246,0.3);font-weight:700;text-transform:uppercase;">FROM_OPERATOR</p>
                    <p style="margin:0;font-size:14px;color:#F9FFF6;font-weight:700;letter-spacing:0.04em;">${name}</p>
                  </td>
                  <!-- Status -->
                  <td width="50%" style="padding:20px 0 20px 16px;">
                    <p style="margin:0 0 6px;font-size:6.5px;letter-spacing:0.24em;color:rgba(249,255,246,0.3);font-weight:700;text-transform:uppercase;">SYS_STATUS</p>
                    <p style="margin:0;font-size:11px;color:#00FF9C;font-weight:700;letter-spacing:0.12em;">
                      ● &nbsp;UPLINK_ACTIVE
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- ── SUBJECT BLOCK ───────────────────────────────────────────── -->
          <tr>
            <td style="background:#0a0a0a;border-left:1px solid rgba(0,255,156,0.12);border-right:1px solid rgba(0,255,156,0.12);padding:0 40px;">
              <div style="border-top:1px solid rgba(249,255,246,0.06);padding:20px 0;">
                <p style="margin:0 0 6px;font-size:6.5px;letter-spacing:0.24em;color:rgba(249,255,246,0.3);font-weight:700;text-transform:uppercase;">UPLINK_SUBJECT</p>
                <p style="margin:0;font-size:16px;color:#FF5A1F;font-weight:700;letter-spacing:0.02em;">${subject}</p>
              </div>
            </td>
          </tr>

          <!-- ── MESSAGE BLOCK ───────────────────────────────────────────── -->
          <tr>
            <td style="background:#080808;border-left:1px solid rgba(0,255,156,0.12);border-right:1px solid rgba(0,255,156,0.12);padding:0 40px;">
              <div style="border-top:1px solid rgba(249,255,246,0.06);padding:24px 0;">
                <p style="margin:0 0 12px;font-size:6.5px;letter-spacing:0.24em;color:rgba(249,255,246,0.3);font-weight:700;text-transform:uppercase;">DATA_PAYLOAD</p>
                <!-- Message box -->
                <div style="background:#0d0d0d;border:1px solid rgba(0,255,156,0.1);padding:20px 22px;position:relative;">
                  <!-- Corner tick TL -->
                  <div style="position:absolute;top:-1px;left:-1px;width:10px;height:10px;border-top:1px solid #00FF9C;border-left:1px solid #00FF9C;"></div>
                  <!-- Corner tick BR -->
                  <div style="position:absolute;bottom:-1px;right:-1px;width:10px;height:10px;border-bottom:1px solid #00FF9C;border-right:1px solid #00FF9C;"></div>
                  <p style="margin:0;font-size:13px;color:rgba(249,255,246,0.82);line-height:1.85;white-space:pre-wrap;letter-spacing:0.02em;">${message}</p>
                </div>
              </div>
            </td>
          </tr>

          <!-- ── HUD FOOTER ROW ──────────────────────────────────────────── -->
          <tr>
            <td style="background:#0a0a0a;border-left:1px solid rgba(0,255,156,0.12);border-right:1px solid rgba(0,255,156,0.12);padding:16px 40px;">
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-top:1px solid rgba(249,255,246,0.06);padding-top:16px;">
                <tr>
                  <td style="font-size:6.5px;letter-spacing:0.2em;color:rgba(249,255,246,0.18);font-weight:700;line-height:2;">
                    SYS_OPERATOR: ABAKWE.CARRINGTON<br/>
                    CHANNEL: ENCRYPTED // DELIVERY: CONFIRMED<br/>
                    VERSION: v2.0.26
                  </td>
                  <td align="right" style="vertical-align:top;">
                    <span style="font-size:6px;letter-spacing:0.18em;color:rgba(255,90,31,0.5);font-weight:700;">FLAME_CORE: ACTIVE</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- ── BOTTOM ACCENT LINE ─────────────────────────────────────── -->
          <tr>
            <td style="height:1px;background:linear-gradient(to right,transparent,rgba(255,90,31,0.5),transparent);font-size:0;line-height:0;">&nbsp;</td>
          </tr>

          <!-- ── CAPTION ────────────────────────────────────────────────── -->
          <tr>
            <td align="center" style="padding:18px 40px;">
              <p style="margin:0;font-size:6px;letter-spacing:0.2em;color:rgba(249,255,246,0.12);font-weight:700;">
                © 2026 CYBERSAGE_v2 // ALL_RIGHTS_RESERVED // ${BASE_URL}
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>

</body>
</html>`;
}

export async function POST(req: NextRequest) {
  try {
    const { name, subject, message } = await req.json();

    if (!name || !subject || !message) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const timestamp = new Intl.DateTimeFormat('en-GB', {
      timeZone: 'Africa/Lagos',
      year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit', second: '2-digit',
      hour12: false,
    }).format(new Date()).replace(',', '');

    const { error } = await resend.emails.send({
      from: 'Cybersage Contact <onboarding@resend.dev>',
      to: 'carryoby@gmail.com',
      subject: `[Cybersage] ${subject}`,
      html: buildEmailHtml(name, subject, message, timestamp),
    });

    if (error) {
      console.error('Resend error:', error);
      return NextResponse.json({ error: 'Failed to send message' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Contact route error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
