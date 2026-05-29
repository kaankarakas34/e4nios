import { signInWithEmailAction } from "@/app/login/actions";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ sent?: string }>;
}) {
  const params = await searchParams;

  return (
    <main className="grid min-h-screen place-items-center bg-[#f6f7f4] px-5">
      <div className="w-full max-w-md rounded-md border border-[#d8ded5] bg-white p-5">
        <div className="grid size-10 place-items-center rounded-md bg-[#1f6f5b] text-sm font-semibold text-white">
          E4N
        </div>
        <h1 className="mt-5 text-2xl font-semibold">Relationship Brain</h1>
        <p className="mt-2 text-sm text-[#69746d]">
          Sign in with your E4N email to access the internal intelligence OS.
        </p>
        {params.sent ? (
          <p className="mt-4 rounded-md bg-[#e4eee9] p-3 text-sm text-[#1f6f5b]">
            Magic link sent. Check your email.
          </p>
        ) : null}
        <form action={signInWithEmailAction} className="mt-5 space-y-3">
          <input
            className="h-10 w-full rounded-md border border-[#cbd5cc] px-3 text-sm"
            name="email"
            placeholder="name@event4network.com"
            required
            type="email"
          />
          <button className="h-10 w-full rounded-md bg-[#1f6f5b] px-3 text-sm font-medium text-white">
            Send magic link
          </button>
        </form>
      </div>
    </main>
  );
}
