import nodemailer from 'nodemailer'
import { env } from '../config/env.js'

let transporter = null
let resend      = null

if (env.emailProvider === 'gmail') {
  transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: env.gmailUser,
      pass: env.gmailPass,
    },
  })
} else if (env.resendApiKey) {
  resend = new Resend(env.resendApiKey)
}

//  Core send function 

async function sendEmail({ to, subject, html, text }) {
  try {
    if (env.emailProvider === 'gmail' && transporter) {
      const info = await transporter.sendMail({
        from:    `"SnapTrack" <${env.gmailUser}>`,
        to,
        subject,
        text:    text || '',
        html,
      })
      console.log(`[EMAIL - GMAIL] Sent to ${to} | ${info.response}`)
    } else if (resend) {
      await resend.emails.send({
        from:    `SnapTrack <${env.cronEmailFrom || 'onboarding@resend.dev'}>`,
        to:      [to],
        subject,
        html,
      })
      console.log(`[EMAIL - RESEND] Sent to ${to}`)
    } else {
      console.warn('[EMAIL] No email provider configured — skipping')
    }
  } catch (err) {
    console.error(`[EMAIL ERROR] Failed to send to ${to}:`, err.message)
  }
}

//  Email: due date reminder for assigned member 
// Sent to: the member assigned to the task
// Contains: board name, task title, due date

export async function sendMemberDueReminder({ to, userName, taskTitle, boardName, dueDate }) {
  const formattedDate = new Date(dueDate).toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric',
  })

  const subject = `Task due tomorrow: "${taskTitle}"`

  const html = `
    <div style="font-family:Arial,sans-serif;max-width:520px;margin:0 auto;padding:32px 24px;background:#ffffff;">
      <div style="background:#2563EB;width:40px;height:40px;border-radius:10px;display:inline-flex;align-items:center;justify-content:center;margin-bottom:24px;">
        <span style="color:white;font-weight:bold;font-size:18px;">S</span>
      </div>

      <h2 style="color:#111827;font-size:20px;margin:0 0 8px;">
        Your task is due tomorrow
      </h2>
      <p style="color:#6B7280;font-size:14px;margin:0 0 24px;">
        Hi ${userName}, here's a reminder about your upcoming task.
      </p>

      <div style="background:#F9FAFB;border:1px solid #E5E7EB;border-radius:12px;padding:20px;margin-bottom:24px;">
        <p style="color:#111827;font-size:16px;font-weight:600;margin:0 0 10px;">
          ${taskTitle}
        </p>
        <table style="width:100%;border-collapse:collapse;">
          <tr>
            <td style="color:#6B7280;font-size:13px;padding:3px 0;width:100px;">Board</td>
            <td style="color:#374151;font-size:13px;padding:3px 0;font-weight:500;">${boardName}</td>
          </tr>
          <tr>
            <td style="color:#6B7280;font-size:13px;padding:3px 0;">Due date</td>
            <td style="color:#EF4444;font-size:13px;padding:3px 0;font-weight:500;">${formattedDate}</td>
          </tr>
        </table>
      </div>

      <p style="color:#9CA3AF;font-size:12px;margin:0;">
        Sent by SnapTrack — your team task manager
      </p>
    </div>
  `

  await sendEmail({ to, subject, html, text: `Hi ${userName}, your task "${taskTitle}" in ${boardName} is due tomorrow (${formattedDate}).` })
}

//  Email: due date summary for board owner 
// Sent to: the board owner
// Contains: board name, list of tasks due tomorrow, each with assignee names

