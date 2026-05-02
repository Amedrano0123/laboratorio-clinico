import { prisma } from '@/app/lib/prisma'
import { NextResponse } from 'next/server'
import { requireRole } from '@/app/lib/auth-server'

export async function GET() {
  try {
    const patients = await prisma.patient.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    })

    return NextResponse.json(patients)
  } catch (error) {
    console.error(error)
    return NextResponse.json(
      { error: 'Error al obtener pacientes' },
      { status: 500 }
    )
  }
}

export async function POST(req: Request) {
  const auth = await requireRole(['ADMIN', 'RECEPCION'])

  if (!auth.ok) {
    return NextResponse.json(
      { error: auth.error },
      { status: auth.status }
    )
  }

  try {
    const body = await req.json()

    const name = String(body.name || '').trim()
    const birthDate = body.birthDate ? new Date(body.birthDate) : null
    const phone = String(body.phone || '').trim()
    const email = String(body.email || '').trim()

    if (!name) {
      return NextResponse.json(
        { error: 'El nombre del paciente es obligatorio' },
        { status: 400 }
      )
    }

    const patient = await prisma.patient.create({
      data: {
        name,
        birthDate,
        phone: phone || null,
        email: email || null,
      },
    })

    return NextResponse.json(patient)
  } catch (error) {
    console.error(error)
    return NextResponse.json(
      { error: 'Error al crear paciente' },
      { status: 500 }
    )
  }
}