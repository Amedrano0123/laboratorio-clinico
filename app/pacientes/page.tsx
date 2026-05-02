'use client';

import { useEffect, useState } from 'react';
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

  async function loadPatients() {
    const res = await fetch('/api/patients');
    const data = await res.json();
    setPatients(data);
  }

  useEffect(() => {
    loadPatients();
  }, []);

  const filteredPatients = patients.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <main className="min-h-screen bg-gray-100 p-8">
  <UserBar />

      <h1 className="text-3xl font-bold">Pacientes</h1>

      {/* 🔍 BUSCADOR */}
      <input
        type="text"
        placeholder="Buscar paciente..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="mt-4 w-full rounded border p-2"
      />

      {/* LISTA */}
      <div className="mt-6 bg-white p-6 rounded shadow">

        {filteredPatients.map((patient) => (
          <div key={patient.id} className="mb-3 flex justify-between border-b pb-2">

            <div>
              <p className="font-semibold">{patient.name}</p>
              <p className="text-sm text-gray-500">
                {patient.phone || 'Sin teléfono'}
              </p>
            </div>

            <div className="space-x-2">

              <a
                href={`/pacientes/${patient.id}`}
                className="bg-blue-600 text-white px-3 py-1 rounded"
              >
                Historial
              </a>

              <a
                href={`/orders?patientId=${patient.id}`}
                className="bg-green-600 text-white px-3 py-1 rounded"
              >
                Nueva orden
              </a>

            </div>

          </div>
        ))}

        {filteredPatients.length === 0 && (
          <p className="text-gray-500">No se encontraron pacientes</p>
        )}

      </div>

    </main>
  );
}