'use client';

import { Suspense, useState } from 'react';
import { useSearchParams } from 'next/navigation';

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token') || '';

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [saving, setSaving] = useState(false);

  async function submit() {
    if (!token) {
      alert('Token inválido');
      return;
    }

    if (!password || !confirmPassword) {
      alert('Captura y confirma la nueva contraseña');
      return;
    }

    if (password !== confirmPassword) {
      alert('Las contraseñas no coinciden');
      return;
    }

    setSaving(true);

    const res = await fetch('/api/auth/reset-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, password }),
    });

    const data = await res.json();

    setSaving(false);

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

        <p className="mt-1 text-sm text-gray-500">
          Captura tu nueva contraseña para recuperar el acceso.
        </p>

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
            disabled={saving}
            className="rounded bg-blue-600 p-2 text-white hover:bg-blue-700 disabled:bg-gray-400"
          >
            {saving ? 'Actualizando...' : 'Actualizar contraseña'}
          </button>

          <a
            href="/login"
            className="text-center text-sm text-blue-600 hover:underline"
          >
            Regresar al login
          </a>
        </div>
      </section>
    </main>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<main className="p-8">Cargando...</main>}>
      <ResetPasswordForm />
    </Suspense>
  );
}