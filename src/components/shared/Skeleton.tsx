/**
 * Reusable skeleton primitives.
 *
 * Usage:
 *   <SkeletonLine w="w-3/4" />
 *   <SkeletonBox h="h-40" />
 *   <PostCardSkeleton />
 */

const base = "animate-pulse bg-surface-2 rounded-lg";

// ─── Primitives ───────────────────────────────────────────────────────────────

export const SkeletonBox = ({
  h = "h-4",
  w = "w-full",
  rounded = "rounded-lg",
  className = "",
}: {
  h?: string;
  w?: string;
  rounded?: string;
  className?: string;
}) => <div className={`${base} ${h} ${w} ${rounded} ${className}`} />;

export const SkeletonLine = ({
  w = "w-full",
  className = "",
}: {
  w?: string;
  className?: string;
}) => <SkeletonBox h="h-3.5" w={w} className={className} />;

export const SkeletonCircle = ({ size = "w-9 h-9" }: { size?: string }) => (
  <div className={`animate-pulse bg-surface-2 rounded-full ${size} shrink-0`} />
);

// ─── PostCard skeleton ────────────────────────────────────────────────────────

export const PostCardSkeleton = () => (
  <div className="bg-surface border border-border rounded-2xl p-4 shadow-[0_1px_4px_rgba(0,0,0,0.05)]">
    {/* Meta row */}
    <div className="flex items-center gap-2 mb-3">
      <SkeletonCircle size="w-7 h-7" />
      <SkeletonLine w="w-28" />
      <SkeletonLine w="w-16" />
    </div>
    {/* Title */}
    <SkeletonLine w="w-4/5" className="mb-2" />
    <SkeletonLine w="w-3/5" className="mb-4" />
    {/* Body preview */}
    <SkeletonLine w="w-full" className="mb-1.5" />
    <SkeletonLine w="w-5/6" className="mb-4" />
    {/* Footer */}
    <div className="flex items-center gap-3 pt-3 border-t border-surface-2">
      <SkeletonBox h="h-7" w="w-20" rounded="rounded-xl" />
      <SkeletonBox h="h-7" w="w-16" rounded="rounded-xl" />
      <SkeletonBox h="h-7" w="w-16" rounded="rounded-xl" />
    </div>
  </div>
);

// ─── Feed skeleton (list of cards) ────────────────────────────────────────────

export const FeedSkeleton = ({ count = 4 }: { count?: number }) => (
  <div className="space-y-3">
    {Array.from({ length: count }).map((_, i) => (
      <PostCardSkeleton key={i} />
    ))}
  </div>
);

// ─── Profile header skeleton ──────────────────────────────────────────────────

export const ProfileHeaderSkeleton = () => (
  <div className="bg-surface border border-border rounded-2xl overflow-hidden mb-4">
    {/* Banner */}
    <SkeletonBox h="h-32" rounded="rounded-none" />
    <div className="px-5 pb-5">
      {/* Avatar row */}
      <div className="flex items-end justify-between -mt-8 mb-4">
        <SkeletonBox h="h-20" w="w-20" rounded="rounded-2xl" />
        <SkeletonBox h="h-9" w="w-28" rounded="rounded-xl" />
      </div>
      {/* Name */}
      <SkeletonLine w="w-40" className="mb-1.5" />
      <SkeletonLine w="w-24" className="mb-3" />
      {/* Bio */}
      <SkeletonLine w="w-full" className="mb-1.5" />
      <SkeletonLine w="w-4/5" className="mb-4" />
      {/* Stats */}
      <div className="flex gap-6 pt-3 border-t border-surface-2">
        {[1, 2, 3].map((i) => (
          <div key={i}>
            <SkeletonBox h="h-6" w="w-8" className="mb-1" />
            <SkeletonLine w="w-12" />
          </div>
        ))}
      </div>
    </div>
  </div>
);

// ─── Community banner skeleton ────────────────────────────────────────────────

export const CommunityBannerSkeleton = () => (
  <div className="bg-surface border border-border rounded-2xl overflow-hidden mb-4">
    <SkeletonBox h="h-36" rounded="rounded-none" />
    <div className="px-5 pb-5">
      <div className="flex items-end justify-between -mt-9 mb-4">
        <SkeletonBox h="h-20" w="w-20" rounded="rounded-2xl" />
        <SkeletonBox h="h-9" w="w-24" rounded="rounded-xl" />
      </div>
      <SkeletonLine w="w-48" className="mb-1.5" />
      <SkeletonLine w="w-32" className="mb-3" />
      <SkeletonLine w="w-full" className="mb-1.5" />
      <SkeletonLine w="w-3/4" />
    </div>
  </div>
);

// ─── Notification item skeleton ───────────────────────────────────────────────

export const NotificationSkeleton = ({ count = 5 }: { count?: number }) => (
  <div className="bg-surface border border-border rounded-2xl overflow-hidden">
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} className="flex items-start gap-3 px-4 py-3 border-b border-surface-2 last:border-b-0">
        <SkeletonCircle size="w-8 h-8" />
        <div className="flex-1">
          <SkeletonLine w="w-3/4" className="mb-1.5" />
          <SkeletonLine w="w-1/2" />
        </div>
      </div>
    ))}
  </div>
);
