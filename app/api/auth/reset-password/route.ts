import { prisma } from '@/app/lib/prisma'
import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'

export async function POST(req: Request) {
  try {
    const body = await req.json()

    const token = String(body.token || '').trim()
    const password = String(body.password || '')

    if (!token || !password) {
      return NextResponse.json(
        { error: 'Token y contraseña son obligatorios' },
        { status: 400 }
      )
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'La contraseña debe tener al menos 6 caracteres' },
        { status: 400 }
      )
    }

    const resetToken = await prisma.passwordResetToken.findUnique({
      where: { token },
    })

    if (!resetToken || resetToken.used) {
      return NextResponse.json(
        { error: 'Liga inválida o ya utilizada' },
        { status: 400 }
      )
    }

    if (resetToken.expiresAt < new Date()) {
      return NextResponse.json(
        { error: 'La liga ya expiró' },
        { status: 400 }
      )
    }

    const passwordHash = await bcrypt.hash(password, 10)

    await prisma.user.update({
      where: { email: resetToken.email },
      data: { passwordHash },
    })

    await prisma.passwordResetToken.update({
      where: { token },
      data: { used: true },
    })

    return NextResponse.json({
      message: 'Contraseña actualizada correctamente',
    })
  } catch (error) {
    console.error(error)

    return NextResponse.json(
      { error: 'Error al restablecer contraseña' },
      { status: 500 }
    )
  }
}