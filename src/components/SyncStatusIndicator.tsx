import { Badge } from '@/components/ui/badge';
import { Loader2, CheckCircle2, XCircle, Clock } from 'lucide-react';
import { useSyncStatus } from '@/hooks/useSyncStatus';
import { cn } from '@/lib/utils';

interface SyncStatusIndicatorProps {
  dataType?: string;
  symbol?: string;
  compact?: boolean;
}

export const SyncStatusIndicator = ({ 
  dataType, 
  symbol, 
  compact = false 
}: SyncStatusIndicatorProps) => {
  const { data: statuses, isLoading } = useSyncStatus(dataType, symbol);

  if (isLoading || !statuses || statuses.length === 0) {
    return null;
  }

  // Get overall status
  const hasError = statuses.some(s => s.status === 'error');
  const isSyncing = statuses.some(s => s.status === 'syncing');
  const allSuccess = statuses.every(s => s.status === 'success');

  const getStatusColor = () => {
    if (hasError) return 'destructive';
    if (isSyncing) return 'secondary';
    if (allSuccess) return 'default';
    return 'outline';
  };

  const getStatusIcon = () => {
    if (hasError) return <XCircle className="w-3 h-3" />;
    if (isSyncing) return <Loader2 className="w-3 h-3 animate-spin" />;
    if (allSuccess) return <CheckCircle2 className="w-3 h-3" />;
    return <Clock className="w-3 h-3" />;
  };

  const getStatusText = () => {
    if (hasError) return 'خطأ في المزامنة';
    if (isSyncing) return 'جاري المزامنة';
    if (allSuccess) return 'متزامن';
    return 'بانتظار المزامنة';
  };

  if (compact) {
    return (
      <div className="flex items-center gap-1">
        {getStatusIcon()}
      </div>
    );
  }

  return (
    <Badge variant={getStatusColor()} className="gap-1.5">
      {getStatusIcon()}
      <span className="text-xs">{getStatusText()}</span>
    </Badge>
  );
};
