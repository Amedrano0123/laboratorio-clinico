'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';

type Result = {
  id: number;
  resultText: string;
  observations: string | null;
  createdAt: string;
  appointment: {
    date: string;
    study: {
      name: string;
    };
    patient: {
      name: string;
    };
  };
};

export default function PrintResultPage() {
  const params = useParams();
  const [result, setResult] = useState<Result | null>(null);

  useEffect(() => {
    async function loadResult() {
      const res = await fetch(`/api/results/${params.id}`);
      const data = await res.json();
      setResult(data);
    }

    loadResult();
  }, [params.id]);

  if (!result) {
    return <main className="p-8">Cargando resultado...</main>;
  }

  const rows = result.resultText
    .split('\n')
    .map((line) => {
      const [name, value] = line.split(':');
      return {
        name: name?.trim() || '',
        value: value?.trim() || '',
      };
    })
    .filter((r) => r.name);

  return (
    <main className="bg-gray-100 p-8 print:bg-white">
      <div className="mb-4 flex gap-2 print:hidden">
        <button
          onClick={() => window.print()}
          className="rounded bg-blue-600 px-4 py-2 text-white"
        >
          Imprimir / Guardar PDF
        </button>

        <button
          onClick={() => history.back()}
          className="rounded bg-gray-600 px-4 py-2 text-white"
        >
          Regresar
        </button>
      </div>

      <section className="mx-auto max-w-4xl bg-white p-8 shadow print:shadow-none">
        <div className="border-2 border-black p-4">
          <div className="text-center">
            <h1 className="text-2xl font-bold">
              LABORATORIO DE ANÁLISIS CLÍNICOS
            </h1>
            <h2 className="text-lg font-semibold">
              Q.F.B. Gonzalo Hernández Arias
            </h2>

            <div className="mt-3 grid grid-cols-3 text-sm">
              <div>
                <p>CED. PROF. 1953563</p>
                <p>OBREGÓN No. 41 “C”</p>
              </div>
              <div>
                <p>U.A.S.</p>
              </div>
              <div>
                <p>REG. S.S.A. 5685</p>
                <p>CHOIX, SINALOA</p>
              </div>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-3 border-y border-black py-2 text-sm">
            <p>
              <b>Nombre:</b> {result.appointment.patient.name}
            </p>
            <p>
              <b>Médico:</b> AQC.
            </p>
            <p>
              <b>Fecha:</b>{' '}
              {new Date(result.createdAt).toLocaleDateString()}
            </p>
          </div>

          <h3 className="mt-4 bg-gray-200 p-2 text-center font-bold">
            {result.appointment.study.name.toUpperCase()}
          </h3>

          <table className="w-full border-collapse text-sm">
            <thead>
              <tr>
                <th className="border border-black p-2 text-left">
                  Parámetro
                </th>
                <th className="border border-black p-2 text-left">
                  Resultado
                </th>
              </tr>
            </thead>

            <tbody>
              {rows.map((row, index) => (
                <tr key={index}>
                  <td className="border border-black p-2 font-semibold">
                    {row.name}
                  </td>
                  <td className="border border-black p-2">{row.value}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {result.observations && (
            <div className="mt-4">
              <p className="font-bold">Observaciones:</p>
              <p>{result.observations}</p>
            </div>
          )}

          <div className="mt-20 text-center">
            <div className="mx-auto w-72 border-t border-black pt-2">
              <p className="font-bold">Q.F.B. GONZALO HERNÁNDEZ VALDEZ</p>
              <p>CED. PROF. 1709209 &nbsp;&nbsp; REG. SSA 22832</p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}