import { cookies } from 'next/headers'

export async function getCurrentUser() {
  const cookieStore = await cookies()
  const userCookie = cookieStore.get('lab_user')

  if (!userCookie?.value) return null

  try {
    return JSON.parse(decodeURIComponent(userCookie.value))
  } catch {
    return null
  }
}

export async function requireRole(allowedRoles: string[]) {
  const user = await getCurrentUser()

  if (!user) {
    return {
      ok: false,
      status: 401,
      error: 'No has iniciado sesión',
      user: null,
    }
  }

  if (!allowedRoles.includes(user.role)) {
    return {
      ok: false,
      status: 403,
      error: 'No tienes permiso para esta acción',
      user,
    }
  }

  return {
    ok: true,
    status: 200,
    error: null,
    user,
  }
}