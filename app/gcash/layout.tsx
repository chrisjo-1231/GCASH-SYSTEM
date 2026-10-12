
import { Suspense } from "react";
import { redirect } from "next/navigation";
import { getSessionUserId } from "@/lib/session";

async function GcashAuthGuard({
  children,
}: {
  children: React.ReactNode;
}) {
  const userId = await getSessionUserId();

  if (!userId) {
    redirect("/login");
  }

  return <>{children}</>;
}

export default function GcashLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center">
          <p className="text-slate-600">
            Checking your session...
          </p>
        </main>
      }
    >
      <GcashAuthGuard>{children}</GcashAuthGuard>
    </Suspense>
  );
}
