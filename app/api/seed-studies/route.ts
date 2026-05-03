import { prisma } from '@/app/lib/prisma'
import { NextResponse } from 'next/server'
import { requireRole } from '@/app/lib/auth-server'

export async function GET() {
  const auth = await requireRole(['ADMIN'])

  if (!auth.ok) {
    return NextResponse.json(
      { error: auth.error },
      { status: auth.status }
    )
  }

  const studies = [
    { name: 'Biometría hematica', price: 150 },
    { name: 'Química sanguínea', price: 200 },
    { name: 'Urianálisis', price: 120 },
    { name: 'Inmunología', price: 250 },
  ]

  for (const study of studies) {
    const existing = await prisma.study.findFirst({
      where: { name: study.name },
    })

    if (!existing) {
      await prisma.study.create({
        data: study,
      })
    }
  }

  return NextResponse.json({
    message: 'Estudios cargados correctamente',
    studies,
  })
}