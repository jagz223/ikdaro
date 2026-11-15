import { Suspense } from "react";
import { getLatestFeed } from "@/application/series-queries";
import { HomeView } from "@/ui/components/home-view";
import { FeedSkeleton } from "@/ui/components/skeletons";

async function HomeContent() {
  return <HomeView views={await getLatestFeed()} />;
}

export default function HomePage() {
  return (
    <>
      <h1 className="sr-only">Ikdaro 읽다로</h1>
      <Suspense fallback={<FeedSkeleton />}>
        <HomeContent />
      </Suspense>
    </>
  );
}
