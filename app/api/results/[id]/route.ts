import { prisma } from '@/app/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET(req: Request, context: any) {
  try {
    const { id } = await context.params

    const result = await prisma.result.findUnique({
      where: { id: Number(id) },
      include: {
        appointment: {
          include: {
            study: true,
            order: {
              include: {
                patient: true,
              },
            },
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

export async function PUT(req: Request, context: any) {
  try {
    const { id } = await context.params
    const body = await req.json()

    const result = await prisma.result.update({
      where: { id: Number(id) },
      data: {
        values: String(body.values || body.resultText || '').trim(),
        notes: body.notes || body.observations || null,
      },
    })

    return NextResponse.json(result)
  } catch (error) {
    console.error(error)
    return NextResponse.json(
      { error: 'Error al actualizar resultado' },
      { status: 500 }
    )
  }
}