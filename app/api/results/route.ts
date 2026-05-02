import { prisma } from '@/app/lib/prisma'
import { NextResponse } from 'next/server'
import { requireRole } from '@/app/lib/auth-server'
import { createAuditLog } from '@/app/lib/audit'

export async function POST(req: Request) {
  const auth = await requireRole(['LABORATORIO', 'ADMIN'])

  if (!auth.ok) {
    return NextResponse.json(
      { error: auth.error },
      { status: auth.status }
    )
  }

  try {
    const body = await req.json()

    const appointmentId = Number(body.appointmentId)
    const values = String(body.resultText || '').trim()
    const notes = String(body.observations || '').trim()

    const result = await prisma.result.create({
      data: {
        appointmentId,
        values,
        notes,
      },
    })

    await prisma.appointment.update({
      where: { id: appointmentId },
      data: { status: 'COMPLETADA' },
    })

    // 🔥 AUDITORÍA
    await createAuditLog({
      user: auth.user,
      action: 'CREAR RESULTADO',
      entity: 'RESULT',
      entityId: result.id,
      detail: `Resultado creado para cita ${appointmentId}`,
    })

    return NextResponse.json(result)
  } catch (error) {
    return NextResponse.json(
      { error: 'Error al guardar resultado' },
      { status: 500 }
    )
  }
}

export async function PUT(req: Request) {
  const auth = await requireRole(['LABORATORIO', 'ADMIN'])

  if (!auth.ok) {
    return NextResponse.json(
      { error: auth.error },
      { status: auth.status }
    )
  }

  try {
    const body = await req.json()

    const id = Number(body.id)

    const result = await prisma.result.update({
      where: { id },
      data: {
        values: body.resultText,
        notes: body.observations,
      },
    })

    // 🔥 AUDITORÍA
    await createAuditLog({
      user: auth.user,
      action: 'EDITAR RESULTADO',
      entity: 'RESULT',
      entityId: id,
      detail: 'Resultado actualizado',
    })

    return NextResponse.json(result)
  } catch (error) {
    return NextResponse.json(
      { error: 'Error al actualizar resultado' },
      { status: 500 }
    )
  }
}