'use client';

import { useEffect, useMemo, useState } from 'react';
import UserBar from '@/components/UserBar';

type Appointment = {
  id: number;
  date: string;
  status: string;
  patient: {
    name: string;
  };
  study: {
    id: number;
    name: string;
  };
};

type Result = {
  id: number;
  resultText: string;
  observations: string | null;
  appointment: Appointment;
};

const templatesByStudyId: Record<number, { name: string; unit: string }[]> = {
  1: [
    { name: 'Hematocrito', unit: '%' },
    { name: 'Hemoglobina', unit: 'g/dL' },
    { name: 'V.G.M.', unit: 'fL' },
    { name: 'C.M. de Hb', unit: '%' },
    { name: 'Eritrocitos', unit: 'mill/mm³' },
    { name: 'Leucocitos', unit: 'mm³' },
    { name: 'Plaquetas', unit: 'mm³' },
  ],
};

export default function ResultsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [results, setResults] = useState<Result[]>([]);
  const [selectedId, setSelectedId] = useState('');

  async function loadAppointments() {
    const res = await fetch('/api/appointments');
    const data = await res.json();
    setAppointments(
      data.filter((a: Appointment) => a.status !== 'COMPLETADA')
    );
  }

  async function loadResults() {
    const res = await fetch('/api/results');
    const data = await res.json();
    setResults(data);
  }

  useEffect(() => {
    loadAppointments();
    loadResults();
  }, []);

  const selected = useMemo(
    () => appointments.find((a) => String(a.id) === selectedId),
    [appointments, selectedId]
  );

  const fields = selected
    ? templatesByStudyId[selected.study.id] || []
    : [];

  return (
    <main className="min-h-screen bg-gray-100 p-8">
  <UserBar />
      <h1 className="text-3xl font-bold">Resultados</h1>

      <div className="mt-6 rounded-xl bg-white p-6 shadow">
        <h2 className="text-xl font-semibold">Capturar resultado</h2>

        <form
          className="mt-4 grid gap-4"
          onSubmit={async (e) => {
            e.preventDefault();

            const form = e.currentTarget;
            const formData = new FormData(form);

            let resultText = fields
              .map((f) => {
                const value = formData.get(f.name) || '';
                return `${f.name}: ${value} ${f.unit}`;
              })
              .join('\n');

            const res = await fetch('/api/results', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                appointmentId: Number(formData.get('appointmentId')),
                resultText,
                observations: formData.get('observations'),
              }),
            });

            if (!res.ok) {
              alert('Error al guardar ❌');
              return;
            }

            alert('Resultado guardado ✅');
            form.reset();
            setSelectedId('');
            loadAppointments();
            loadResults();
          }}
        >
          <select
            name="appointmentId"
            className="rounded border p-2"
            value={selectedId}
            onChange={(e) => setSelectedId(e.target.value)}
            required
          >
            <option value="">Selecciona cita</option>
            {appointments.map((a) => (
              <option key={a.id} value={a.id}>
                {a.patient.name} - {a.study.name}
              </option>
            ))}
          </select>

          {selected && (
            <div className="rounded border bg-gray-50 p-4">
              <p><b>Paciente:</b> {selected.patient.name}</p>
              <p><b>Estudio:</b> {selected.study.name}</p>
              <p><b>Fecha:</b> {new Date(selected.date).toLocaleString()}</p>
            </div>
          )}

          {fields.length > 0 && (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {fields.map((f) => (
                <div key={f.name} className="grid gap-1">
                  <label className="text-sm font-semibold">
                    {f.name} ({f.unit})
                  </label>
                  <input
                    name={f.name}
                    className="rounded border p-2"
                  />
                </div>
              ))}
            </div>
          )}

          <textarea
            name="observations"
            placeholder="Observaciones"
            className="min-h-24 rounded border p-2"
          />

          <button className="rounded bg-blue-600 p-2 text-white">
            Guardar resultado
          </button>
        </form>
      </div>

      <div className="mt-6 rounded-xl bg-white p-6 shadow">
        <h2 className="text-xl font-semibold">Resultados registrados</h2>

        <table className="mt-4 w-full border-collapse">
          <thead>
            <tr className="border-b text-left">
              <th className="p-2">Paciente</th>
              <th className="p-2">Estudio</th>
              <th className="p-2">Resultado</th>
              <th className="p-2">Observaciones</th>
              <th className="p-2">Acciones</th>
            </tr>
          </thead>

          <tbody>
            {results.map((r) => (
              <tr key={r.id} className="border-b align-top">
                <td className="p-2">{r.appointment.patient.name}</td>
                <td className="p-2">{r.appointment.study.name}</td>
                <td className="whitespace-pre-line p-2">
                  {r.resultText}
                </td>
                <td className="p-2">{r.observations || '-'}</td>
                <td className="p-2">
                  <a
                    href={`/results/${r.id}`}
                    className="rounded bg-blue-600 px-3 py-1 text-white hover:bg-blue-700"
                  >
                    Imprimir PDF
                  </a>
                </td>
              </tr>
            ))}

            {results.length === 0 && (
              <tr>
                <td colSpan={5} className="p-2 text-gray-500">
                  No hay resultados registrados
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </main>
  );
}