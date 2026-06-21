export function BoardSkeleton() {
  return (
    <div className="h-[600px] flex items-center justify-center">
      <div className="space-y-4 w-full max-w-2xl p-4">
        <div className="animate-pulse space-y-4">
          {/* Grid skeleton */}
          <div className="grid grid-cols-5 gap-2">
            {Array.from({ length: 25 }).map((_, i) => (
              <div
                key={i}
                className="aspect-square bg-muted rounded"
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export function ActionBarSkeleton() {
  return (
    <div className="h-16 border-t bg-background px-4">
      <div className="animate-pulse h-full flex items-center justify-center gap-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-10 w-20 bg-muted rounded" />
        ))}
      </div>
    </div>
  );
}

export function StatsPanelSkeleton() {
  return (
    <div className="h-24 p-4 border rounded-lg">
      <div className="animate-pulse grid grid-cols-2 md:grid-cols-5 gap-4 h-full">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="space-y-2">
            <div className="h-4 bg-muted rounded w-3/4" />
            <div className="h-6 bg-muted rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function NumberPadSkeleton() {
  return (
    <div className="h-20 border-t bg-background px-4">
      <div className="animate-pulse h-full flex items-center justify-center gap-2">
        {Array.from({ length: 9 }).map((_, i) => (
          <div key={i} className="h-12 w-12 bg-muted rounded-full" />
        ))}
      </div>
    </div>
  );
}
