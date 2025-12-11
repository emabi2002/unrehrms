// Email template for leave approval
export const leaveApprovalTemplate = (data: {
  employeeName: string
  leaveType: string
  startDate: string
  endDate: string
  days: number
  approvedBy: string
}) => {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Leave Request Approved</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #008751 0%, #00a862 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
    <h1 style="color: white; margin: 0; font-size: 28px;">🎉 Leave Request Approved</h1>
  </div>

  <div style="background: #ffffff; padding: 30px; border: 1px solid #e0e0e0; border-top: none; border-radius: 0 0 10px 10px;">
    <p style="font-size: 16px; margin-bottom: 20px;">Dear <strong>${data.employeeName}</strong>,</p>

    <p style="font-size: 16px; margin-bottom: 20px;">
      Your leave request has been <strong style="color: #10b981;">APPROVED</strong>!
    </p>

    <div style="background: #f0fdf4; border-left: 4px solid #10b981; padding: 20px; margin: 25px 0; border-radius: 5px;">
      <h3 style="margin-top: 0; color: #008751;">Leave Details:</h3>
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 8px 0; font-weight: 600; color: #555;">Leave Type:</td>
          <td style="padding: 8px 0;">${data.leaveType}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; font-weight: 600; color: #555;">Start Date:</td>
          <td style="padding: 8px 0;">${new Date(data.startDate).toLocaleDateString('en-PG', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; font-weight: 600; color: #555;">End Date:</td>
          <td style="padding: 8px 0;">${new Date(data.endDate).toLocaleDateString('en-PG', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; font-weight: 600; color: #555;">Total Days:</td>
          <td style="padding: 8px 0;"><strong>${data.days} days</strong></td>
        </tr>
        <tr>
          <td style="padding: 8px 0; font-weight: 600; color: #555;">Approved By:</td>
          <td style="padding: 8px 0;">${data.approvedBy}</td>
        </tr>
      </table>
    </div>

    <p style="font-size: 16px; margin-top: 25px;">
      Please ensure all your pending tasks are completed or delegated before your leave begins.
    </p>

    <p style="font-size: 16px; margin-top: 20px;">
      Enjoy your time off! 🌴
    </p>

    <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #e0e0e0;">
      <p style="font-size: 14px; color: #666; margin: 0;">
        Best regards,<br>
        <strong style="color: #008751;">Human Resources Department</strong><br>
        PNG University of Natural Resources & Environment
      </p>
    </div>
  </div>

  <div style="text-align: center; margin-top: 20px; padding: 20px; color: #666; font-size: 12px;">
    <p style="margin: 5px 0;">This is an automated message from PNG UNRE HRMS</p>
    <p style="margin: 5px 0;">Please do not reply to this email</p>
  </div>
</body>
</html>
  `
}

// Email template for leave rejection
export const leaveRejectionTemplate = (data: {
  employeeName: string
  leaveType: string
  startDate: string
  endDate: string
  days: number
  rejectedBy: string
  reason: string
}) => {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Leave Request Update</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #dc2626 0%, #ef4444 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
    <h1 style="color: white; margin: 0; font-size: 28px;">Leave Request Update</h1>
  </div>

  <div style="background: #ffffff; padding: 30px; border: 1px solid #e0e0e0; border-top: none; border-radius: 0 0 10px 10px;">
    <p style="font-size: 16px; margin-bottom: 20px;">Dear <strong>${data.employeeName}</strong>,</p>

    <p style="font-size: 16px; margin-bottom: 20px;">
      We regret to inform you that your leave request has been <strong style="color: #dc2626;">DECLINED</strong>.
    </p>

    <div style="background: #fef2f2; border-left: 4px solid #dc2626; padding: 20px; margin: 25px 0; border-radius: 5px;">
      <h3 style="margin-top: 0; color: #dc2626;">Leave Request Details:</h3>
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 8px 0; font-weight: 600; color: #555;">Leave Type:</td>
          <td style="padding: 8px 0;">${data.leaveType}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; font-weight: 600; color: #555;">Start Date:</td>
          <td style="padding: 8px 0;">${new Date(data.startDate).toLocaleDateString('en-PG', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; font-weight: 600; color: #555;">End Date:</td>
          <td style="padding: 8px 0;">${new Date(data.endDate).toLocaleDateString('en-PG', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; font-weight: 600; color: #555;">Total Days:</td>
          <td style="padding: 8px 0;"><strong>${data.days} days</strong></td>
        </tr>
        <tr>
          <td style="padding: 8px 0; font-weight: 600; color: #555;">Reviewed By:</td>
          <td style="padding: 8px 0;">${data.rejectedBy}</td>
        </tr>
      </table>
    </div>

    <div style="background: #fff7ed; border-left: 4px solid #f59e0b; padding: 20px; margin: 25px 0; border-radius: 5px;">
      <h3 style="margin-top: 0; color: #f59e0b;">Reason for Decline:</h3>
      <p style="margin: 0; font-size: 15px; color: #555;">${data.reason}</p>
    </div>

    <p style="font-size: 16px; margin-top: 25px;">
      If you have any questions or would like to discuss this decision, please contact your supervisor or the HR department.
    </p>

    <p style="font-size: 16px; margin-top: 20px;">
      You may submit a new leave request with different dates if needed.
    </p>

    <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #e0e0e0;">
      <p style="font-size: 14px; color: #666; margin: 0;">
        Best regards,<br>
        <strong style="color: #008751;">Human Resources Department</strong><br>
        PNG University of Natural Resources & Environment
      </p>
    </div>
  </div>

  <div style="text-align: center; margin-top: 20px; padding: 20px; color: #666; font-size: 12px;">
    <p style="margin: 5px 0;">This is an automated message from PNG UNRE HRMS</p>
    <p style="margin: 5px 0;">Please do not reply to this email</p>
  </div>
</body>
</html>
  `
}

// Helper function to send leave approval email
export const sendLeaveApprovalEmail = async (data: {
  to: string
  employeeName: string
  leaveType: string
  startDate: string
  endDate: string
  days: number
  approvedBy: string
}) => {
  const html = leaveApprovalTemplate(data)

  try {
    const response = await fetch('/api/send-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to: data.to,
        subject: `Leave Request Approved - ${data.leaveType}`,
        html: html,
        type: 'approval'
      }),
    })

    if (!response.ok) {
      throw new Error('Failed to send email')
    }

    return await response.json()
  } catch (error) {
    console.error('Error sending approval email:', error)
    throw error
  }
}

// Helper function to send leave rejection email
export const sendLeaveRejectionEmail = async (data: {
  to: string
  employeeName: string
  leaveType: string
  startDate: string
  endDate: string
  days: number
  rejectedBy: string
  reason: string
}) => {
  const html = leaveRejectionTemplate(data)

  try {
    const response = await fetch('/api/send-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to: data.to,
        subject: `Leave Request Update - ${data.leaveType}`,
        html: html,
        type: 'rejection'
      }),
    })

    if (!response.ok) {
      throw new Error('Failed to send email')
    }

    return await response.json()
  } catch (error) {
    console.error('Error sending rejection email:', error)
    throw error
  }
}
