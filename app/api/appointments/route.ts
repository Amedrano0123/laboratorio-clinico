import { prisma } from '@/app/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const appointments = await prisma.appointment.findMany({
      include: {
        study: true,
        result: true,
        order: {
          include: {
            patient: true,
          },
        },
      },
      orderBy: {
        date: 'asc',
      },
    })

    return NextResponse.json(appointments)
  } catch (error) {
    console.error(error)
    return NextResponse.json(
      { error: 'Error al obtener citas' },
      { status: 500 }
    )
  }
}