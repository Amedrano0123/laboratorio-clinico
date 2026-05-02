import { prisma } from '@/app/lib/prisma'
import { NextResponse } from 'next/server'
import { requireRole } from '@/app/lib/auth-server'
import { createAuditLog } from '@/app/lib/audit'

export async function GET(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params

    const order = await prisma.labOrder.findUnique({
      where: { id: Number(id) },
      include: {
        patient: true,
        appointments: {
          include: {
            study: true,
            result: true,
          },
          orderBy: { id: 'asc' },
        },
      },
    })

    if (!order) {
      return NextResponse.json(
        { error: 'Orden no encontrada' },
        { status: 404 }
      )
    }

    return NextResponse.json(order)
  } catch (error) {
    console.error(error)
    return NextResponse.json(
      { error: 'Error al obtener orden' },
      { status: 500 }
    )
  }
}

export async function PATCH(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const auth = await requireRole(['LABORATORIO', 'RECEPCION', 'ADMIN'])

  if (!auth.ok) {
    return NextResponse.json(
      { error: auth.error },
      { status: auth.status }
    )
  }

  try {
    const { id } = await context.params

    const order = await prisma.labOrder.findUnique({
      where: { id: Number(id) },
      include: {
        appointments: {
          include: {
            result: true,
          },
        },
      },
    })

    if (!order) {
      return NextResponse.json(
        { error: 'Orden no encontrada' },
        { status: 404 }
      )
    }

    const body = await req.json().catch(() => null)

    // FINALIZAR ORDEN
    if (!body || body.action === 'FINALIZAR') {
      if (!['LABORATORIO', 'ADMIN'].includes(auth.user.role)) {
        return NextResponse.json(
          { error: 'No tienes permiso para finalizar órdenes' },
          { status: 403 }
        )
      }

      if (order.status === 'FINALIZADA') {
        return NextResponse.json(
          { error: 'La orden ya está finalizada' },
          { status: 400 }
        )
      }

      const allHaveResults = order.appointments.every((a) => a.result)

      if (!allHaveResults) {
        return NextResponse.json(
          { error: 'No puedes finalizar una orden con estudios pendientes' },
          { status: 400 }
        )
      }

      const updatedOrder = await prisma.labOrder.update({
        where: { id: Number(id) },
        data: { status: 'FINALIZADA' },
      })

      await createAuditLog({
        user: auth.user,
        action: 'FINALIZAR ORDEN',
        entity: 'LAB_ORDER',
        entityId: updatedOrder.id,
        detail: `Orden ${updatedOrder.folio || updatedOrder.id} finalizada`,
      })

      return NextResponse.json(updatedOrder)
    }

    // EDITAR ORDEN
    if (!['RECEPCION', 'ADMIN'].includes(auth.user.role)) {
      return NextResponse.json(
        { error: 'No tienes permiso para editar órdenes' },
        { status: 403 }
      )
    }

    if (order.status === 'FINALIZADA') {
      return NextResponse.json(
        { error: 'No se puede editar una orden FINALIZADA' },
        { status: 400 }
      )
    }

    const hasResults = order.appointments.some((a) => a.result)

    if (hasResults) {
      return NextResponse.json(
        { error: 'No se puede editar una orden con resultados capturados' },
        { status: 400 }
      )
    }

    const updatedOrder = await prisma.labOrder.update({
      where: { id: Number(id) },
      data: {
        patientId: Number(body.patientId),
        notes: body.notes || null,
      },
    })

    await createAuditLog({
      user: auth.user,
      action: 'EDITAR ORDEN',
      entity: 'LAB_ORDER',
      entityId: updatedOrder.id,
      detail: `Orden ${updatedOrder.folio || updatedOrder.id} editada`,
    })

    return NextResponse.json(updatedOrder)
  } catch (error) {
    console.error(error)
    return NextResponse.json(
      { error: 'Error al actualizar orden' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const auth = await requireRole(['ADMIN'])

  if (!auth.ok) {
    return NextResponse.json(
      { error: auth.error },
      { status: auth.status }
    )
  }

  try {
    const { id } = await context.params

    const order = await prisma.labOrder.findUnique({
      where: { id: Number(id) },
      include: {
        appointments: {
          include: {
            result: true,
          },
        },
      },
    })

    if (!order) {
      return NextResponse.json(
        { error: 'Orden no encontrada' },
        { status: 404 }
      )
    }

    if (order.status === 'FINALIZADA') {
      return NextResponse.json(
        { error: 'No se puede eliminar una orden FINALIZADA' },
        { status: 400 }
      )
    }

    const hasResults = order.appointments.some((a) => a.result)

    if (hasResults) {
      return NextResponse.json(
        { error: 'No se puede eliminar una orden con resultados' },
        { status: 400 }
      )
    }

    await prisma.appointment.deleteMany({
      where: { orderId: Number(id) },
    })

    await prisma.labOrder.delete({
      where: { id: Number(id) },
    })

    await createAuditLog({
      user: auth.user,
      action: 'ELIMINAR ORDEN',
      entity: 'LAB_ORDER',
      entityId: Number(id),
      detail: `Orden eliminada`,
    })

    return NextResponse.json({ message: 'Orden eliminada' })
  } catch (error) {
    console.error(error)
    return NextResponse.json(
      { error: 'Error al eliminar orden' },
      { status: 500 }
    )
  }
}