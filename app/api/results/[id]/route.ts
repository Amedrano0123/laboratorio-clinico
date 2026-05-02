import { prisma } from '@/app/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params

    const result = await prisma.result.findUnique({
      where: { id: Number(id) },
      include: {
        appointment: {
          include: {
            patient: true,
            study: true,
          },
        },
      },
    })

    if (!result) {
      return NextResponse.json(
        { error: 'Resultado no encontrado' },
        { status: 404 }
      )
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error(error)
    return NextResponse.json(
      { error: 'Error al obtener resultado' },
      { status: 500 }
    )
  }
}