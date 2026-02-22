/**
 * Lightweight structured logger.
 *
 * Uses `console` under the hood so there are no extra dependencies.
 * In production swap this out for `winston` or `pino` if desired –
 * the interface stays identical.
 */

const LEVELS = { error: 0, warn: 1, info: 2, http: 3, debug: 4 };

const COLOR = {
    reset: '\x1b[0m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    cyan: '\x1b[36m',
    green: '\x1b[32m',
    magenta: '\x1b[35m',
    gray: '\x1b[90m',
};

const LEVEL_COLOR = {
    error: COLOR.red,
    warn: COLOR.yellow,
    info: COLOR.green,
    http: COLOR.cyan,
    debug: COLOR.magenta,
};

const currentLevel = () => {
    const env = process.env.NODE_ENV || 'development';
    return env === 'production' ? 'info' : 'debug';
};

const shouldLog = (level) => LEVELS[level] <= LEVELS[currentLevel()];

const format = (level, message) => {
    const ts = new Date().toISOString();
    const col = LEVEL_COLOR[level] || COLOR.gray;
    return `${COLOR.gray}${ts}${COLOR.reset} ${col}[${level.toUpperCase().padStart(5)}]${COLOR.reset} ${message}`;
};

const logger = {
    error: (msg) => shouldLog('error') && console.error(format('error', msg)),
    warn: (msg) => shouldLog('warn') && console.warn(format('warn', msg)),
    info: (msg) => shouldLog('info') && console.info(format('info', msg)),
    http: (msg) => shouldLog('http') && console.log(format('http', msg)),
    debug: (msg) => shouldLog('debug') && console.debug(format('debug', msg)),
};

export default logger;
