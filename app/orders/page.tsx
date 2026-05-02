'use client';

import { useEffect, useMemo, useState } from 'react';
import UserBar from '@/components/UserBar';

type Patient = {
  id: number;
  name: string;
};

type Study = {
  id: number;
  name: string;
  price: number | null;
};

type Order = {
  id: number;
  folio: string | null;
  status: string;
  createdAt: string;
  patient: {
    name: string;
  };
  appointments?: {
    id: number;
    study: Study;
  }[];
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [studies, setStudies] = useState<Study[]>([]);

  const [selectedPatient, setSelectedPatient] = useState<number | null>(null);
  const [selectedStudies, setSelectedStudies] = useState<number[]>([]);
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  async function loadData() {
    const [ordersRes, patientsRes, studiesRes] = await Promise.all([
      fetch('/api/orders'),
      fetch('/api/patients'),
      fetch('/api/studies'),
    ]);

    const ordersData = await ordersRes.json();
    const patientsData = await patientsRes.json();
    const studiesData = await studiesRes.json();

    setOrders(Array.isArray(ordersData) ? ordersData : []);
    setPatients(Array.isArray(patientsData) ? patientsData : []);
    setStudies(Array.isArray(studiesData) ? studiesData : []);
  }

  useEffect(() => {
    loadData();
  }, []);

  const total = useMemo(() => {
    return studies
      .filter((s) => selectedStudies.includes(s.id))
      .reduce((sum, study) => sum + (study.price || 0), 0);
  }, [studies, selectedStudies]);

  const filteredOrders = useMemo(() => {
    const term = search.toLowerCase().trim();

    return orders.filter((order) => {
      const folio = (order.folio || `ORD-${String(order.id).padStart(4, '0')}`).toLowerCase();
      const patientName = order.patient?.name?.toLowerCase() || '';
      const status = order.status?.toLowerCase() || '';

      const matchesSearch =
        !term ||
        folio.includes(term) ||
        patientName.includes(term) ||
        status.includes(term);

      const matchesStatus =
        !statusFilter || order.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [orders, search, statusFilter]);

  function toggleStudy(id: number) {
    setSelectedStudies((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }

  async function createOrder() {
    if (!selectedPatient) {
      alert('Selecciona un paciente');
      return;
    }

    if (selectedStudies.length === 0) {
      alert('Selecciona al menos un estudio');
      return;
    }

    setSaving(true);

    const res = await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        patientId: selectedPatient,
        studyIds: selectedStudies,
        notes,
      }),
    });

    const data = await res.json();

    setSaving(false);

    if (!res.ok) {
      alert(data.error || 'Error al crear orden ❌');
      return;
    }

    alert(`Orden creada ✅ ${data.folio || ''}`);

    setSelectedPatient(null);
    setSelectedStudies([]);
    setNotes('');

    loadData();
  }

  return (
    <main className="min-h-screen bg-gray-100 p-8">
  <UserBar />
      <h1 className="text-3xl font-bold">Órdenes</h1>

      <section className="mt-6 rounded-xl bg-white p-6 shadow">
        <h2 className="text-xl font-semibold">Nueva orden</h2>

        <div className="mt-4 grid gap-4">
          <select
            className="rounded border p-2"
            value={selectedPatient || ''}
            onChange={(e) =>
              setSelectedPatient(e.target.value ? Number(e.target.value) : null)
            }
          >
            <option value="">Selecciona paciente</option>
            {patients.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>

          <div className="rounded border p-4">
            <div className="mb-3 flex items-center justify-between">
              <p className="font-semibold">Selecciona estudios</p>
              <p className="text-sm font-semibold">Total: ${total}</p>
            </div>

            {studies.length === 0 && (
              <p className="text-gray-500">No hay estudios registrados.</p>
            )}

            <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
              {studies.map((s) => (
                <label
                  key={s.id}
                  className="flex cursor-pointer items-center justify-between rounded border p-2 hover:bg-gray-50"
                >
                  <span>
                    <input
                      type="checkbox"
                      className="mr-2"
                      checked={selectedStudies.includes(s.id)}
                      onChange={() => toggleStudy(s.id)}
                    />
                    {s.name}
                  </span>

                  <span className="text-sm font-semibold text-gray-600">
                    ${s.price || 0}
                  </span>
                </label>
              ))}
            </div>
          </div>

          <textarea
            placeholder="Notas de la orden"
            className="min-h-20 rounded border p-2"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />

          <button
            onClick={createOrder}
            disabled={saving}
            className="rounded bg-blue-600 p-2 text-white hover:bg-blue-700 disabled:bg-gray-400"
          >
            {saving ? 'Creando orden...' : 'Crear orden'}
          </button>
        </div>
      </section>

      <section className="mt-6 rounded-xl bg-white p-6 shadow">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <h2 className="text-xl font-semibold">Órdenes registradas</h2>

          <div className="flex flex-col gap-2 md:flex-row">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por folio, paciente o estado"
              className="rounded border p-2 md:w-80"
            />

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded border p-2"
            >
              <option value="">Todos los estados</option>
              <option value="ABIERTA">ABIERTA</option>
              <option value="FINALIZADA">FINALIZADA</option>
            </select>
          </div>
        </div>

        {filteredOrders.length === 0 ? (
          <p className="mt-4 text-gray-500">No hay órdenes</p>
        ) : (
          <table className="mt-4 w-full border-collapse">
            <thead>
              <tr className="border-b text-left">
                <th className="p-2">Folio</th>
                <th className="p-2">Paciente</th>
                <th className="p-2">Estado</th>
                <th className="p-2">Estudios</th>
                <th className="p-2">Fecha</th>
                <th className="p-2">Acción</th>
              </tr>
            </thead>

            <tbody>
              {filteredOrders.map((o) => (
                <tr key={o.id} className="border-b align-top">
                  <td className="p-2 font-semibold">
                    {o.folio || `ORD-${String(o.id).padStart(4, '0')}`}
                  </td>

                  <td className="p-2">{o.patient?.name || '-'}</td>

                  <td className="p-2">
                    <span
                      className={`rounded px-2 py-1 text-xs font-semibold ${
                        o.status === 'FINALIZADA'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-blue-100 text-blue-700'
                      }`}
                    >
                      {o.status}
                    </span>
                  </td>

                  <td className="p-2">
                    {o.appointments && o.appointments.length > 0 ? (
                      <ul className="list-disc pl-4">
                        {o.appointments.map((a) => (
                          <li key={a.id}>{a.study.name}</li>
                        ))}
                      </ul>
                    ) : (
                      '-'
                    )}
                  </td>

                  <td className="p-2">
                    {new Date(o.createdAt).toLocaleString()}
                  </td>

                  <td className="p-2">
                    <a
                      href={`/orders/${o.id}`}
                      className="rounded bg-gray-700 px-3 py-1 text-white hover:bg-gray-800"
                    >
                      Ver detalle
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </main>
  );
}