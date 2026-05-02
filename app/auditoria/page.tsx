'use client';

import { useEffect, useState } from 'react';
import UserBar from '@/components/UserBar';

type AuditLog = {
  id: number;
  userName: string | null;
  userRole: string | null;
  action: string;
  entity: string;
  entityId: number | null;
  detail: string | null;
  createdAt: string;
};

export default function AuditoriaPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);

  async function loadLogs() {
    const res = await fetch('/api/audit');
    const data = await res.json();

    if (!res.ok) {
      alert(data.error || 'Error al cargar auditoría');
      return;
    }

    setLogs(data);
  }

  useEffect(() => {
    loadLogs();
  }, []);

  return (
    <main className="min-h-screen bg-gray-100 p-8">
      <UserBar />

      <div className="mt-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold">Auditoría</h1>

        <button
          onClick={() => {
            window.open('/api/audit/export', '_blank');
          }}
          className="rounded bg-green-600 px-4 py-2 text-white hover:bg-green-700"
        >
          Descargar Excel
        </button>
      </div>

      <section className="mt-6 rounded-xl bg-white p-6 shadow">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b text-left">
              <th className="p-2">Fecha</th>
              <th className="p-2">Usuario</th>
              <th className="p-2">Rol</th>
              <th className="p-2">Acción</th>
              <th className="p-2">Entidad</th>
              <th className="p-2">ID</th>
              <th className="p-2">Detalle</th>
            </tr>
          </thead>

          <tbody>
            {logs.map((log) => (
              <tr key={log.id} className="border-b align-top">
                <td className="p-2">
                  {new Date(log.createdAt).toLocaleString()}
                </td>
                <td className="p-2">{log.userName || '-'}</td>
                <td className="p-2">{log.userRole || '-'}</td>
                <td className="p-2 font-semibold">{log.action}</td>
                <td className="p-2">{log.entity}</td>
                <td className="p-2">{log.entityId || '-'}</td>
                <td className="p-2">{log.detail || '-'}</td>
              </tr>
            ))}

            {logs.length === 0 && (
              <tr>
                <td colSpan={7} className="p-2 text-gray-500">
                  Sin movimientos
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </section>
    </main>
  );
}