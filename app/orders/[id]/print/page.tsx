'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';

type Result = {
  values?: string | null;
  notes?: string | null;
  resultText?: string | null;
  observations?: string | null;
};

type Order = {
  id: number;
  folio: string | null;
  status: string;
  createdAt: string;
  notes: string | null;
  patient: { name: string };
  appointments: {
    id: number;
    study: { id: number; name: string };
    result: Result | null;
  }[];
};

const referencesByStudyId: Record<number, Record<string, { unit: string; reference: string }>> = {
  1: {
    Hematocrito: { unit: '%', reference: '' },
    Hemoglobina: { unit: 'g/dL', reference: '' },
    Leucocitos: { unit: 'mm³', reference: '' },
    Plaquetas: { unit: 'mm³', reference: '' },
  },
  2: {
    Glucosa: { unit: 'mg/dL', reference: '70 - 110' },
    Urea: { unit: 'mg/dL', reference: '16 - 32' },
    Creatinina: { unit: 'mg/dL', reference: '0.4 - 1.5' },
    Colesterol: { unit: 'mg/dL', reference: '150 - 200' },
    Triglicéridos: { unit: 'mg/dL', reference: '60 - 160' },
  },
};

function getResultText(result: Result | null) {
  return result?.values || result?.resultText || '';
}

function getResultNotes(result: Result | null) {
  return result?.notes || result?.observations || '';
}

function parseRows(result: Result | null, studyId: number) {
  const text = getResultText(result);
  const refs = referencesByStudyId[studyId] || {};

  return text
    .split('\n')
    .map((line) => {
      const [nameRaw, valueRaw] = line.split(':');
      const name = nameRaw?.trim() || '';
      const config = refs[name];
      const value = (valueRaw || '').replace(config?.unit || '', '').trim();

      return {
        name,
        value,
        unit: config?.unit || '',
        reference: config?.reference || '',
      };
    })
    .filter((r) => r.name);
}

export default function PrintOrderPage() {
  const params = useParams();
  const [order, setOrder] = useState<Order | null>(null);

  useEffect(() => {
    async function loadOrder() {
      const res = await fetch(`/api/orders/${params.id}`);
      const data = await res.json();
      setOrder(data);
    }

    loadOrder();
  }, [params.id]);

  if (!order) return <main className="p-8">Cargando...</main>;

  return (
    <main className="bg-gray-100 p-6 print:bg-white print:p-0">
      <div className="mb-4 flex gap-2 print:hidden">
        <button onClick={() => window.print()} className="rounded bg-blue-600 px-4 py-2 text-white">
          Imprimir / Guardar PDF
        </button>

        <button onClick={() => history.back()} className="rounded bg-gray-600 px-4 py-2 text-white">
          Regresar
        </button>
      </div>

      <section className="mx-auto max-w-4xl bg-white p-6 shadow print:shadow-none">
        <div className="border-2 border-black p-4">
          <header className="text-center">
            <h1 className="text-2xl font-black tracking-wide">
              LABORATORIO DE ANÁLISIS CLÍNICOS
            </h1>
            <h2 className="text-lg font-bold">Q.F.B. Gonzalo Hernández Arias</h2>

            <div className="mt-2 grid grid-cols-3 text-xs font-semibold">
              <div className="text-left">
                <p>CED. PROF. 1953563</p>
                <p>OBREGÓN No. 41 “C”</p>
              </div>
              <div>U.A.S.</div>
              <div className="text-right">
                <p>REG. S.S.A. 5685</p>
                <p>CHOIX, SINALOA</p>
              </div>
            </div>
          </header>

          <section className="mt-3 grid grid-cols-4 border-y-2 border-black text-xs">
            <div className="border-r border-black p-2">
              <b>Orden:</b><br />
              {order.folio || `ORD-${String(order.id).padStart(4, '0')}`}
            </div>
            <div className="border-r border-black p-2">
              <b>Paciente:</b><br />
              {order.patient.name}
            </div>
            <div className="border-r border-black p-2">
              <b>Médico:</b><br />
              AQC.
            </div>
            <div className="p-2">
              <b>Fecha:</b><br />
              {new Date(order.createdAt).toLocaleDateString()}
            </div>
          </section>

          <section className="mt-3">
            {order.appointments.map((appointment) => {
              const rows = parseRows(appointment.result, appointment.study.id);

              return (
                <div key={appointment.id} className="mb-4 break-inside-avoid">
                  <h3 className="border border-black bg-gray-200 p-1 text-center text-sm font-bold uppercase">
                    {appointment.study.name}
                  </h3>

                  {appointment.result ? (
                    <table className="w-full border-collapse text-xs">
                      <thead>
                        <tr>
                          <th className="border border-black p-1 text-left">Parámetro</th>
                          <th className="border border-black p-1 text-left">Resultado</th>
                          <th className="border border-black p-1 text-left">Unidad</th>
                          <th className="border border-black p-1 text-left">Referencia</th>
                        </tr>
                      </thead>
                      <tbody>
                        {rows.map((row, i) => (
                          <tr key={i}>
                            <td className="border border-black p-1 font-semibold">{row.name}</td>
                            <td className="border border-black p-1">{row.value || '-'}</td>
                            <td className="border border-black p-1">{row.unit || '-'}</td>
                            <td className="border border-black p-1">{row.reference || '-'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <p className="border-x border-b border-black p-2 text-xs text-gray-500">
                      Resultado pendiente
                    </p>
                  )}

                  {getResultNotes(appointment.result) && (
                    <p className="border-x border-b border-black p-2 text-xs">
                      <b>Observaciones:</b> {getResultNotes(appointment.result)}
                    </p>
                  )}
                </div>
              );
            })}
          </section>

          <footer className="mt-8 grid grid-cols-2 text-xs">
            <div>
              <p><b>Validación:</b></p>
              <p>Resultados revisados y autorizados.</p>
            </div>

            <div className="text-center">
              <div className="mt-12 border-t border-black pt-1">
                <p className="font-bold">Q.F.B. GONZALO HERNÁNDEZ VALDEZ</p>
                <p>CED. PROF. 1709209 &nbsp;&nbsp; REG. SSA 22832</p>
              </div>
            </div>
          </footer>
        </div>
      </section>
    </main>
  );
}