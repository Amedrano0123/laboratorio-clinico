import { prisma } from '@/app/lib/prisma'
import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'

export async function POST() {
  const users = [
    {
      name: 'Recepción',
      email: 'recepcion@test.com',
      password: '123456',
      role: 'RECEPCION',
    },
    {
      name: 'Laboratorio',
      email: 'laboratorio@test.com',
      password: '123456',
      role: 'LABORATORIO',
    },
    {
      name: 'Administrador',
      email: 'admin@test.com',
      password: '123456',
      role: 'ADMIN',
    },
  ]

  for (const user of users) {
    const passwordHash = await bcrypt.hash(user.password, 10)

    await prisma.user.upsert({
      where: { email: user.email },
      update: {
        name: user.name,
        passwordHash,
        role: user.role,
      },
      create: {
        name: user.name,
        email: user.email,
        passwordHash,
        role: user.role,
      },
    })
  }

  return NextResponse.json({ message: 'Usuarios de prueba creados' })
}