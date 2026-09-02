import { Suspense } from "react";
import { AuthCallbackClient } from "./auth-callback-client";

export default function AuthCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto flex min-h-[60vh] max-w-md flex-col justify-center px-4 py-16 text-center">
          <p className="text-sm text-[#6d6e71]">Signing you in…</p>
        </div>
      }
    >
      <AuthCallbackClient />
    </Suspense>
  );
}
