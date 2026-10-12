import { Suspense } from "react";
import prisma from "@/lib/prisma";
import SearchUsers from "./SearchUsers";

async function UsersTable() {
  const users = await prisma.user.findMany({
    orderBy: {
      createdAt: "desc",
    },
  });

  if (users.length === 0) {
    return (
      <div className="rounded-xl bg-white p-6 text-center text-slate-600 shadow">
        Wala pang users sa database.
      </div>
    );
  }

  const formattedUsers = users.map((user) => ({
    id: user.id,
    name: user.name,
    email: user.email,
    createdAt: user.createdAt.toISOString(),
  }));

  return <SearchUsers users={formattedUsers} />;
}

export default function UsersPage() {
  return (
    <main className="min-h-screen bg-slate-100 p-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6">
          <h1 className="mb-2 text-3xl font-bold text-slate-900">
            Users List
          </h1>

          <p className="text-slate-600">
            Manage, search, edit, and delete users saved in PostgreSQL.
          </p>
        </div>

        <Suspense
          fallback={
            <div className="rounded-xl bg-white p-6 shadow">
              Kinukuha ang users...
            </div>
          }
        >
          <UsersTable />
        </Suspense>
      </div>
    </main>
  );
}