import nodemailer from 'nodemailer'

export async function sendPasswordResetEmail({
  to,
  resetUrl,
}: {
  to: string
  resetUrl: string
}) {
  const host = process.env.SMTP_HOST
  const port = Number(process.env.SMTP_PORT || 587)
  const user = process.env.SMTP_USER
  const pass = process.env.SMTP_PASS
  const from = process.env.SMTP_FROM || 'Laboratorio <no-reply@laboratorio.local>'

  if (!host || !user || !pass) {
    console.log('====================================')
    console.log('LINK DE RECUPERACIÓN DE CONTRASEÑA')
    console.log(resetUrl)
    console.log('====================================')

    return {
      sent: false,
      devResetUrl: resetUrl,
    }
  }

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: {
      user,
      pass,
    },
  })

  await transporter.sendMail({
    from,
    to,
    subject: 'Restablecer contraseña - Sistema Laboratorio',
    html: `
      <p>Solicitaste restablecer tu contraseña.</p>
      <p>Haz clic en el siguiente enlace:</p>
      <p><a href="${resetUrl}">${resetUrl}</a></p>
      <p>Este enlace vence en 30 minutos.</p>
    `,
  })

  return {
    sent: true,
    devResetUrl: null,
  }
}