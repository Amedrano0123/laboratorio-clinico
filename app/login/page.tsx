'use client';

import { useState } from 'react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  async function login() {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.error || 'Error al iniciar sesión');
      return;
    }

    window.location.href = '/dashboard';
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-100 p-8">
      <section className="w-full max-w-md rounded-xl bg-white p-6 shadow">
        <h1 className="text-2xl font-bold">Sistema Laboratorio</h1>
        <p className="mt-1 text-sm text-gray-500">
          Inicia sesión para continuar
        </p>

        <div className="mt-6 grid gap-4">
          <input
            className="rounded border p-2"
            placeholder="Correo"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            className="rounded border p-2"
            placeholder="Contraseña"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button
            onClick={login}
            className="rounded bg-blue-600 p-2 text-white hover:bg-blue-700"
          >
            Entrar
          </button>

          <a
            href="/forgot-password"
            className="text-center text-sm text-blue-600 hover:underline"
          >
            ¿Olvidaste tu contraseña?
          </a>
        </div>
      </section>
    </main>
  );
}