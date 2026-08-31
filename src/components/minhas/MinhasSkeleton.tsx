/** Skeleton de loading do /minhas (KPIs + tabela). */
export default function MinhasSkeleton() {
  return (
    <div className="flex flex-col gap-[18px]">
      <div className="grid grid-cols-4 gap-[14px] max-[1150px]:grid-cols-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex animate-pulse flex-col gap-2 rounded-2xl border border-al-border bg-white px-5 py-4">
            <div className="h-3 w-2/3 rounded bg-al-rail" />
            <div className="h-7 w-1/3 rounded bg-al-rail" />
            <div className="h-3 w-1/2 rounded bg-al-rail" />
          </div>
        ))}
      </div>
      <div className="animate-pulse rounded-[18px] border border-al-border bg-white px-[22px] py-5">
        <div className="mb-4 h-4 w-40 rounded bg-al-rail" />
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 border-b border-al-rail py-4 last:border-b-0">
            <div className="h-4 w-44 rounded bg-al-rail" />
            <div className="h-4 flex-1 rounded bg-al-rail" />
            <div className="h-4 w-20 rounded bg-al-rail" />
            <div className="h-6 w-28 rounded-full bg-al-rail" />
          </div>
        ))}
      </div>
    </div>
  );
}
