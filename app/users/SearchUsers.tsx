"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import DeleteButton from "./DeleteButton";

type User = {
  id: number;
  name: string;
  email: string;
  createdAt: string;
};

type SearchUsersProps = {
  users: User[];
};

export default function SearchUsers({ users }: SearchUsersProps) {
  const [search, setSearch] = useState("");

  const filteredUsers = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    return users.filter(
      (user) =>
        user.name.toLowerCase().includes(keyword) ||
        user.email.toLowerCase().includes(keyword)
    );
  }, [users, search]);

  return (
    <div>
      <input
        type="text"
        placeholder="Search by name or email..."
        value={search}
        onChange={(event) => setSearch(event.target.value)}
        className="mb-4 w-full rounded-lg border border-gray-300 bg-white px-4 py-3 outline-none focus:border-blue-500"
      />

      <p className="mb-3 text-sm text-gray-600">
        Showing {filteredUsers.length} of {users.length} users
      </p>

      <div className="overflow-x-auto rounded-xl bg-white shadow">
        <table className="w-full text-left">
          <thead className="bg-blue-600 text-white">
            <tr>
              <th className="p-4">ID</th>
              <th className="p-4">Name</th>
              <th className="p-4">Email</th>
              <th className="p-4">Created At</th>
              <th className="p-4">Action</th>
            </tr>
          </thead>

          <tbody>
            {filteredUsers.map((user) => (
              <tr key={user.id} className="border-b hover:bg-slate-50">
                <td className="p-4">{user.id}</td>
                <td className="p-4">{user.name}</td>
                <td className="p-4">{user.email}</td>
                <td className="p-4">
                  {new Date(user.createdAt).toLocaleDateString()}
                </td>

                <td className="p-4">
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/users/${user.id}/edit`}
                      className="rounded-lg bg-blue-600 px-3 py-2 text-sm text-white hover:bg-blue-700"
                    >
                      Edit
                    </Link>

                    <DeleteButton
                      userId={user.id}
                      userName={user.name}
                    />
                  </div>
                </td>
              </tr>
            ))}

            {filteredUsers.length === 0 && (
              <tr>
                <td
                  colSpan={5}
                  className="p-6 text-center text-gray-500"
                >
                  Walang user na tumugma sa iyong search.
                </td>
              </tr>
            )}
          </tbody>
        </table>

        <p className="p-4 text-sm text-slate-500">
          Total users: {filteredUsers.length}
        </p>
      </div>
    </div>
  );
}