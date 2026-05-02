import { prisma } from '@/app/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params

    const patientId = Number(id)

    if (!patientId) {
      return NextResponse.json(
        { error: 'ID inválido' },
        { status: 400 }
      )
    }

    const orders = await prisma.labOrder.findMany({
      where: {
        patientId: patientId,
      },
      include: {
        patient: true,
        appointments: {
          include: {
            study: true,
            result: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return NextResponse.json(orders)

  } catch (error) {
    console.error(error)

    return NextResponse.json(
      { error: 'Error al obtener historial' },
      { status: 500 }
    )
  }
}