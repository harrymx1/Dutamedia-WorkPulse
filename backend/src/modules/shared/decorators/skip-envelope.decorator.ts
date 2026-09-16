import { SetMetadata } from '@nestjs/common';

export const SKIP_ENVELOPE_KEY = 'SKIP_ENVELOPE';
export const SkipEnvelope = () => SetMetadata(SKIP_ENVELOPE_KEY, true);
