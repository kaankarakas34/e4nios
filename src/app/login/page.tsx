import { signInWithEmailAction } from "@/app/login/actions";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ sent?: string }>;
}) {
  const params = await searchParams;

  return (
    <main className="grid min-h-screen place-items-center bg-[#050505] px-5">
      <div className="w-full max-w-md rounded-md border border-[#2a2a2a] bg-[#111111] p-5">
        <div className="grid size-10 place-items-center rounded-md bg-[#ef4444] text-sm font-semibold text-white">
          E4N
        </div>
        <h1 className="mt-5 text-2xl font-semibold">Relationship Brain</h1>
        <p className="mt-2 text-sm text-[#a3a3a3]">
          Sign in with your E4N email to access the internal intelligence OS.
        </p>
        {params.sent ? (
          <p className="mt-4 rounded-md bg-[#1f0a0a] p-3 text-sm text-[#ef4444]">
            Magic link sent. Check your email.
          </p>
        ) : null}
        <form action={signInWithEmailAction} className="mt-5 space-y-3">
          <input
            className="h-10 w-full rounded-md border border-[#3a3a3a] px-3 text-sm"
            name="email"
            placeholder="name@event4network.com"
            required
            type="email"
          />
          <button className="h-10 w-full rounded-md bg-[#ef4444] px-3 text-sm font-medium text-white">
            Send magic link
          </button>
        </form>
      </div>
    </main>
  );
}
