import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface ErrorMessageProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  suggestion?: string;
  className?: string;
}

export const ErrorMessage = ({
  title = 'حدث خطأ',
  message,
  onRetry,
  suggestion,
  className = '',
}: ErrorMessageProps) => {
  return (
    <Alert variant="destructive" className={className}>
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>{title}</AlertTitle>
      <AlertDescription className="mt-2 space-y-2">
        <p>{message}</p>
        
        {suggestion && (
          <p className="text-sm opacity-90">
            💡 {suggestion}
          </p>
        )}
        
        {onRetry && (
          <Button
            variant="outline"
            size="sm"
            onClick={onRetry}
            className="mt-2"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            إعادة المحاولة
          </Button>
        )}
      </AlertDescription>
    </Alert>
  );
};
