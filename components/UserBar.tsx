'use client';

import { useEffect, useState } from 'react';

type User = {
  name: string;
  role: string;
};

export default function UserBar() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const cookie = document.cookie
      .split('; ')
      .find((row) => row.startsWith('lab_user='));

    if (cookie) {
      const value = cookie.split('=')[1];

      try {
        setUser(JSON.parse(decodeURIComponent(value)));
      } catch {
        setUser(null);
      }
    }
  }, []);

  async function logout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    window.location.href = '/login';
  }

  if (!user) return null;

  const isAdmin = user.role === 'ADMIN';
  const isRecepcion = user.role === 'RECEPCION';
  const isLaboratorio = user.role === 'LABORATORIO';

  return (
    <div className="rounded-xl bg-gray-900 px-6 py-4 text-white shadow">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-lg font-bold">Sistema Laboratorio</p>
          <p className="text-sm text-gray-300">
            {user.name} · {user.role}
          </p>
        </div>

        <nav className="flex flex-wrap gap-2">
          <a href="/dashboard" className="rounded bg-gray-700 px-3 py-2 text-sm hover:bg-gray-600">
            Dashboard
          </a>

          {(isAdmin || isRecepcion) && (
            <a href="/pacientes" className="rounded bg-gray-700 px-3 py-2 text-sm hover:bg-gray-600">
              Pacientes
            </a>
          )}

          {(isAdmin || isRecepcion || isLaboratorio) && (
            <a href="/orders" className="rounded bg-gray-700 px-3 py-2 text-sm hover:bg-gray-600">
              Órdenes
            </a>
          )}

          {isAdmin && (
            <a href="/admin/usuarios" className="rounded bg-gray-700 px-3 py-2 text-sm hover:bg-gray-600">
              Usuarios
            </a>
          )}

          {isAdmin && (
            <a href="/auditoria" className="rounded bg-gray-700 px-3 py-2 text-sm hover:bg-gray-600">
              Auditoría
            </a>
          )}

          <button onClick={logout} className="rounded bg-red-600 px-3 py-2 text-sm hover:bg-red-700">
            Cerrar sesión
          </button>
        </nav>
      </div>
    </div>
  );
}