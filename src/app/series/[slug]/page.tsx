import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { getSeriesDetail } from "@/application/series-queries";
import { catalog, findCatalogEntry } from "@/config/catalog";
import { SeriesDetail } from "@/ui/components/series-detail";
import { DetailSkeleton } from "@/ui/components/skeletons";

export function generateStaticParams() {
  return catalog.map((entry) => ({ slug: entry.slug }));
}

export async function generateMetadata({ params }: PageProps<"/series/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  return { title: findCatalogEntry(slug)?.title };
}

async function SeriesContent({ params }: Pick<PageProps<"/series/[slug]">, "params">) {
  const { slug } = await params;
  const view = await getSeriesDetail(slug);
  if (!view) notFound();
  return <SeriesDetail view={view} />;
}

export default function SeriesPage({ params }: PageProps<"/series/[slug]">) {
  return (
    <Suspense fallback={<DetailSkeleton />}>
      <SeriesContent params={params} />
    </Suspense>
  );
}
