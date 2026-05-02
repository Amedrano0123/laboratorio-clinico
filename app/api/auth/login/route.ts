import { prisma } from '@/app/lib/prisma'
import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'

export async function POST(req: Request) {
  const body = await req.json()

  const email = String(body.email || '').trim().toLowerCase()
  const password = String(body.password || '')

  const user = await prisma.user.findUnique({
    where: { email },
  })

  if (!user) {
    return NextResponse.json(
      { error: 'Usuario o contraseña incorrectos' },
      { status: 401 }
    )
  }

  const validPassword = await bcrypt.compare(password, user.passwordHash)

  if (!validPassword) {
    return NextResponse.json(
      { error: 'Usuario o contraseña incorrectos' },
      { status: 401 }
    )
  }

  const res = NextResponse.json({
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
  })

  res.cookies.set(
    'lab_user',
    JSON.stringify({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    }),
    {
      httpOnly: false,
      sameSite: 'lax',
      path: '/',
    }
  )

  return res
}