import { ClientRMQ, RmqRecordBuilder } from '@nestjs/microservices';
import { catchException } from '~libs/common/utils/shared.util';
import { THeaders } from '../types/common.type';

export function sendMessagePipeException<T>({
    client,
    pattern,
    data,
    headers,
}: {
    client: ClientRMQ;
    pattern: any;
    data?: T;
    headers?: THeaders;
}) {
    const record = new RmqRecordBuilder()
        .setData(data ?? {})
        .setOptions({
            headers: headers,
        })
        .build();
    return client.send(pattern, record).pipe(catchException());
}