export async function sendOwnerDueSummary({ to, ownerName, boardName, tasks }) {
  const subject = `[SnapTrack] ${tasks.length} task${tasks.length > 1 ? 's' : ''} due tomorrow in "${boardName}"`

  // Build task rows for the email table
  const taskRows = tasks.map((task) => {
    const formattedDate = new Date(task.dueDate).toLocaleDateString('en-US', {
      weekday: 'short', month: 'short', day: 'numeric',
    })

    // Assignees — could be one or many
    const assigneeNames = task.assignees?.map((a) => a.name).join(', ') || 'Unassigned'

    return `
      <tr>
        <td style="padding:10px 12px;border-bottom:1px solid #F3F4F6;color:#111827;font-size:13px;font-weight:500;">
          ${task.title}
        </td>
        <td style="padding:10px 12px;border-bottom:1px solid #F3F4F6;color:#6B7280;font-size:13px;">
          ${assigneeNames}
        </td>
        <td style="padding:10px 12px;border-bottom:1px solid #F3F4F6;color:#EF4444;font-size:13px;font-weight:500;">
          ${formattedDate}
        </td>
      </tr>
    `
  }).join('')

  const html = `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:32px 24px;background:#ffffff;">
      <div style="background:#2563EB;width:40px;height:40px;border-radius:10px;display:inline-flex;align-items:center;justify-content:center;margin-bottom:24px;">
        <span style="color:white;font-weight:bold;font-size:18px;">S</span>
      </div>

      <h2 style="color:#111827;font-size:20px;margin:0 0 8px;">
        Tasks due tomorrow
      </h2>
      <p style="color:#6B7280;font-size:14px;margin:0 0 24px;">
        Hi ${ownerName}, here's a summary of tasks due tomorrow in <strong>${boardName}</strong>.
      </p>

      <table style="width:100%;border-collapse:collapse;border:1px solid #E5E7EB;border-radius:12px;overflow:hidden;">
        <thead>
          <tr style="background:#F9FAFB;">
            <th style="padding:10px 12px;text-align:left;font-size:12px;font-weight:600;color:#374151;border-bottom:1px solid #E5E7EB;">
              Task
            </th>
            <th style="padding:10px 12px;text-align:left;font-size:12px;font-weight:600;color:#374151;border-bottom:1px solid #E5E7EB;">
              Assigned to
            </th>
            <th style="padding:10px 12px;text-align:left;font-size:12px;font-weight:600;color:#374151;border-bottom:1px solid #E5E7EB;">
              Due date
            </th>
          </tr>
        </thead>
        <tbody>
          ${taskRows}
        </tbody>
      </table>

      <p style="color:#9CA3AF;font-size:12px;margin:24px 0 0;">
        Sent by SnapTrack — your team task manager
      </p>
    </div>
  `

  const text = `Hi ${ownerName}, ${tasks.length} task(s) are due tomorrow in ${boardName}. Check your board for details.`

  await sendEmail({ to, subject, html, text })
}

//  Email: new member joined board 
// Sent to: the board owner
// Contains: who joined, board name, their role

export async function sendMemberJoinedNotification({ to, ownerName, newMemberName, boardName, role }) {
  const subject = `${newMemberName} joined your board "${boardName}"`

  const roleLabel = role
    ? role.charAt(0).toUpperCase() + role.slice(1)
    : 'Editor'

  const html = `
    <div style="font-family:Arial,sans-serif;max-width:520px;margin:0 auto;padding:32px 24px;background:#ffffff;">
      <div style="background:#2563EB;width:40px;height:40px;border-radius:10px;display:inline-flex;align-items:center;justify-content:center;margin-bottom:24px;">
        <span style="color:white;font-weight:bold;font-size:18px;">S</span>
      </div>

      <h2 style="color:#111827;font-size:20px;margin:0 0 8px;">
        New member joined your board
      </h2>
      <p style="color:#6B7280;font-size:14px;margin:0 0 24px;">
        Hi ${ownerName}, someone just joined one of your boards.
      </p>

      <div style="background:#EFF6FF;border:1px solid #BFDBFE;border-radius:12px;padding:20px;margin-bottom:24px;">
        <table style="width:100%;border-collapse:collapse;">
          <tr>
            <td style="color:#6B7280;font-size:13px;padding:4px 0;width:100px;">Member</td>
            <td style="color:#1D40AF;font-size:13px;padding:4px 0;font-weight:600;">${newMemberName}</td>
          </tr>
          <tr>
            <td style="color:#6B7280;font-size:13px;padding:4px 0;">Board</td>
            <td style="color:#111827;font-size:13px;padding:4px 0;font-weight:500;">${boardName}</td>
          </tr>
          <tr>
            <td style="color:#6B7280;font-size:13px;padding:4px 0;">Role</td>
            <td style="color:#111827;font-size:13px;padding:4px 0;">${roleLabel}</td>
          </tr>
        </table>
      </div>

      <p style="color:#9CA3AF;font-size:12px;margin:0;">
        Sent by SnapTrack — your team task manager
      </p>
    </div>
  `

  const text = `Hi ${ownerName}, ${newMemberName} just joined your board "${boardName}" as ${roleLabel}.`

  await sendEmail({ to, subject, html, text })
}