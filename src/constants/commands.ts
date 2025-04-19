export const COMMANDS = Object.freeze({
    DECR: 'DECR',
    DECRBY: 'DECRBY',
    DEL: 'DEL',
    ECHO: 'ECHO',
    EXISTS: 'EXISTS',
    EXPIRE: 'EXPIRE',
    EXPIREAT: 'EXPIREAT',
    EXPIRETIME: 'EXPIRETIME',
    FLUSHDB: 'FLUSHDB',
    GET: 'GET',
    GETSET: 'GETSET',
    GETDEL: 'GETDEL',
    GETEX: 'GETEX',
    GET_WATCH: 'GET.WATCH',
    HANDSHAKE: 'HANDSHAKE',
    HGET: 'HGET',
    HGET_WATCH: 'HGET.WATCH',
    HGETALL: 'HGETALL',
    HGETALL_WATCH: 'HGETALL.WATCH',
    HSET: 'HSET',
    INCR: 'INCR',
    INCRBY: 'INCRBY',
    PING: 'PING',
    SET: 'SET',
    TTL: 'TTL',
    TYPE: 'TYPE',
    UNWATCH: 'UNWATCH',
});

export const COMMAND_TO_COMMAND_NAME = Object.freeze({
    [COMMANDS.DECR]: 'decrement',
    [COMMANDS.DECRBY]: 'decrementBy',
    [COMMANDS.DEL]: 'delete',
    [COMMANDS.ECHO]: 'echo',
    [COMMANDS.EXISTS]: 'exists',
    [COMMANDS.EXPIRE]: 'expire',
    [COMMANDS.EXPIREAT]: 'expireAt',
    [COMMANDS.EXPIRETIME]: 'expireTime',
    [COMMANDS.FLUSHDB]: 'flushDB',
    [COMMANDS.GET]: 'get',
    [COMMANDS.GETSET]: 'getSet',
    [COMMANDS.GETDEL]: 'getAndDelete',
    [COMMANDS.GETEX]: 'getAndSetExpiry',
    [COMMANDS.GET_WATCH]: 'getWatch',
    [COMMANDS.HANDSHAKE]: 'handshake',
    [COMMANDS.HGET]: 'hGet',
    [COMMANDS.HGET_WATCH]: 'hGetWatch',
    [COMMANDS.HGETALL]: 'hGetAll',
    [COMMANDS.HGETALL_WATCH]: 'hGetAllWatch',
    [COMMANDS.HSET]: 'hSet',
    [COMMANDS.INCR]: 'increment',
    [COMMANDS.INCRBY]: 'incrementBy',
    [COMMANDS.PING]: 'ping',
    [COMMANDS.SET]: 'set',
    [COMMANDS.TTL]: 'ttl',
    [COMMANDS.TYPE]: 'type',
    [COMMANDS.UNWATCH]: 'unwatch',
});

export const CONN_TIMEOUT_MS = 5000;
export const QUERY_TIMEOUT_MS = 5000;
export const IDLE_TIMEOUT_MS = 60000;
