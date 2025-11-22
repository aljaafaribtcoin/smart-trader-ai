import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  TrendingUp, 
  TrendingDown, 
  CheckCircle, 
  XCircle, 
  Clock,
  Target,
  AlertTriangle
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ar } from 'date-fns/locale';
import { useUpdatePatternStatus, useDeletePattern, type Pattern } from '@/hooks/api/usePatterns';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreVertical } from 'lucide-react';

interface PatternCardProps {
  pattern: Pattern;
}

export const PatternCard = ({ pattern }: PatternCardProps) => {
  const updateStatus = useUpdatePatternStatus();
  const deletePattern = useDeletePattern();

  const getPatternIcon = () => {
    if (pattern.pattern_type === 'reversal') {
      return pattern.pattern_name.toLowerCase().includes('top') || 
             pattern.pattern_name.toLowerCase().includes('shoulders')
        ? TrendingDown
        : TrendingUp;
    }
    return TrendingUp;
  };

  const getConfidenceColor = () => {
    if (pattern.confidence >= 75) return 'text-success';
    if (pattern.confidence >= 60) return 'text-warning';
    return 'text-muted-foreground';
  };

  const getStatusColor = () => {
    switch (pattern.status) {
      case 'active':
        return 'default';
      case 'completed':
        return 'secondary';
      case 'invalidated':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  const getStatusLabel = () => {
    switch (pattern.status) {
      case 'active':
        return 'نشط';
      case 'completed':
        return 'مكتمل';
      case 'invalidated':
        return 'ملغي';
      default:
        return pattern.status;
    }
  };

  const Icon = getPatternIcon();

  return (
    <Card className="p-4 hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className={`h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center`}>
            <Icon className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-lg">{pattern.pattern_name}</h3>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="outline" className="text-xs">
                {pattern.symbol}
              </Badge>
              <Badge variant="outline" className="text-xs">
                {pattern.timeframe}
              </Badge>
              <Badge 
                variant={pattern.pattern_type === 'reversal' ? 'default' : 'secondary'}
                className="text-xs"
              >
                {pattern.pattern_type === 'reversal' ? 'انعكاس' : 'استمرار'}
              </Badge>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant={getStatusColor()}>
            {getStatusLabel()}
          </Badge>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {pattern.status === 'active' && (
                <>
                  <DropdownMenuItem
                    onClick={() => updateStatus.mutate({ 
                      patternId: pattern.id, 
                      status: 'completed' 
                    })}
                  >
                    <CheckCircle className="h-4 w-4 ml-2" />
                    تحديد كمكتمل
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => updateStatus.mutate({ 
                      patternId: pattern.id, 
                      status: 'invalidated' 
                    })}
                  >
                    <XCircle className="h-4 w-4 ml-2" />
                    تحديد كملغي
                  </DropdownMenuItem>
                </>
              )}
              <DropdownMenuItem
                onClick={() => deletePattern.mutate(pattern.id)}
                className="text-destructive"
              >
                <XCircle className="h-4 w-4 ml-2" />
                حذف
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {pattern.description && (
        <p className="text-sm text-muted-foreground mb-3">{pattern.description}</p>
      )}

      <div className="grid grid-cols-2 gap-3 mb-3">
        <div className="bg-secondary/50 rounded-lg p-3">
          <p className="text-xs text-muted-foreground mb-1">درجة الثقة</p>
          <div className="flex items-center gap-2">
            <div className="flex-1 h-2 bg-border rounded-full overflow-hidden">
              <div 
                className={`h-full ${
                  pattern.confidence >= 75 
                    ? 'bg-success' 
                    : pattern.confidence >= 60 
                    ? 'bg-warning' 
                    : 'bg-muted-foreground'
                }`}
                style={{ width: `${pattern.confidence}%` }}
              />
            </div>
            <span className={`text-sm font-bold ${getConfidenceColor()}`}>
              {pattern.confidence}%
            </span>
          </div>
        </div>

        <div className="bg-secondary/50 rounded-lg p-3">
          <p className="text-xs text-muted-foreground mb-1">تم الاكتشاف</p>
          <div className="flex items-center gap-1 text-sm">
            <Clock className="h-3 w-3" />
            <span>
              {formatDistanceToNow(new Date(pattern.detected_at), { 
                addSuffix: true, 
                locale: ar 
              })}
            </span>
          </div>
        </div>
      </div>

      {(pattern.target_price || pattern.stop_loss) && (
        <div className="border-t pt-3 mt-3">
          <div className="grid grid-cols-2 gap-3 text-sm">
            {pattern.target_price && (
              <div>
                <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                  <Target className="h-3 w-3" />
                  السعر المستهدف
                </p>
                <p className="font-semibold text-success">
                  {pattern.target_price.toFixed(2)}
                </p>
              </div>
            )}
            {pattern.stop_loss && (
              <div>
                <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                  <AlertTriangle className="h-3 w-3" />
                  وقف الخسارة
                </p>
                <p className="font-semibold text-destructive">
                  {pattern.stop_loss.toFixed(2)}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </Card>
  );
};
