import { Resend } from 'resend'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    // Check if API key is configured
    if (!process.env.RESEND_API_KEY) {
      console.warn('RESEND_API_KEY not configured - email not sent')
      return NextResponse.json(
        { error: 'Email service not configured. Please set RESEND_API_KEY environment variable.' },
        { status: 503 }
      )
    }

    const { to, subject, html, type } = await request.json()

    // Initialize Resend client at runtime
    const resend = new Resend(process.env.RESEND_API_KEY)

    // Send email via Resend
    const { data, error } = await resend.emails.send({
      from: 'PNG UNRE HRMS <hrms@unre.ac.pg>',
      to: [to],
      subject: subject,
      html: html,
    })

    if (error) {
      console.error('Resend error:', error)
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error('Email sending error:', error)
    return NextResponse.json({ error: 'Failed to send email' }, { status: 500 })
  }
}
