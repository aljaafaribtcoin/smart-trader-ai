import { Skeleton } from '@/components/ui/skeleton';
import { Card } from '@/components/ui/card';

type SkeletonType = 'card' | 'table' | 'chart' | 'text' | 'list';

interface LoadingSkeletonProps {
  type?: SkeletonType;
  count?: number;
  className?: string;
}

export const LoadingSkeleton = ({ 
  type = 'card', 
  count = 1,
  className = '' 
}: LoadingSkeletonProps) => {
  const renderSkeleton = () => {
    switch (type) {
      case 'card':
        return (
          <Card className={`p-4 space-y-3 ${className}`}>
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <div className="flex gap-2 mt-4">
              <Skeleton className="h-8 w-20" />
              <Skeleton className="h-8 w-20" />
            </div>
          </Card>
        );

      case 'table':
        return (
          <div className={`space-y-2 ${className}`}>
            <Skeleton className="h-10 w-full" />
            {Array.from({ length: count }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        );

      case 'chart':
        return (
          <Card className={`p-4 ${className}`}>
            <Skeleton className="h-6 w-1/3 mb-4" />
            <Skeleton className="h-64 w-full" />
          </Card>
        );

      case 'text':
        return (
          <div className={`space-y-2 ${className}`}>
            {Array.from({ length: count }).map((_, i) => (
              <Skeleton key={i} className="h-4 w-full" />
            ))}
          </div>
        );

      case 'list':
        return (
          <div className={`space-y-3 ${className}`}>
            {Array.from({ length: count }).map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              </div>
            ))}
          </div>
        );

      default:
        return <Skeleton className={className} />;
    }
  };

  return type === 'table' || type === 'list' || type === 'text'
    ? renderSkeleton()
    : Array.from({ length: count }).map((_, i) => (
        <div key={i}>{renderSkeleton()}</div>
      ));
};
