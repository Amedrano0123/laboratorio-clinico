import { prisma } from '@/app/lib/prisma'
import { NextResponse } from 'next/server'

export async function PUT(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params
    const patientId = Number(id)
    const body = await req.json()

    const name = String(body.name || '').trim()
    const phone = String(body.phone || '').trim()
    const email = String(body.email || '').trim().toLowerCase()
    const birthDate = body.birthDate || null

    if (!name) {
      return NextResponse.json(
        { error: 'El nombre es obligatorio' },
        { status: 400 }
      )
    }

    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { error: 'El correo no tiene formato válido' },
        { status: 400 }
      )
    }

    if (phone && phone.length < 8) {
      return NextResponse.json(
        { error: 'El teléfono debe tener al menos 8 caracteres' },
        { status: 400 }
      )
    }

    const duplicate = await prisma.patient.findFirst({
      where: {
        id: { not: patientId },
        OR: [
          ...(email ? [{ email }] : []),
          ...(phone ? [{ phone }] : []),
        ],
      },
    })

    if (duplicate) {
      return NextResponse.json(
        { error: 'Ya existe otro paciente con ese correo o teléfono' },
        { status: 400 }
      )
    }

    const patient = await prisma.patient.update({
      where: { id: patientId },
      data: {
        name,
        birthDate: birthDate ? new Date(birthDate) : null,
        phone: phone || null,
        email: email || null,
      },
    })

    return NextResponse.json(patient)
  } catch (error) {
    console.error(error)
    return NextResponse.json(
      { error: 'Error al actualizar paciente' },
      { status: 500 }
    )
  }
}