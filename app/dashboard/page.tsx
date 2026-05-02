'use client';

import { useEffect, useState } from 'react';
import UserBar from '@/components/UserBar';

type DashboardData = {
  totalOrders: number;
  openOrders: number;
  closedOrders: number;
  totalStudies: number;
  pendingResults: number;
  completedResults: number;
  alerts: {
    id: number;
    folio: string | null;
    patientName: string;
    status: string;
    total: number;
    completed: number;
    pending: number;
    hoursOpen: number;
    level: string;
    message: string;
  }[];
  recentOrders: {
    id: number;
    folio: string | null;
    status: string;
    createdAt: string;
    patient: {
      name: string;
    };
    appointments: {
      id: number;
      result: {
        id: number;
      } | null;
      study: {
        name: string;
      };
    }[];
  }[];
};

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);

  async function loadDashboard() {
    const res = await fetch('/api/dashboard');
    const json = await res.json();
    setData(json);
  }

  useEffect(() => {
    loadDashboard();
  }, []);

  if (!data) {
    return <main className="p-8">Cargando dashboard...</main>;
  }

  return (
    <main className="min-h-screen bg-gray-100 p-8">
      <UserBar />

      <h1 className="mt-6 text-3xl font-bold">Dashboard</h1>

      <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
        <Card title="Órdenes totales" value={data.totalOrders} color="blue" />
        <Card title="Órdenes abiertas" value={data.openOrders} color="yellow" />
        <Card title="Órdenes finalizadas" value={data.closedOrders} color="green" />
        <Card title="Estudios totales" value={data.totalStudies} color="blue" />
        <Card title="Resultados pendientes" value={data.pendingResults} color="red" />
        <Card title="Resultados capturados" value={data.completedResults} color="green" />
      </div>

      <section className="mt-6 rounded-xl bg-white p-6 shadow">
        <h2 className="text-xl font-semibold">Alertas operativas</h2>

        {data.alerts.length === 0 ? (
          <p className="mt-4 text-gray-500">No hay alertas activas</p>
        ) : (
          <div className="mt-4 grid gap-3">
            {data.alerts.map((alert) => (
              <a
                key={alert.id}
                href={`/orders/${alert.id}`}
                className={`rounded border p-4 hover:shadow ${
                  alert.level === 'CRITICA'
                    ? 'border-red-300 bg-red-50 text-red-800'
                    : alert.level === 'PENDIENTE'
                    ? 'border-yellow-300 bg-yellow-50 text-yellow-800'
                    : alert.level === 'LISTA'
                    ? 'border-green-300 bg-green-50 text-green-800'
                    : 'border-blue-300 bg-blue-50 text-blue-800'
                }`}
              >
                <div className="flex flex-col justify-between gap-2 md:flex-row md:items-center">
                  <div>
                    <p className="font-bold">
                      {alert.folio || `ORD-${String(alert.id).padStart(4, '0')}`} — {alert.patientName}
                    </p>
                    <p className="text-sm">{alert.message}</p>
                  </div>

                  <div className="text-sm font-semibold">
                    Avance: {alert.completed}/{alert.total} · {alert.hoursOpen}h abierta
                  </div>
                </div>
              </a>
            ))}
          </div>
        )}
      </section>

      <section className="mt-6 rounded-xl bg-white p-6 shadow">
        <h2 className="text-xl font-semibold">Órdenes recientes</h2>

        {data.recentOrders.length === 0 ? (
          <p className="mt-4 text-gray-500">No hay órdenes registradas</p>
        ) : (
          <table className="mt-4 w-full border-collapse">
            <thead>
              <tr className="border-b text-left">
                <th className="p-2">Folio</th>
                <th className="p-2">Paciente</th>
                <th className="p-2">Estado</th>
                <th className="p-2">Avance</th>
                <th className="p-2">Fecha</th>
                <th className="p-2">Acción</th>
              </tr>
            </thead>

            <tbody>
              {data.recentOrders.map((order) => {
                const total = order.appointments.length;
                const completed = order.appointments.filter((a) => a.result).length;

                return (
                  <tr key={order.id} className="border-b">
                    <td className="p-2 font-semibold">
                      {order.folio || `ORD-${String(order.id).padStart(4, '0')}`}
                    </td>
                    <td className="p-2">{order.patient.name}</td>
                    <td className="p-2">{order.status}</td>
                    <td className="p-2">
                      {completed}/{total}
                    </td>
                    <td className="p-2">
                      {new Date(order.createdAt).toLocaleString()}
                    </td>
                    <td className="p-2">
                      <a
                        href={`/orders/${order.id}`}
                        className="rounded bg-blue-600 px-3 py-1 text-white"
                      >
                        Ver
                      </a>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </section>
    </main>
  );
}

function Card({
  title,
  value,
  color,
}: {
  title: string;
  value: number;
  color: 'blue' | 'yellow' | 'green' | 'red';
}) {
  const colors = {
    blue: 'bg-blue-100 text-blue-800',
    yellow: 'bg-yellow-100 text-yellow-800',
    green: 'bg-green-100 text-green-800',
    red: 'bg-red-100 text-red-800',
  };

  return (
    <div className={`rounded-xl p-6 shadow ${colors[color]}`}>
      <p className="text-sm font-semibold">{title}</p>
      <p className="mt-2 text-3xl font-bold">{value}</p>
    </div>
  );
}