import { Resend } from 'resend';
import { NextRequest, NextResponse } from 'next/server';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: NextRequest) {
  try {
    const { name, subject, message } = await req.json();

    if (!name || !subject || !message) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const { error } = await resend.emails.send({
      from: 'Cybersage Contact <onboarding@resend.dev>',
      to: 'carryoby@gmail.com',
      replyTo: undefined,
      subject: `[Cybersage] ${subject}`,
      html: `
        <div style="font-family: monospace; background: #060606; color: #F9FFF6; padding: 32px; border: 1px solid rgba(0,255,156,0.2);">
          <p style="color: #00FF9C; font-size: 11px; letter-spacing: 0.2em; margin: 0 0 24px;">CYBERSAGE // SECURE_UPLINK</p>
          <h2 style="color: #F9FFF6; margin: 0 0 24px; font-size: 20px;">${subject}</h2>
          <p style="color: rgba(249,255,246,0.5); font-size: 11px; letter-spacing: 0.15em; margin: 0 0 8px;">FROM_OPERATOR:</p>
          <p style="color: #F9FFF6; margin: 0 0 24px; font-size: 14px;">${name}</p>
          <p style="color: rgba(249,255,246,0.5); font-size: 11px; letter-spacing: 0.15em; margin: 0 0 8px;">DATA_PAYLOAD:</p>
          <p style="color: #F9FFF6; margin: 0; font-size: 14px; line-height: 1.7; white-space: pre-wrap;">${message}</p>
        </div>
      `,
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
