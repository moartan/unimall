export default function LoadingSkeletonRows({ rows = 5 }) {
  return (
    <>
      {Array.from({ length: rows }).map((_, idx) => (
        <tr key={idx} className={`border-t border-primary/10 ${idx % 2 === 0 ? 'bg-white' : 'bg-[#f7f9fc]'}`}>
          <td className="px-4 py-4">
            <div className="h-4 w-24 rounded bg-slate-200 animate-pulse" />
            <div className="h-3 w-20 rounded bg-slate-100 animate-pulse mt-2" />
          </td>
          <td className="px-4 py-4">
            <div className="h-4 w-32 rounded bg-slate-200 animate-pulse" />
            <div className="h-3 w-28 rounded bg-slate-100 animate-pulse mt-2" />
          </td>
          <td className="px-4 py-4">
            <div className="h-4 w-16 rounded bg-slate-200 animate-pulse" />
          </td>
          <td className="px-4 py-4">
            <div className="h-4 w-20 rounded bg-slate-200 animate-pulse" />
          </td>
          <td className="px-4 py-4">
            <div className="h-6 w-24 rounded-full bg-slate-200 animate-pulse" />
            <div className="h-3 w-24 rounded bg-slate-100 animate-pulse mt-2" />
          </td>
          <td className="px-4 py-4">
            <div className="h-6 w-24 rounded-full bg-slate-200 animate-pulse" />
          </td>
          <td className="px-4 py-4">
            <div className="h-3 w-16 rounded bg-slate-200 animate-pulse" />
          </td>
          <td className="px-4 py-4">
            <div className="flex justify-end gap-2">
              <div className="h-9 w-9 rounded-lg bg-slate-100 animate-pulse" />
              <div className="h-9 w-9 rounded-lg bg-slate-100 animate-pulse" />
              <div className="h-9 w-9 rounded-lg bg-slate-100 animate-pulse" />
            </div>
          </td>
        </tr>
      ))}
    </>
  );
}
