'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'next/navigation';
import UserBar from '@/components/UserBar';

type Study = {
  id: number;
  name: string;
  price: number | null;
};

type Result = {
  id: number;
  values?: string | null;
  notes?: string | null;
  resultText?: string | null;
  observations?: string | null;
};

type Appointment = {
  id: number;
  status: string;
  date: string;
  notes: string | null;
  study: Study;
  result: Result | null;
};

type Order = {
  id: number;
  folio: string | null;
  status: string;
  notes: string | null;
  createdAt: string;
  patient: {
    name: string;
  };
  appointments: Appointment[];
};

type User = {
  name: string;
  role: string;
};

const templatesByStudyId: Record<number, { name: string; unit: string }[]> = {
  1: [
    { name: 'Hematocrito', unit: '%' },
    { name: 'Hemoglobina', unit: 'g/dL' },
    { name: 'V.G.M.', unit: 'fL' },
    { name: 'C.M. de Hb', unit: '%' },
    { name: 'Eritrocitos', unit: 'mill/mm³' },
    { name: 'Leucocitos', unit: 'mm³' },
    { name: 'Linfocitos', unit: '%' },
    { name: 'Monocitos', unit: '%' },
    { name: 'Neutrófilos', unit: '%' },
    { name: 'Eosinófilos', unit: '%' },
    { name: 'Basófilos', unit: '%' },
    { name: 'En banda', unit: '%' },
    { name: 'Mielocitos', unit: '%' },
    { name: 'Juveniles', unit: '%' },
    { name: 'Plaquetas', unit: 'mm³' },
    { name: 'Grupo sanguíneo', unit: '' },
    { name: 'Factor Rh', unit: '' },
  ],
  2: [
    { name: 'Glucosa', unit: 'mg/dL' },
    { name: 'Urea', unit: 'mg/dL' },
    { name: 'Creatinina', unit: 'mg/dL' },
    { name: 'Ácido úrico', unit: 'mg/dL' },
    { name: 'Colesterol', unit: 'mg/dL' },
    { name: 'TGP', unit: 'U/L' },
    { name: 'TGO', unit: 'U/L' },
    { name: 'Bilirrubina total', unit: 'mg/dL' },
    { name: 'Bilirrubina directa', unit: 'mg/dL' },
    { name: 'Bilirrubina indirecta', unit: 'mg/dL' },
    { name: 'Fosfatasa alcalina', unit: 'U/L' },
    { name: 'Fosfatasa ácida', unit: 'U/L' },
    { name: 'Triglicéridos', unit: 'mg/dL' },
  ],
  3: [
    { name: 'Color', unit: '' },
    { name: 'Aspecto', unit: '' },
    { name: 'Densidad', unit: '' },
    { name: 'Volumen', unit: '' },
    { name: 'Reacción (pH)', unit: '' },
    { name: 'Albúmina', unit: '' },
    { name: 'Glucosa', unit: '' },
    { name: 'Cetona', unit: '' },
    { name: 'Hemoglobina', unit: '' },
    { name: 'Bilirrubina', unit: '' },
    { name: 'Nitritos', unit: '' },
    { name: 'Urobilinógeno', unit: '' },
  ],
  4: [
    { name: 'Salmonella O', unit: '' },
    { name: 'Salmonella H', unit: '' },
    { name: 'Paratífico A', unit: '' },
    { name: 'Paratífico B', unit: '' },
    { name: 'Brucella abortus', unit: '' },
    { name: 'Proteus OX-19', unit: '' },
    { name: 'Factor reumatoide', unit: '' },
    { name: 'Proteína C reactiva', unit: '' },
  ],
};

function getUserFromCookie(): User | null {
  const cookie = document.cookie
    .split('; ')
    .find((row) => row.startsWith('lab_user='));

  if (!cookie) return null;

  try {
    return JSON.parse(decodeURIComponent(cookie.split('=')[1]));
  } catch {
    return null;
  }
}

function getResultText(result: Result | null) {
  return result?.values || result?.resultText || '';
}

