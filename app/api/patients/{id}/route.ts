import { prisma } from '@/app/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET(req: Request, context: any) {
  try {
    const { id } = await context.params

    const patient = await prisma.patient.findUnique({
      where: { id: Number(id) },
      include: {
        orders: {
          include: {
            appointments: {
              include: {
                study: true,
                result: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    })

    if (!patient) {
      return NextResponse.json(
        { error: 'Paciente no encontrado' },
        { status: 404 }
      )
    }

    return NextResponse.json(patient)
  } catch (error) {
    console.error(error)
    return NextResponse.json(
      { error: 'Error al obtener paciente' },
      { status: 500 }
    )
  }
}

export async function PUT(req: Request, context: any) {
  try {
    const { id } = await context.params
    const body = await req.json()

    const patient = await prisma.patient.update({
      where: { id: Number(id) },
      data: {
        name: String(body.name || '').trim(),
        birthDate: body.birthDate ? new Date(body.birthDate) : null,
        phone: body.phone || null,
        email: body.email || null,
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

export async function DELETE(req: Request, context: any) {
  try {
    const { id } = await context.params

    await prisma.patient.delete({
      where: { id: Number(id) },
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