'use client';

import { useEffect, useState } from 'react';
import UserBar from '@/components/UserBar';

type User = {
  id: number;
  name: string;
  email: string;
  role: string;
  createdAt: string;
};

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  async function loadUsers() {
    const res = await fetch('/api/admin/users');
    const data = await res.json();

    if (!res.ok) {
      alert(data.error || 'Error al cargar usuarios');
      return;
    }

    setUsers(data);
  }

  useEffect(() => {
    loadUsers();
  }, []);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const form = e.currentTarget;
    const formData = new FormData(form);

    const payload = {
      id: editingUser?.id,
      name: formData.get('name'),
      email: formData.get('email'),
      role: formData.get('role'),
      password: formData.get('password'),
    };

    const res = await fetch('/api/admin/users', {
      method: editingUser ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.error || 'Error al guardar usuario');
      return;
    }

    alert(editingUser ? 'Usuario actualizado ✅' : 'Usuario creado ✅');

    setEditingUser(null);
    form.reset();
    loadUsers();
  }

  return (
    <main className="min-h-screen bg-gray-100 p-8">
      <UserBar />

      <h1 className="mt-6 text-3xl font-bold">Administración de usuarios</h1>

      <section className="mt-6 rounded-xl bg-white p-6 shadow">
        <h2 className="text-xl font-semibold">
          {editingUser ? 'Editar usuario / resetear contraseña' : 'Nuevo usuario'}
        </h2>

        <form
          key={editingUser?.id || 'new-user'}
          className="mt-4 grid gap-4"
          onSubmit={handleSubmit}
        >
          <input
            name="name"
            placeholder="Nombre"
            className="rounded border p-2"
            defaultValue={editingUser?.name || ''}
            required
          />

          <input
            name="email"
            type="email"
            placeholder="Correo"
            className="rounded border p-2"
            defaultValue={editingUser?.email || ''}
            required
          />

          <select
            name="role"
            className="rounded border p-2"
            defaultValue={editingUser?.role || 'RECEPCION'}
            required
          >
            <option value="ADMIN">ADMIN</option>
            <option value="RECEPCION">RECEPCION</option>
            <option value="LABORATORIO">LABORATORIO</option>
          </select>

          <input
            name="password"
            type="password"
            placeholder={
              editingUser
                ? 'Nueva contraseña (opcional)'
                : 'Contraseña inicial'
            }
            className="rounded border p-2"
            required={!editingUser}
          />

          <button className="rounded bg-blue-600 p-2 text-white hover:bg-blue-700">
            {editingUser ? 'Actualizar usuario' : 'Crear usuario'}
          </button>

          {editingUser && (
            <button
              type="button"
              className="rounded bg-gray-500 p-2 text-white hover:bg-gray-600"
              onClick={() => setEditingUser(null)}
            >
              Cancelar edición
            </button>
          )}
        </form>
      </section>

      <section className="mt-6 rounded-xl bg-white p-6 shadow">
        <h2 className="text-xl font-semibold">Usuarios registrados</h2>

        <table className="mt-4 w-full border-collapse">
          <thead>
            <tr className="border-b text-left">
              <th className="p-2">Nombre</th>
              <th className="p-2">Correo</th>
              <th className="p-2">Rol</th>
              <th className="p-2">Creado</th>
              <th className="p-2">Acciones</th>
            </tr>
          </thead>

          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="border-b">
                <td className="p-2">{user.name}</td>
                <td className="p-2">{user.email}</td>
                <td className="p-2">{user.role}</td>
                <td className="p-2">
                  {new Date(user.createdAt).toLocaleString()}
                </td>
                <td className="p-2">
                  <button
                    className="rounded bg-yellow-500 px-3 py-1 text-white hover:bg-yellow-600"
                    onClick={() => setEditingUser(user)}
                  >
                    Editar / resetear password
                  </button>
                </td>
              </tr>
            ))}

            {users.length === 0 && (
              <tr>
                <td colSpan={5} className="p-2 text-gray-500">
                  No hay usuarios registrados
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </section>
    </main>
  );
}