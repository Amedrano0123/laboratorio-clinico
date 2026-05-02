'use client';

import { useEffect, useState } from 'react';

type Patient = {
  id: number;
  name: string;
  birthDate: string | null;
  phone: string | null;
  email: string | null;
  createdAt: string;
};

export default function PacientesPage() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [editing, setEditing] = useState<Patient | null>(null);

  async function loadPatients() {
    const res = await fetch('/api/patients');
    const data = await res.json();
    setPatients(data);
  }

  useEffect(() => {
    loadPatients();
  }, []);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const form = e.currentTarget;
    const formData = new FormData(form);

    const payload = {
      name: formData.get('name'),
      birthDate: formData.get('birthDate') || null,
      phone: formData.get('phone'),
      email: formData.get('email'),
    };

    const res = await fetch(
      editing ? `/api/patients/${editing.id}` : '/api/patients',
      {
        method: editing ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      }
    );

    if (!res.ok) {
      alert('Error al guardar paciente ❌');
      return;
    }

    alert(editing ? 'Paciente actualizado ✅' : 'Paciente guardado ✅');
    setEditing(null);
    form.reset();
    loadPatients();
  }

  return (
    <main className="min-h-screen bg-gray-100 p-8">
      <h1 className="text-3xl font-bold">Pacientes</h1>

      <div className="mt-6 rounded-xl bg-white p-6 shadow">
        <h2 className="text-xl font-semibold">
          {editing ? 'Editar Paciente' : 'Nuevo Paciente'}
        </h2>

        <form key={editing?.id || 'new'} className="mt-4 grid gap-4" onSubmit={handleSubmit}>
          <input
            name="name"
            type="text"
            placeholder="Nombre completo"
            defaultValue={editing?.name || ''}
            className="rounded border p-2"
            required
          />

          <input
            name="birthDate"
            type="date"
            defaultValue={editing?.birthDate ? editing.birthDate.split('T')[0] : ''}
            className="rounded border p-2"
          />

          <input
            name="phone"
            type="text"
            placeholder="Teléfono"
            defaultValue={editing?.phone || ''}
            className="rounded border p-2"
          />

          <input
            name="email"
            type="email"
            placeholder="Correo"
            defaultValue={editing?.email || ''}
            className="rounded border p-2"
          />

          <button type="submit" className="rounded bg-blue-600 p-2 text-white hover:bg-blue-700">
            {editing ? 'Actualizar paciente' : 'Guardar paciente'}
          </button>

          {editing && (
            <button
              type="button"
              className="rounded bg-gray-500 p-2 text-white hover:bg-gray-600"
              onClick={() => setEditing(null)}
            >
              Cancelar edición
            </button>
          )}
        </form>
      </div>

      <div className="mt-6 rounded-xl bg-white p-6 shadow">
        <h2 className="text-xl font-semibold">Pacientes registrados</h2>

        <table className="mt-4 w-full border-collapse">
          <thead>
            <tr className="border-b text-left">
              <th className="p-2">Nombre</th>
              <th className="p-2">Nacimiento</th>
              <th className="p-2">Teléfono</th>
              <th className="p-2">Correo</th>
              <th className="p-2">Acciones</th>
            </tr>
          </thead>

          <tbody>
            {patients.map((patient) => (
              <tr key={patient.id} className="border-b">
                <td className="p-2">{patient.name}</td>
                <td className="p-2">
                  {patient.birthDate ? new Date(patient.birthDate).toLocaleDateString() : '-'}
                </td>
                <td className="p-2">{patient.phone || '-'}</td>
                <td className="p-2">{patient.email || '-'}</td>

                <td className="p-2 space-x-2">
                  <button
                    className="rounded bg-yellow-500 px-3 py-1 text-white hover:bg-yellow-600"
                    onClick={() => setEditing(patient)}
                  >
                    Editar
                  </button>

                  <button
                    className="rounded bg-red-600 px-3 py-1 text-white hover:bg-red-700"
                    onClick={async () => {
                      const confirmDelete = confirm(`¿Eliminar a ${patient.name}?`);
                      if (!confirmDelete) return;

                      const res = await fetch('/api/patients', {
                        method: 'DELETE',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ id: patient.id }),
                      });

                      if (!res.ok) {
                        alert('Error al eliminar ❌');
                        return;
                      }

                      alert('Paciente eliminado ✅');
                      loadPatients();
                    }}
                  >
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}