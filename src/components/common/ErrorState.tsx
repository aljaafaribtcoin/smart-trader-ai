import { AlertTriangle, RefreshCw, WifiOff, Database } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface ErrorStateProps {
  type: 'network' | 'api' | 'data' | 'unknown';
  title?: string;
  message: string;
  onRetry?: () => void;
  showIcon?: boolean;
  compact?: boolean;
}

const ERROR_CONFIGS = {
  network: {
    icon: WifiOff,
    defaultTitle: 'مشكلة في الاتصال',
    color: 'text-warning',
  },
  api: {
    icon: AlertTriangle,
    defaultTitle: 'خطأ في الخادم',
    color: 'text-destructive',
  },
  data: {
    icon: Database,
    defaultTitle: 'لا توجد بيانات',
    color: 'text-muted-foreground',
  },
  unknown: {
    icon: AlertTriangle,
    defaultTitle: 'حدث خطأ',
    color: 'text-destructive',
  },
};

export const ErrorState = ({
  type,
  title,
  message,
  onRetry,
  showIcon = true,
  compact = false,
}: ErrorStateProps) => {
  const config = ERROR_CONFIGS[type];
  const Icon = config.icon;

  if (compact) {
    return (
      <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
        <div className="flex items-center gap-2">
          {showIcon && <Icon className={`w-4 h-4 ${config.color}`} />}
          <span className="text-sm text-foreground flex-1">{message}</span>
          {onRetry && (
            <Button onClick={onRetry} variant="ghost" size="sm" className="h-7 px-2">
              <RefreshCw className="w-3 h-3" />
            </Button>
          )}
        </div>
      </div>
    );
  }

  return (
    <Card className="p-6 text-center">
      {showIcon && <Icon className={`w-12 h-12 mx-auto mb-4 ${config.color}`} />}
      <h3 className="text-lg font-bold mb-2">
        {title || config.defaultTitle}
      </h3>
      <p className="text-sm text-muted-foreground mb-4">{message}</p>
      {onRetry && (
        <Button onClick={onRetry} variant="outline" size="sm">
          <RefreshCw className="w-4 h-4 mr-2" />
          إعادة المحاولة
        </Button>
      )}
    </Card>
  );
};
