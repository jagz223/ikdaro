import type { SeriesSourceReader } from "@/domain/series";
import type { SourceId } from "@/domain/source";
import { asuraReader } from "./asura/asura-reader";
import { demonicReader } from "./demonic/demonic-reader";
import { weebCentralReader } from "./weebcentral/weebcentral-reader";

export const liveReaders: Record<SourceId, SeriesSourceReader> = {
  asura: asuraReader,
  demonic: demonicReader,
  weebcentral: weebCentralReader,
};
