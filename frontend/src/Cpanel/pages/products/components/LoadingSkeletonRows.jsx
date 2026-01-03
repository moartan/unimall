export default function LoadingSkeletonRows({ isBenefitView }) {
  const columns = isBenefitView ? 8 : 7;
  const rows = Array.from({ length: 5 });
  return (
    <>
      {rows.map((_, idx) => (
        <tr
          key={idx}
          className={`border-t border-primary/10 ${
            idx % 2 === 0 ? 'bg-white dark:bg-dark-card/40' : 'bg-light-bg/60 dark:bg-dark-hover/50'
          }`}
        >
          {Array.from({ length: columns }).map((__, colIdx) => (
            <td key={colIdx} className="px-4 py-3">
              <div className="h-3 w-full max-w-[120px] rounded-full bg-primary/10 animate-pulse" />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}
