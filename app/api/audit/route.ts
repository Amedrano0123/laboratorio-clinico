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

  const logs = await prisma.auditLog.findMany({
    orderBy: {
      createdAt: 'desc',
    },
    take: 200,
  })

  return NextResponse.json(logs)
}