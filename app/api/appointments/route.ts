import { prisma } from '@/app/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const appointments = await prisma.appointment.findMany({
      include: {
        patient: true,
        study: true,
      },
      orderBy: { date: 'asc' },
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

export async function POST(req: Request) {
  try {
    const body = await req.json()

    const patientId = Number(body.patientId)
    const studyId = Number(body.studyId)
    const date = body.date
    const notes = String(body.notes || '').trim()

    if (!patientId || !studyId || !date) {
      return NextResponse.json(
        { error: 'Paciente, estudio y fecha son obligatorios' },
        { status: 400 }
      )
    }

    const appointment = await prisma.appointment.create({
      data: {
        patientId,
        studyId,
        date: new Date(date),
        notes: notes || null,
      },
      include: {
        patient: true,
        study: true,
      },
    })

    return NextResponse.json(appointment)
  } catch (error) {
    console.error(error)
    return NextResponse.json(
      { error: 'Error al guardar cita' },
      { status: 500 }
    )
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json()

    const id = Number(body.id)
    const patientId = Number(body.patientId)
    const studyId = Number(body.studyId)
    const date = body.date
    const notes = String(body.notes || '').trim()

    const existing = await prisma.appointment.findUnique({
      where: { id },
    })

    if (!existing) {
      return NextResponse.json(
        { error: 'La cita no existe' },
        { status: 404 }
      )
    }

    if (existing.status !== 'PROGRAMADA') {
      return NextResponse.json(
        { error: 'Solo se pueden editar citas PROGRAMADAS' },
        { status: 400 }
      )
    }

    const appointment = await prisma.appointment.update({
      where: { id },
      data: {
        patientId,
        studyId,
        date: new Date(date),
        notes: notes || null,
      },
      include: {
        patient: true,
        study: true,
      },
    })

    return NextResponse.json(appointment)
  } catch (error) {
    console.error(error)
    return NextResponse.json(
      { error: 'Error al actualizar cita' },
      { status: 500 }
    )
  }
}

export async function DELETE(req: Request) {
  try {
    const body = await req.json()
    const id = Number(body.id)

    const existing = await prisma.appointment.findUnique({
      where: { id },
    })

    if (!existing) {
      return NextResponse.json(
        { error: 'La cita no existe' },
        { status: 404 }
      )
    }

    if (existing.status !== 'PROGRAMADA') {
      return NextResponse.json(
        { error: 'Solo se pueden eliminar citas PROGRAMADAS' },
        { status: 400 }
      )
    }

    await prisma.appointment.delete({
      where: { id },
    })

    return NextResponse.json({ message: 'Cita eliminada' })
  } catch (error) {
    console.error(error)
    return NextResponse.json(
      { error: 'Error al eliminar cita' },
      { status: 500 }
    )
  }
}