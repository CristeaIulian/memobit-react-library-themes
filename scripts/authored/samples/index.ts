// Every app's sample content, in batch order, which is the order the preview page lists them.

import { batch1Samples } from './batch-1.ts';
import { batch2Samples } from './batch-2.ts';
import { batch3Samples } from './batch-3.ts';
import { localAttuneSamples } from './local-attune.ts';
import { localRecreateSamples } from './local-recreate.ts';
import type { AppSample } from './types.ts';

export const appSamples: Record<string, AppSample> = {
    ...batch1Samples,
    ...batch2Samples,
    ...batch3Samples,
    ...localAttuneSamples,
    ...localRecreateSamples,
};
