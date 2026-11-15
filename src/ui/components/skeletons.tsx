const SKELETON_ROWS = 6;

function Block({ className }: { className: string }) {
  return <div className={`animate-pulse rounded-[4px] bg-surface ${className}`} />;
}

export function FeedSkeleton() {
  return (
    <div aria-busy="true" className="mx-auto max-w-[1440px] px-4 pt-8 sm:px-8">
      <Block className="h-[min(78vh,680px)] min-h-[560px] w-full" />
      <Block className="mt-32 h-16 w-2/3 max-w-xl" />
      <div className="mt-12 grid gap-6 md:grid-cols-2">
        {Array.from({ length: SKELETON_ROWS }, (_, index) => (
          <div key={index} className="flex gap-5 p-4">
            <Block className="aspect-[3/4] w-28 shrink-0" />
            <div className="flex flex-1 flex-col gap-3">
              <Block className="h-6 w-3/4" />
              <Block className="h-5 w-full" />
              <Block className="h-5 w-full" />
              <Block className="h-5 w-full" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function DetailSkeleton() {
  return (
    <div aria-busy="true" className="mx-auto grid max-w-[1440px] gap-12 px-4 pt-20 sm:px-8 lg:grid-cols-[380px_1fr]">
      <Block className="aspect-[3/4] w-full" />
      <div className="flex flex-col gap-4">
        <Block className="h-20 w-3/4" />
        <Block className="mt-10 h-11 w-1/2" />
        {Array.from({ length: SKELETON_ROWS }, (_, index) => (
          <Block key={index} className="h-12 w-full" />
        ))}
      </div>
    </div>
  );
}
