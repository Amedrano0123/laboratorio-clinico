'use client';

import { useEffect, useMemo, useState } from 'react';
import UserBar from '@/components/UserBar';

type Patient = {
  id: number;
  name: string;
  birthDate: string | null;
  phone: string | null;
  email: string | null;
};

export default function PacientesPage() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [search, setSearch] = useState('');

  const [name, setName] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [saving, setSaving] = useState(false);

  async function loadPatients() {
    const res = await fetch('/api/patients');
    const data = await res.json();

    setPatients(Array.isArray(data) ? data : []);
  }

  useEffect(() => {
    loadPatients();
  }, []);

  const filteredPatients = useMemo(() => {
    const term = search.toLowerCase().trim();

    if (!term) return patients;

    return patients.filter((p) => {
      return (
        p.name.toLowerCase().includes(term) ||
        (p.phone || '').toLowerCase().includes(term) ||
        (p.email || '').toLowerCase().includes(term)
      );
    });
  }, [patients, search]);

  async function createPatient() {
    if (!name.trim()) {
      alert('El nombre del paciente es obligatorio');
      return;
    }

    setSaving(true);

    const res = await fetch('/api/patients', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name,
        birthDate: birthDate || null,
        phone,
        email,
      }),
    });

    const data = await res.json();

    setSaving(false);

    if (!res.ok) {
      alert(data.error || 'Error al guardar paciente');
      return;
    }

    alert('Paciente guardado ✅');

    setName('');
    setBirthDate('');
    setPhone('');
    setEmail('');

    loadPatients();
  }

  return (
    <main className="min-h-screen bg-gray-100 p-8">
      <UserBar />

      <h1 className="mt-6 text-3xl font-bold">Pacientes</h1>

      <section className="mt-6 rounded-xl bg-white p-6 shadow">
        <h2 className="text-xl font-semibold">Nuevo paciente</h2>

        <div className="mt-4 grid gap-4">
          <input
            className="rounded border p-2"
            placeholder="Nombre completo"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <input
            className="rounded border p-2"
            type="date"
            value={birthDate}
            onChange={(e) => setBirthDate(e.target.value)}
          />

          <input
            className="rounded border p-2"
            placeholder="Teléfono"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />

          <input
            className="rounded border p-2"
            placeholder="Correo"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <button
            onClick={createPatient}
            disabled={saving}
            className="rounded bg-blue-600 p-2 text-white hover:bg-blue-700 disabled:bg-gray-400"
          >
            {saving ? 'Guardando...' : 'Guardar paciente'}
          </button>
        </div>
      </section>

      <section className="mt-6 rounded-xl bg-white p-6 shadow">
        <h2 className="text-xl font-semibold">Pacientes registrados</h2>

        <input
          className="mt-4 w-full rounded border p-2"
          placeholder="Buscar paciente..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        {filteredPatients.length === 0 ? (
          <p className="mt-4 text-gray-500">No se encontraron pacientes</p>
        ) : (
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
              {filteredPatients.map((p) => (
                <tr key={p.id} className="border-b">
                  <td className="p-2">{p.name}</td>
                  <td className="p-2">
                    {p.birthDate
                      ? new Date(p.birthDate).toLocaleDateString()
                      : '-'}
                  </td>
                  <td className="p-2">{p.phone || '-'}</td>
                  <td className="p-2">{p.email || '-'}</td>
                  <td className="p-2">
                    <a
                      href={`/pacientes/${p.id}`}
                      className="rounded bg-gray-700 px-3 py-1 text-white"
                    >
                      Ver historial
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