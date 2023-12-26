FROM prom/prometheus:v2.49.0-rc.1

USER root

COPY ./generate-config.sh /etc/prometheus/

RUN chmod +x /etc/prometheus/generate-config.sh && \
    chown -R nobody:nobody /etc/prometheus

USER nobody

ENTRYPOINT ["/bin/sh", "-c", "/etc/prometheus/generate-config.sh && /bin/prometheus --config.file='/etc/prometheus/prometheus.yml'"]