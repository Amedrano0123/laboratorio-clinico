'use client';

import { useState } from 'react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [devResetUrl, setDevResetUrl] = useState('');

  async function submit() {
    const res = await fetch('/api/auth/forgot-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.error || 'Error al solicitar recuperación');
      return;
    }

    alert(data.message || 'Solicitud enviada');

    if (data.devResetUrl) {
      setDevResetUrl(data.devResetUrl);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-100 p-8">
      <section className="w-full max-w-md rounded-xl bg-white p-6 shadow">
        <h1 className="text-2xl font-bold">Restablecer contraseña</h1>
        <p className="mt-1 text-sm text-gray-500">
          Escribe tu correo para recibir una liga de recuperación.
        </p>

        <div className="mt-6 grid gap-4">
          <input
            className="rounded border p-2"
            placeholder="Correo"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <button
            onClick={submit}
            className="rounded bg-blue-600 p-2 text-white hover:bg-blue-700"
          >
            Enviar liga
          </button>

          <a
            href="/login"
            className="text-center text-sm text-blue-600 hover:underline"
          >
            Regresar al login
          </a>

          {devResetUrl && (
            <div className="rounded bg-yellow-100 p-3 text-sm text-yellow-800">
              <p className="font-semibold">Modo desarrollo:</p>
              <p className="break-all">{devResetUrl}</p>
              <a
                href={devResetUrl}
                className="mt-2 block text-blue-700 underline"
              >
                Abrir liga de recuperación
              </a>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}