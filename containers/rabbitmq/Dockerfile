FROM rabbitmq:3-management-alpine

COPY ./entrypoint/cluster-entrypoint.sh /usr/local/bin/cluster-entrypoint.sh

ENTRYPOINT ["/usr/local/bin/cluster-entrypoint.sh"]