'use client';

import { useSearchParams } from 'next/navigation';
import { useState } from 'react';

export default function ResetPasswordPage() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token') || '';

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  async function submit() {
    if (!token) {
      alert('Token inválido');
      return;
    }

    if (password !== confirmPassword) {
      alert('Las contraseñas no coinciden');
      return;
    }

    const res = await fetch('/api/auth/reset-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, password }),
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.error || 'Error al restablecer contraseña');
      return;
    }

    alert('Contraseña actualizada ✅');
    window.location.href = '/login';
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-100 p-8">
      <section className="w-full max-w-md rounded-xl bg-white p-6 shadow">
        <h1 className="text-2xl font-bold">Nueva contraseña</h1>

        <div className="mt-6 grid gap-4">
          <input
            className="rounded border p-2"
            placeholder="Nueva contraseña"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <input
            className="rounded border p-2"
            placeholder="Confirmar contraseña"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />

          <button
            onClick={submit}
            className="rounded bg-blue-600 p-2 text-white hover:bg-blue-700"
          >
            Actualizar contraseña
          </button>
        </div>
      </section>
    </main>
  );
}