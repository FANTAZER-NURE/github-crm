type LogLevel = 'info' | 'warn' | 'error' | 'debug';

interface LogMessage {
  level: LogLevel;
  message: string;
  timestamp: string;
  [key: string]: any;
}

const isProduction = process.env.NODE_ENV === 'production';

/**
 * Log a message with the specified level and additional data
 */
const log = (level: LogLevel, message: string, data?: any): void => {
  const timestamp = new Date().toISOString();

  const logObj: LogMessage = {
    level,
    message,
    timestamp,
  };

  if (data) {
    // If data is an error, extract useful properties
    if (data instanceof Error) {
      logObj.errorName = data.name;
      logObj.stack = data.stack;

      // Extract additional properties from the error
      const errorObj: Record<string, any> = {};
      Object.getOwnPropertyNames(data).forEach((key) => {
        if (key !== 'name' && key !== 'message' && key !== 'stack') {
          errorObj[key] = (data as any)[key];
        }
      });

      if (Object.keys(errorObj).length > 0) {
        logObj.errorDetails = errorObj;
      }
    } else {
      logObj.data = data;
    }
  }

  // In production, we might want to only log errors and warnings
  if (isProduction && level === 'debug') {
    return;
  }

  // Format for console output
  const formattedMsg = JSON.stringify(logObj, null, 2);

  switch (level) {
    case 'info':
      console.log(formattedMsg);
      break;
    case 'warn':
      console.warn(formattedMsg);
      break;
    case 'error':
      console.error(formattedMsg);
      break;
    case 'debug':
      console.debug(formattedMsg);
      break;
    default:
      console.log(formattedMsg);
  }
};

/**
 * Log an info message
 */
export const info = (message: string, data?: any): void => {
  log('info', message, data);
};

/**
 * Log a warning message
 */
export const warn = (message: string, data?: any): void => {
  log('warn', message, data);
};

/**
 * Log an error message
 */
export const error = (message: string, err?: any): void => {
  log('error', message, err);
};

/**
 * Log a debug message (only in development)
 */
export const debug = (message: string, data?: any): void => {
  log('debug', message, data);
};

export default {
  info,
  warn,
  error,
  debug,
};
