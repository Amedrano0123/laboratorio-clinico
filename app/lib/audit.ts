import { prisma } from '@/app/lib/prisma'

type AuditInput = {
  user?: any | null
  action: string
  entity: string
  entityId?: number | null
  detail?: string | null
}

export async function createAuditLog({
  user,
  action,
  entity,
  entityId,
  detail,
}: AuditInput) {
  try {
    await prisma.auditLog.create({
      data: {
        userId: user?.id || null,
        userName: user?.name || null,
        userRole: user?.role || null,
        action,
        entity,
        entityId: entityId || null,
        detail: detail || null,
      },
    })
  } catch (error) {
    console.error('Error creando auditoría:', error)
  }
}