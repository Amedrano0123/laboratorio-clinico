'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';

type Order = {
  id: number;
  status: string;
  createdAt: string;
  notes: string | null;
  appointments: {
    id: number;
    study: {
      name: string;
    };
    result: {
      id: number;
    } | null;
  }[];
};

export default function PatientHistoryPage() {
  const params = useParams();
  const [orders, setOrders] = useState<Order[]>([]);

  async function loadOrders() {
    const res = await fetch(`/api/orders/by-patient/${params.id}`);
    const data = await res.json();
    setOrders(data);
  }

  useEffect(() => {
    loadOrders();
  }, [params.id]);

  return (
    <main className="min-h-screen bg-gray-100 p-8">

      <a href="/pacientes" className="text-blue-600">
        ← Regresar a pacientes
      </a>

      <h1 className="text-3xl font-bold mt-4">
        Historial del paciente
      </h1>

      <div className="mt-6 bg-white p-6 rounded shadow">
        {orders.map((order) => {

          const total = order.appointments.length;
          const completed = order.appointments.filter(a => a.result).length;

          return (
            <div key={order.id} className="mb-4 border-b pb-4">

              <div className="flex justify-between items-center">
                <div>
                  <p className="font-bold">
                    {`ORD-${String(order.id).padStart(4, '0')}`}
                  </p>

                  <p className="text-sm text-gray-500">
                    {new Date(order.createdAt).toLocaleString()}
                  </p>

                  <p className="text-sm">
                    Estado: {order.status}
                  </p>

                  <p className="text-sm">
                    Estudios: {completed}/{total}
                  </p>
                </div>

                <div className="space-x-2">

                  <a
                    href={`/orders/${order.id}`}
                    className="bg-blue-600 text-white px-3 py-1 rounded"
                  >
                    Ver
                  </a>

                  <a
                    href={`/orders/${order.id}/print`}
                    className="bg-green-600 text-white px-3 py-1 rounded"
                  >
                    PDF
                  </a>

                </div>
              </div>

              <ul className="mt-2 ml-4 list-disc text-sm">
                {order.appointments.map((a) => (
                  <li key={a.id}>
                    {a.study.name} {a.result ? '✅' : '⏳'}
                  </li>
                ))}
              </ul>

            </div>
          );
        })}

        {orders.length === 0 && (
          <p>No hay historial</p>
        )}

      </div>

    </main>
  );
}