import { prisma } from '@/app/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const patients = await prisma.patient.findMany({
      orderBy: { createdAt: 'desc' },
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
  try {
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
        OR: [
          ...(email ? [{ email }] : []),
          ...(phone ? [{ phone }] : []),
        ],
      },
    })

    if (duplicate) {
      return NextResponse.json(
        { error: 'Ya existe un paciente con ese correo o teléfono' },
        { status: 400 }
      )
    }

    const patient = await prisma.patient.create({
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
      { error: 'Error al guardar paciente' },
      { status: 500 }
    )
  }
}

export async function DELETE(req: Request) {
  try {
    const body = await req.json()

    await prisma.patient.delete({
      where: { id: Number(body.id) },
    })

    return NextResponse.json({ message: 'Paciente eliminado' })
  } catch (error) {
    console.error(error)
    return NextResponse.json(
      { error: 'Error al eliminar paciente' },
      { status: 500 }
    )
  }
}