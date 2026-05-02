import { prisma } from '@/app/lib/prisma'
import { NextResponse } from 'next/server'

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

    const now = new Date()

    const totalOrders = orders.length
    const openOrders = orders.filter((o) => o.status === 'ABIERTA').length
    const closedOrders = orders.filter((o) => o.status === 'FINALIZADA').length

    const totalStudies = orders.reduce(
      (sum, order) => sum + order.appointments.length,
      0
    )

    const pendingResults = orders.reduce(
      (sum, order) => sum + order.appointments.filter((a) => !a.result).length,
      0
    )

    const completedResults = orders.reduce(
      (sum, order) => sum + order.appointments.filter((a) => a.result).length,
      0
    )

    const alerts = orders
      .filter((order) => order.status !== 'FINALIZADA')
      .map((order) => {
        const total = order.appointments.length
        const completed = order.appointments.filter((a) => a.result).length
        const pending = total - completed

        const createdAt = new Date(order.createdAt)
        const hoursOpen = Math.floor(
          (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60)
        )

        let level = 'INFO'
        let message = 'Orden en proceso'

        if (pending > 0 && hoursOpen >= 24) {
          level = 'CRITICA'
          message = `Orden con ${pending} estudio(s) pendiente(s) por más de 24 horas`
        } else if (pending > 0) {
          level = 'PENDIENTE'
          message = `Orden con ${pending} estudio(s) pendiente(s)`
        } else if (pending === 0 && total > 0) {
          level = 'LISTA'
          message = 'Orden lista para finalizar'
        }

        return {
          id: order.id,
          folio: order.folio,
          patientName: order.patient.name,
          status: order.status,
          total,
          completed,
          pending,
          hoursOpen,
          level,
          message,
        }
      })

    return NextResponse.json({
      totalOrders,
      openOrders,
      closedOrders,
      totalStudies,
      pendingResults,
      completedResults,
      alerts,
      recentOrders: orders.slice(0, 10),
    })
  } catch (error) {
    console.error(error)

    return NextResponse.json(
      { error: 'Error al obtener dashboard' },
      { status: 500 }
    )
  }
}