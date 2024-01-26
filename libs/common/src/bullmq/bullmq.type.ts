export type RedisStatus =
    | 'wait'
    | 'reconnecting'
    | 'connecting'
    | 'connect'
    | 'ready'
    | 'close'
    | 'end'
    | 'disconnecting';
