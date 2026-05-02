import { prisma } from '@/app/lib/prisma'
import { NextResponse } from 'next/server'
import crypto from 'crypto'
import { sendPasswordResetEmail } from '@/app/lib/email'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const email = String(body.email || '').trim().toLowerCase()

    if (!email) {
      return NextResponse.json(
        { error: 'El correo es obligatorio' },
        { status: 400 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { email },
    })

    if (!user) {
      return NextResponse.json({
        message: 'Si el correo existe, se enviará una liga de recuperación.',
      })
    }

    const token = crypto.randomBytes(32).toString('hex')

    const expiresAt = new Date()
    expiresAt.setMinutes(expiresAt.getMinutes() + 30)

    await prisma.passwordResetToken.create({
      data: {
        email,
        token,
        expiresAt,
      },
    })

    const origin =
      process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

    const resetUrl = `${origin}/reset-password?token=${token}`

    const emailResult = await sendPasswordResetEmail({
      to: email,
      resetUrl,
    })

    return NextResponse.json({
      message: 'Si el correo existe, se enviará una liga de recuperación.',
      devResetUrl: emailResult.devResetUrl,
    })
  } catch (error) {
    console.error(error)

    return NextResponse.json(
      { error: 'Error al solicitar recuperación' },
      { status: 500 }
    )
  }
}