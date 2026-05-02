import { prisma } from '@/app/lib/prisma'
import { NextResponse } from 'next/server'
import { requireRole } from '@/app/lib/auth-server'
import bcrypt from 'bcryptjs'

export async function GET() {
  const auth = await requireRole(['ADMIN'])

  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status })
  }

  const users = await prisma.user.findMany({
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
    },
  })

  return NextResponse.json(users)
}

export async function POST(req: Request) {
  const auth = await requireRole(['ADMIN'])

  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status })
  }

  const body = await req.json()

  const name = String(body.name || '').trim()
  const email = String(body.email || '').trim().toLowerCase()
  const password = String(body.password || '')
  const role = String(body.role || 'RECEPCION')

  if (!name || !email || !password || !role) {
    return NextResponse.json(
      { error: 'Nombre, correo, contraseña y rol son obligatorios' },
      { status: 400 }
    )
  }

  if (password.length < 6) {
    return NextResponse.json(
      { error: 'La contraseña debe tener al menos 6 caracteres' },
      { status: 400 }
    )
  }

  const passwordHash = await bcrypt.hash(password, 10)

  const user = await prisma.user.create({
    data: {
      name,
      email,
      passwordHash,
      role,
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
    },
  })

  return NextResponse.json(user)
}

export async function PUT(req: Request) {
  const auth = await requireRole(['ADMIN'])

  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status })
  }

  const body = await req.json()

  const id = Number(body.id)
  const name = String(body.name || '').trim()
  const email = String(body.email || '').trim().toLowerCase()
  const role = String(body.role || '').trim()
  const password = String(body.password || '')

  if (!id || !name || !email || !role) {
    return NextResponse.json(
      { error: 'ID, nombre, correo y rol son obligatorios' },
      { status: 400 }
    )
  }

  const data: any = {
    name,
    email,
    role,
  }

  if (password) {
    if (password.length < 6) {
      return NextResponse.json(
        { error: 'La contraseña debe tener al menos 6 caracteres' },
        { status: 400 }
      )
    }

    data.passwordHash = await bcrypt.hash(password, 10)
  }

  const user = await prisma.user.update({
    where: { id },
    data,
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
    },
  })

  return NextResponse.json(user)
}