function getResultNotes(result: Result | null) {
  return result?.notes || result?.observations || '';
}

function parseResultValue(resultText: string, fieldName: string, unit: string) {
  const line = resultText
    .split('\n')
    .find((item) => item.startsWith(`${fieldName}:`));

  if (!line) return '';

  return line.replace(`${fieldName}:`, '').replace(unit, '').trim();
}

export default function OrderDetailPage() {
  const params = useParams();
  const orderId = params.id as string;

  const [user, setUser] = useState<User | null>(null);
  const [order, setOrder] = useState<Order | null>(null);
  const [selectedAppointmentId, setSelectedAppointmentId] = useState<number | null>(null);
  const [editingResultId, setEditingResultId] = useState<number | null>(null);

  async function loadOrder() {
    const res = await fetch(`/api/orders/${orderId}`);
    const data = await res.json();
    setOrder(data);
  }

  useEffect(() => {
    const currentUser = getUserFromCookie();

    if (!currentUser) {
      window.location.href = '/login';
      return;
    }

    setUser(currentUser);
    loadOrder();
  }, [orderId]);

  const selectedAppointment = useMemo(() => {
    return order?.appointments.find((a) => a.id === selectedAppointmentId) || null;
  }, [order, selectedAppointmentId]);

  const fields = selectedAppointment
    ? templatesByStudyId[selectedAppointment.study.id] || []
    : [];

  const totalStudies = order?.appointments.length || 0;
  const completedStudies = order?.appointments.filter((a) => a.result).length || 0;
  const pendingStudies = totalStudies - completedStudies;

  const allHaveResults = totalStudies > 0 && completedStudies === totalStudies;
  const isFinalized = order?.status === 'FINALIZADA';
  const hasResults = order?.appointments.some((a) => a.result) || false;

  if (!order || !user) {
    return <main className="p-8">Cargando orden...</main>;
  }

  return (
    <main className="min-h-screen bg-gray-100 p-8">
      <UserBar />

      <div className="mt-6">
        <a href="/orders" className="text-blue-600 hover:underline">
          ← Regresar a órdenes
        </a>
      </div>

      <section className="mt-4 rounded-xl bg-white p-6 shadow">
        <h1 className="text-3xl font-bold">
          {order.folio || `ORD-${String(order.id).padStart(4, '0')}`}
        </h1>

        <div className="mt-4 grid gap-2 md:grid-cols-3">
          <p><b>Paciente:</b> {order.patient.name}</p>
          <p><b>Estado:</b> {order.status}</p>
          <p><b>Fecha:</b> {new Date(order.createdAt).toLocaleString()}</p>
        </div>

        <p className="mt-2"><b>Notas:</b> {order.notes || '-'}</p>

        <div className="mt-6 grid grid-cols-1 gap-3 md:grid-cols-3">
          <div className="rounded bg-blue-100 p-4 text-blue-800">
            <p className="text-sm font-semibold">Total estudios</p>
            <p className="text-2xl font-bold">{totalStudies}</p>
          </div>

          <div className="rounded bg-green-100 p-4 text-green-800">
            <p className="text-sm font-semibold">Resultados capturados</p>
            <p className="text-2xl font-bold">{completedStudies}</p>
          </div>

          <div className="rounded bg-red-100 p-4 text-red-800">
            <p className="text-sm font-semibold">Pendientes</p>
            <p className="text-2xl font-bold">{pendingStudies}</p>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-2">
          {(user.role === 'LABORATORIO' || user.role === 'ADMIN') && (
            <button
              className="rounded bg-green-600 px-4 py-2 text-white disabled:bg-gray-400"
              disabled={!allHaveResults || isFinalized}
              onClick={async () => {
                if (!confirm('¿Seguro que deseas finalizar la orden?')) return;

                const res = await fetch(`/api/orders/${order.id}`, {
                  method: 'PATCH',
                });

                const data = await res.json();

                if (!res.ok) {
                  alert(data.error || 'Error al finalizar orden ❌');
                  return;
                }

                alert('Orden finalizada ✅');
                loadOrder();
              }}
            >
              Finalizar orden
            </button>
          )}

          <a
            href={`/orders/${order.id}/print`}
            className="rounded bg-blue-600 px-4 py-2 text-white"
          >
            Imprimir orden
          </a>

          {(user.role === 'RECEPCION' || user.role === 'ADMIN') && !isFinalized && !hasResults && (
            <button
              className="rounded bg-yellow-500 px-4 py-2 text-white"
              onClick={async () => {
                const patientId = prompt('Nuevo ID de paciente:', '');
                if (!patientId) return;

                const notes = prompt('Notas de la orden:', order.notes || '') || '';

                const res = await fetch(`/api/orders/${order.id}`, {
                  method: 'PATCH',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    patientId: Number(patientId),
                    notes,
                  }),
                });

                const data = await res.json();

                if (!res.ok) {
                  alert(data.error || 'Error al editar orden ❌');
                  return;
                }

                alert('Orden actualizada ✅');
                loadOrder();
              }}
            >
              Editar orden
            </button>
          )}

          {user.role === 'ADMIN' && !isFinalized && !hasResults && (
            <button
              className="rounded bg-red-600 px-4 py-2 text-white"
              onClick={async () => {
                if (!confirm('¿Seguro que deseas eliminar esta orden?')) return;

                const res = await fetch(`/api/orders/${order.id}`, {
                  method: 'DELETE',
                });

                const data = await res.json();

                if (!res.ok) {
                  alert(data.error || 'Error al eliminar orden ❌');
                  return;
                }

                alert('Orden eliminada ✅');
                window.location.href = '/orders';
              }}
            >
              Eliminar orden
            </button>
          )}
        </div>

        {!allHaveResults && (
          <p className="mt-3 text-sm text-red-600">
            Para finalizar la orden debes capturar todos los resultados.
          </p>
        )}

        {isFinalized && (
          <p className="mt-3 text-sm text-green-700">
            Orden finalizada. Los resultados ya están bloqueados.
          </p>
        )}
      </section>

      <section className="mt-6 rounded-xl bg-white p-6 shadow">
        <h2 className="text-xl font-semibold">Estudios de la orden</h2>

        <table className="mt-4 w-full border-collapse">
          <thead>
            <tr className="border-b text-left">
              <th className="p-2">Estudio</th>
              <th className="p-2">Resultado</th>
              <th className="p-2">Estado cita</th>
              <th className="p-2">Acción</th>
            </tr>
          </thead>

          <tbody>
            {order.appointments.map((a) => {
              const isSelected = selectedAppointmentId === a.id;

              return (
                <tr key={a.id} className={`border-b align-top ${isSelected ? 'bg-blue-50' : ''}`}>
                  <td className="p-2 font-semibold">{a.study.name}</td>

                  <td className="p-2">
                    {a.result ? (
                      <span className="rounded bg-green-100 px-2 py-1 text-sm font-semibold text-green-700">
                        Capturado ✅
                      </span>
                    ) : (
                      <span className="rounded bg-red-100 px-2 py-1 text-sm font-semibold text-red-700">
                        Pendiente ⏳
                      </span>
                    )}
                  </td>

                  <td className="p-2">{a.status}</td>

                  <td className="p-2 space-x-2">
                    <button
                      className="rounded bg-gray-600 px-3 py-1 text-white"
                      onClick={() => {
                        setSelectedAppointmentId(a.id);
                        setEditingResultId(null);
                      }}
                    >
                      Ver
                    </button>

                    {(user.role === 'LABORATORIO' || user.role === 'ADMIN') && !a.result && !isFinalized && (
                      <button
                        className="rounded bg-blue-600 px-3 py-1 text-white"
                        onClick={() => {
                          setSelectedAppointmentId(a.id);
                          setEditingResultId(null);
                        }}
                      >
                        Capturar
                      </button>
                    )}

                    {(user.role === 'LABORATORIO' || user.role === 'ADMIN') && a.result && !isFinalized && (
                      <button
                        className="rounded bg-yellow-500 px-3 py-1 text-white"
                        onClick={() => {
                          setSelectedAppointmentId(a.id);
                          setEditingResultId(a.result?.id || null);
                        }}
                      >
                        Editar resultado
                      </button>
                    )}

                    {a.result && isFinalized && (
                      <span className="text-sm text-gray-400">Bloqueado</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </section>

      {selectedAppointment && (
        <section className="mt-6 rounded-xl bg-white p-6 shadow">
          <h2 className="text-xl font-semibold">
            {selectedAppointment.result
              ? editingResultId
                ? 'Editar resultado'
                : 'Resultado capturado'
              : 'Capturar resultado'}{' '}
            - {selectedAppointment.study.name}
          </h2>

          {selectedAppointment.result && !editingResultId ? (
            <div className="mt-4 rounded border bg-gray-50 p-4">
              <pre className="whitespace-pre-wrap text-sm">
                {getResultText(selectedAppointment.result)}
              </pre>

              <p className="mt-4">
                <b>Observaciones:</b>{' '}
                {getResultNotes(selectedAppointment.result) || '-'}
              </p>
            </div>
          ) : (
            <form
              className="mt-4 grid gap-4"
              onSubmit={async (e) => {
                e.preventDefault();

                const form = e.currentTarget;
                const formData = new FormData(form);

                const resultText =
                  fields.length > 0
                    ? fields
                        .map((f) => {
                          const value = formData.get(f.name) || '';
                          return `${f.name}: ${value} ${f.unit}`.trim();
                        })
                        .join('\n')
                    : String(formData.get('resultText') || '');

                const res = await fetch('/api/results', {
                  method: editingResultId ? 'PUT' : 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    id: editingResultId,
                    appointmentId: selectedAppointment.id,
                    resultText,
                    observations: formData.get('observations'),
                  }),
                });

                const data = await res.json();

                if (!res.ok) {
                  alert(data.error || 'Error al guardar resultado ❌');
                  return;
                }

                alert(editingResultId ? 'Resultado actualizado ✅' : 'Resultado guardado ✅');
                setSelectedAppointmentId(null);
                setEditingResultId(null);
                loadOrder();
              }}
            >
              {fields.length > 0 ? (
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                  {fields.map((f) => {
                    const isNumeric = Boolean(f.unit);
                    const savedText = getResultText(selectedAppointment.result);

                    return (
                      <div key={f.name} className="grid gap-1">
                        <label className="text-sm font-semibold">{f.name}</label>

                        <div className="flex items-center gap-2">
                          <input
                            name={f.name}
                            type={isNumeric ? 'number' : 'text'}
                            step={isNumeric ? '0.01' : undefined}
                            placeholder="Valor"
                            defaultValue={
                              selectedAppointment.result
                                ? parseResultValue(savedText, f.name, f.unit)
                                : ''
                            }
                            className="w-full rounded border bg-white p-2"
                          />

                          {f.unit && (
                            <span className="min-w-20 rounded border bg-gray-100 px-3 py-2 text-center text-sm font-semibold text-gray-700">
                              {f.unit}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <textarea
                  name="resultText"
                  placeholder="Resultado del estudio"
                  defaultValue={getResultText(selectedAppointment.result)}
                  className="min-h-40 rounded border bg-white p-2"
                  required
                />
              )}

              <textarea
                name="observations"
                placeholder="Observaciones"
                defaultValue={getResultNotes(selectedAppointment.result)}
                className="min-h-24 rounded border bg-white p-2"
              />

              <button className="rounded bg-blue-600 p-2 text-white">
                {editingResultId ? 'Actualizar resultado' : 'Guardar resultado'}
              </button>

              {editingResultId && (
                <button
                  type="button"
                  className="rounded bg-gray-500 p-2 text-white"
                  onClick={() => setEditingResultId(null)}
                >
                  Cancelar edición
                </button>
              )}
            </form>
          )}
        </section>
      )}
    </main>
  );
}