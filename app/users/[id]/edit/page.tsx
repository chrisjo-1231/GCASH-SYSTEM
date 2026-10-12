
import { Suspense } from "react";
import Link from "next/link";
import prisma from "@/lib/prisma";
import EditUserForm from "../../EditUserForm";

type PageProps = {
  params: Promise<{ id: string }>;
};

async function EditUserContent({ params }: PageProps) {
  const { id } = await params;
  const userId = Number(id);

  if (!Number.isInteger(userId) || userId <= 0) {
    return <p className="p-8">Invalid user ID.</p>;
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    return (
      <main className="p-8">
        <p className="mb-4">User not found.</p>
        <Link href="/users" className="text-blue-600 underline">
          Back to Users
        </Link>
      </main>
    );
  }

  return (
    <EditUserForm
      userId={user.id}
      initialName={user.name}
      initialEmail={user.email}
    />
  );
}

export default function EditUserPage({ params }: PageProps) {
  return (
    <Suspense
      fallback={
        <div className="p-8">Loading user details...</div>
      }
    >
      <EditUserContent params={params} />
    </Suspense>
  );
}
