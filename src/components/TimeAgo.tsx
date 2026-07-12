'use client';

import { useEffect, useState } from 'react';
import { timeAgo } from '@/lib/mergeData';

/**
 * Relative time without breaking hydration.
 *
 * `label` is computed at BUILD and is identical on server and client, so the
 * first paint matches exactly. After mount we recompute against the real clock,
 * which keeps the number honest if the page has been open (or cached) for a
 * while. Rendering timeAgo() directly is React error #425.
 */
export function TimeAgo({ iso, label }: { iso: string; label: string }) {
  const [text, setText] = useState(label);
  useEffect(() => {
    setText(timeAgo(iso));
  }, [iso]);
  return <>{text}</>;
}
