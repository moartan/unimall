import { MdOutlineArrowBackIos, MdOutlineArrowForwardIos } from 'react-icons/md';

export default function Pagination({ currentPage, totalPages, onPrev, onNext, rangeStart, rangeEnd, total }) {
  return (
    <div className="flex flex-col md:flex-row items-center justify-between gap-3 pt-3 text-sm text-text-secondary dark:text-text-light/70 border-t border-primary/10">
      <span>
        Showing {rangeStart}-{rangeEnd} of {total} products
      </span>
      <div className="flex items-center gap-2">
        <button
          disabled={currentPage === 1}
          onClick={onPrev}
          className="p-2 rounded-lg border border-primary/20 text-text-primary dark:text-text-light disabled:opacity-40 hover:bg-primary/10 transition"
        >
          <MdOutlineArrowBackIos size={16} />
        </button>
        <div className="px-3 py-1 rounded-lg bg-light-bg dark:bg-dark-hover border border-primary/10 text-text-primary dark:text-text-light">
          {currentPage} / {totalPages}
        </div>
        <button
          disabled={currentPage === totalPages}
          onClick={onNext}
          className="p-2 rounded-lg border border-primary/20 text-text-primary dark:text-text-light disabled:opacity-40 hover:bg-primary/10 transition"
        >
          <MdOutlineArrowForwardIos size={16} />
        </button>
      </div>
    </div>
  );
}
