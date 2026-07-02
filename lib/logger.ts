export interface TokenUsage {
  promptTokens: number;
  completionTokens: number;
}

class Logger {
  info(message: string, meta?: any) {
    const timestamp = new Date().toISOString();
    console.log(`[INFO] [${timestamp}] ${message}`, meta ? JSON.stringify(meta) : '');
  }

  warn(message: string, meta?: any) {
    const timestamp = new Date().toISOString();
    console.warn(`[WARN] [${timestamp}] ${message}`, meta ? JSON.stringify(meta) : '');
  }

  error(message: string, error?: any) {
    const timestamp = new Date().toISOString();
    console.error(`[ERROR] [${timestamp}] ${message}`, error ? error.stack || JSON.stringify(error) : '');
  }

  logNodeExecution(
    nodeName: string,
    status: 'idle' | 'running' | 'completed' | 'warning' | 'failed',
    durationMs: number,
    tokens?: TokenUsage,
    errorMessage?: string
  ) {
    const timestamp = new Date().toISOString();
    console.log(
      `[NODE] [${timestamp}] Node: ${nodeName} | Status: ${status} | Duration: ${durationMs}ms` +
      (tokens ? ` | Prompt Tokens: ${tokens.promptTokens} | Completion Tokens: ${tokens.completionTokens}` : '') +
      (errorMessage ? ` | Error: ${errorMessage}` : '')
    );
  }

  logToolUsage(
    toolName: string,
    ticker: string,
    durationMs: number,
    success: boolean,
    errorMessage?: string
  ) {
    const timestamp = new Date().toISOString();
    console.log(
      `[TOOL] [${timestamp}] Tool: ${toolName} | Ticker: ${ticker} | Status: ${success ? 'success' : 'failed'} | Latency: ${durationMs}ms` +
      (errorMessage ? ` | Error: ${errorMessage}` : '')
    );
  }
}

export const logger = new Logger();
