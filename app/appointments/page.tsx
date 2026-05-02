'use client';

import { useEffect, useState } from 'react';

type Patient = {
  id: number;
  name: string;
};

type Study = {
  id: number;
  name: string;
  price: number | null;
};

type Appointment = {
  id: number;
  patientId: number;
  studyId: number;
  date: string;
  status: string;
  notes: string | null;
  patient: Patient;
  study: Study;
};

export default function AppointmentsPage() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [studies, setStudies] = useState<Study[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [editingAppointment, setEditingAppointment] =
    useState<Appointment | null>(null);

  async function loadPatients() {
    const res = await fetch('/api/patients');
    const data = await res.json();
    setPatients(data);
  }

  async function loadStudies() {
    const res = await fetch('/api/studies');
    const data = await res.json();
    setStudies(data);
  }

  async function loadAppointments() {
    const res = await fetch('/api/appointments');
    const data = await res.json();
    setAppointments(data);
  }

  useEffect(() => {
    loadPatients();
    loadStudies();
    loadAppointments();
  }, []);

  async function handleAppointmentSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const form = e.currentTarget;
    const formData = new FormData(form);

    const payload = {
      id: editingAppointment?.id,
      patientId: Number(formData.get('patientId')),
      studyId: Number(formData.get('studyId')),
      date: formData.get('date'),
      notes: formData.get('notes'),
    };

    const res = await fetch('/api/appointments', {
      method: editingAppointment ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const error = await res.json();
      alert(error.error || 'Error al guardar cita ❌');
      return;
    }

    alert(editingAppointment ? 'Cita actualizada ✅' : 'Cita guardada ✅');
    setEditingAppointment(null);
    form.reset();
    loadAppointments();
  }

  return (
    <main className="min-h-screen bg-gray-100 p-8">
      <h1 className="text-3xl font-bold">Citas</h1>

      <div className="mt-6 rounded-xl bg-white p-6 shadow">
        <h2 className="text-xl font-semibold">
          {editingAppointment ? 'Editar cita' : 'Nueva cita'}
        </h2>

        <form
          key={editingAppointment?.id || 'new-appointment'}
          className="mt-4 grid gap-4"
          onSubmit={handleAppointmentSubmit}
        >
          <select
            name="patientId"
            className="rounded border p-2"
            defaultValue={editingAppointment?.patientId || ''}
            required
          >
            <option value="">Selecciona paciente</option>
            {patients.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>

          <select
            name="studyId"
            className="rounded border p-2"
            defaultValue={editingAppointment?.studyId || ''}
            required
          >
            <option value="">Selecciona estudio</option>
            {studies.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name} {s.price !== null ? `- $${s.price}` : ''}
              </option>
            ))}
          </select>

          <input
            name="date"
            type="datetime-local"
            className="rounded border p-2"
            defaultValue={
              editingAppointment?.date
                ? editingAppointment.date.slice(0, 16)
                : ''
            }
            required
          />

          <input
            name="notes"
            type="text"
            placeholder="Notas"
            className="rounded border p-2"
            defaultValue={editingAppointment?.notes || ''}
          />

          <button className="rounded bg-blue-600 p-2 text-white hover:bg-blue-700">
            {editingAppointment ? 'Actualizar cita' : 'Guardar cita'}
          </button>

          {editingAppointment && (
            <button
              type="button"
              className="rounded bg-gray-500 p-2 text-white hover:bg-gray-600"
              onClick={() => setEditingAppointment(null)}
            >
              Cancelar edición
            </button>
          )}
        </form>
      </div>

      <div className="mt-6 rounded-xl bg-white p-6 shadow">
        <h2 className="text-xl font-semibold">Citas registradas</h2>

        <table className="mt-4 w-full border-collapse">
          <thead>
            <tr className="border-b text-left">
              <th className="p-2">Paciente</th>
              <th className="p-2">Estudio</th>
              <th className="p-2">Fecha</th>
              <th className="p-2">Estado</th>
              <th className="p-2">Notas</th>
              <th className="p-2">Acciones</th>
            </tr>
          </thead>

          <tbody>
            {appointments.map((a) => (
              <tr key={a.id} className="border-b">
                <td className="p-2">{a.patient.name}</td>
                <td className="p-2">
                  {a.study.name} {a.study.price !== null ? `- $${a.study.price}` : ''}
                </td>
                <td className="p-2">{new Date(a.date).toLocaleString()}</td>
                <td className="p-2">
                  <span
                    className={`rounded px-2 py-1 text-xs font-semibold ${
                      a.status === 'PROGRAMADA'
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-green-100 text-green-700'
                    }`}
                  >
                    {a.status}
                  </span>
                </td>
                <td className="p-2">{a.notes || '-'}</td>

                <td className="p-2 space-x-2">
                  {a.status === 'PROGRAMADA' ? (
                    <>
                      <button
                        className="rounded bg-yellow-500 px-3 py-1 text-white hover:bg-yellow-600"
                        onClick={() => setEditingAppointment(a)}
                      >
                        Editar
                      </button>

                      <button
                        className="rounded bg-red-600 px-3 py-1 text-white hover:bg-red-700"
                        onClick={async () => {
                          const confirmDelete = confirm(
                            `¿Eliminar la cita de ${a.patient.name}?`
                          );

                          if (!confirmDelete) return;

                          const res = await fetch('/api/appointments', {
                            method: 'DELETE',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ id: a.id }),
                          });

                          if (!res.ok) {
                            const error = await res.json();
                            alert(error.error || 'Error al eliminar cita ❌');
                            return;
                          }

                          alert('Cita eliminada ✅');
                          loadAppointments();
                        }}
                      >
                        Eliminar
                      </button>
                    </>
                  ) : (
                    <span className="text-sm text-gray-400">Bloqueada</span>
                  )}
                </td>
              </tr>
            ))}

            {appointments.length === 0 && (
              <tr>
                <td colSpan={6} className="p-2 text-gray-500">
                  No hay citas registradas
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </main>
  );
}