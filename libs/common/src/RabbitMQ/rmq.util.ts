import { ClientRMQ, RmqRecordBuilder } from '@nestjs/microservices';
import { catchException } from '~libs/common/utils/shared.util';

export function sendMessagePipeException<T>({
    client,
    pattern,
    data,
    headers,
}: {
    client: ClientRMQ;
    pattern: any;
    data?: T;
    headers?: Record<string, any>;
}) {
    const record = new RmqRecordBuilder()
        .setData(data ?? {})
        .setOptions({
            headers: headers,
        })
        .build();
    return client.send(pattern, record).pipe(catchException());
}
