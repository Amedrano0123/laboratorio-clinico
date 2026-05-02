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

  try {
    const logs = await prisma.auditLog.findMany({
      orderBy: { createdAt: 'desc' },
    })

    const headers = [
      'Fecha',
      'Usuario',
      'Rol',
      'Acción',
      'Entidad',
      'ID',
      'Detalle',
    ]

    const rows = logs.map((log) => [
      new Date(log.createdAt).toLocaleString(),
      log.userName || '',
      log.userRole || '',
      log.action,
      log.entity,
      log.entityId || '',
      log.detail || '',
    ])

    const csv = [
      headers.join(','),
      ...rows.map((row) =>
        row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(',')
      ),
    ].join('\n')

    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': 'attachment; filename=auditoria.csv',
      },
    })
  } catch (error) {
    console.error(error)

    return NextResponse.json(
      { error: 'Error al exportar auditoría' },
      { status: 500 }
    )
  }
}