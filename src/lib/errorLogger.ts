export interface ErrorLog {
  timestamp: string;
  type: 'network' | 'api' | 'data' | 'unknown';
  component: string;
  message: string;
  details?: any;
}

class ErrorLogger {
  private logs: ErrorLog[] = [];
  private maxLogs = 50;

  log(log: Omit<ErrorLog, 'timestamp'>) {
    const entry: ErrorLog = {
      ...log,
      timestamp: new Date().toISOString(),
    };

    this.logs.unshift(entry);
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(0, this.maxLogs);
    }

    console.error(`[ErrorLogger] ${entry.component}:`, entry.message, entry.details || '');
  }

  getLogs(): ErrorLog[] {
    return [...this.logs];
  }

  getLogsByComponent(component: string): ErrorLog[] {
    return this.logs.filter(log => log.component === component);
  }

  getLogsByType(type: ErrorLog['type']): ErrorLog[] {
    return this.logs.filter(log => log.type === type);
  }

  clearLogs() {
    this.logs = [];
    console.log('[ErrorLogger] All logs cleared');
  }

  exportLogs(): string {
    return JSON.stringify(this.logs, null, 2);
  }
}

export const errorLogger = new ErrorLogger();
