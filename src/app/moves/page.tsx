import { updateRelationshipMoveAction } from "@/app/actions";
import { AppShell } from "@/components/app-shell";
import { listRelationshipMoves } from "@/lib/supabase/queries";

export default async function RelationshipMovesPage() {
  const moves = await listRelationshipMoves();

  return (
    <AppShell>
      <div className="px-5 py-5 sm:px-8">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-2xl font-semibold">Relationship Moves</h1>
            <p className="mt-1 text-sm text-[#69746d]">
              Every external or pre-external action stays human-approved and manual in V1.
            </p>
          </div>
          <span className="w-fit rounded-md bg-[#fff1d6] px-2 py-1 text-xs text-[#6b5424]">
            Approval required
          </span>
        </div>

        <div className="mt-5 rounded-md border border-[#d8ded5] bg-white">
          {moves.length === 0 ? (
            <p className="p-4 text-sm text-[#69746d]">
              Candidate analysis will generate safe next moves such as warm signal, soft touch, or nurture check.
            </p>
          ) : (
            <div className="divide-y divide-[#edf0ea]">
              {moves.map((move) => (
                <article className="space-y-3 p-4" key={move.id}>
                  <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded-md bg-[#e4eee9] px-2 py-1 text-xs text-[#1f6f5b]">
                          {move.move_type}
                        </span>
                        <span className="rounded-md bg-[#f3f4f0] px-2 py-1 text-xs text-[#69746d]">
                          {move.channel}
                        </span>
                        <span className="rounded-md bg-[#eef1ff] px-2 py-1 text-xs text-[#3f4f94]">
                          {move.stage}
                        </span>
                      </div>
                      <h2 className="mt-3 font-medium">{move.title}</h2>
                      {move.body ? (
                        <p className="mt-1 whitespace-pre-wrap text-sm text-[#34413a]">{move.body}</p>
                      ) : null}
                    </div>
                    <span className="w-fit rounded-md bg-[#fff1d6] px-2 py-1 text-xs text-[#6b5424]">
                      {move.status}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <form action={updateRelationshipMoveAction}>
                      <input name="id" type="hidden" value={move.id} />
                      <input name="status" type="hidden" value="approved" />
                      <button className="h-9 rounded-md bg-[#1f6f5b] px-3 text-sm text-white">
                        Approve
                      </button>
                    </form>
                    <form action={updateRelationshipMoveAction}>
                      <input name="id" type="hidden" value={move.id} />
                      <input name="status" type="hidden" value="completed_manually" />
                      <button className="h-9 rounded-md border border-[#cbd5cc] px-3 text-sm">
                        Mark Done Manually
                      </button>
                    </form>
                    <form action={updateRelationshipMoveAction}>
                      <input name="id" type="hidden" value={move.id} />
                      <input name="status" type="hidden" value="rejected" />
                      <button className="h-9 rounded-md border border-[#cbd5cc] px-3 text-sm">
                        Reject
                      </button>
                    </form>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
