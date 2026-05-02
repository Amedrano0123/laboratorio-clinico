import { prisma } from '@/app/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const studies = await prisma.study.findMany({
      orderBy: { name: 'asc' },
    })

    return NextResponse.json(studies)
  } catch (error) {
    console.error(error)
    return NextResponse.json(
      { error: 'Error al obtener estudios' },
      { status: 500 }
    )
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()

    const name = String(body.name || '').trim()
    const price = body.price ? Number(body.price) : null

    if (!name) {
      return NextResponse.json(
        { error: 'El nombre del estudio es obligatorio' },
        { status: 400 }
      )
    }

    const study = await prisma.study.create({
      data: { name, price },
    })

    return NextResponse.json(study)
  } catch (error) {
    console.error(error)
    return NextResponse.json(
      { error: 'Error al guardar estudio o estudio duplicado' },
      { status: 500 }
    )
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json()

    const id = Number(body.id)
    const name = String(body.name || '').trim()
    const price = body.price ? Number(body.price) : null

    if (!id || !name) {
      return NextResponse.json(
        { error: 'ID y nombre son obligatorios' },
        { status: 400 }
      )
    }

    const study = await prisma.study.update({
      where: { id },
      data: { name, price },
    })

    return NextResponse.json(study)
  } catch (error) {
    console.error(error)
    return NextResponse.json(
      { error: 'Error al actualizar estudio' },
      { status: 500 }
    )
  }
}

export async function DELETE(req: Request) {
  try {
    const body = await req.json()
    const id = Number(body.id)

    if (!id) {
      return NextResponse.json(
        { error: 'ID es obligatorio' },
        { status: 400 }
      )
    }

    await prisma.study.delete({
      where: { id },
    })

    return NextResponse.json({ message: 'Estudio eliminado' })
  } catch (error) {
    console.error(error)
    return NextResponse.json(
      { error: 'Error al eliminar estudio' },
      { status: 500 }
    )
  }
}