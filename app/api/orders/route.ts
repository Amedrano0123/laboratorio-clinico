import { prisma } from '@/app/lib/prisma'
import { NextResponse } from 'next/server'
import { requireRole } from '@/app/lib/auth-server'
import { createAuditLog } from '@/app/lib/audit'

function generateFolio(lastFolio: string | null) {
  const year = new Date().getFullYear()

  if (!lastFolio) {
    return `LAB-${year}-0001`
  }

  const parts = lastFolio.split('-')
  const lastNumber = Number(parts[2]) || 0
  const nextNumber = lastNumber + 1

  return `LAB-${year}-${String(nextNumber).padStart(4, '0')}`
}

export async function GET() {
  try {
    const orders = await prisma.labOrder.findMany({
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
      { error: 'Error al obtener órdenes' },
      { status: 500 }
    )
  }
}

export async function POST(req: Request) {
  const auth = await requireRole(['RECEPCION', 'ADMIN'])

  if (!auth.ok) {
    return NextResponse.json(
      { error: auth.error },
      { status: auth.status }
    )
  }

  try {
    const body = await req.json()

    const patientId = Number(body.patientId)
    const studyIds = Array.isArray(body.studyIds)
      ? body.studyIds.map(Number)
      : []
    const notes = String(body.notes || '').trim()

    if (!patientId || studyIds.length === 0) {
      return NextResponse.json(
        { error: 'Paciente y estudios son obligatorios' },
        { status: 400 }
      )
    }

    const lastOrder = await prisma.labOrder.findFirst({
      where: {
        folio: {
          not: null,
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    const folio = generateFolio(lastOrder?.folio || null)

    const order = await prisma.labOrder.create({
      data: {
        folio,
        patientId,
        status: 'ABIERTA',
        notes: notes || null,
        appointments: {
          create: studyIds.map((studyId: number) => ({
            studyId,
            status: 'PENDIENTE',
            date: new Date(),
          })),
        },
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
    })

    await createAuditLog({
      user: auth.user,
      action: 'CREAR ORDEN',
      entity: 'LAB_ORDER',
      entityId: order.id,
      detail: `Orden ${order.folio || order.id} creada para ${order.patient.name}`,
    })

    return NextResponse.json(order)
  } catch (error) {
    console.error(error)
    return NextResponse.json(
      { error: 'Error al crear orden' },
      { status: 500 }
    )
  }
}