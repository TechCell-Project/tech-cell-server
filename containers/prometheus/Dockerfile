FROM prom/prometheus:v2.49.0-rc.1

COPY ./prometheus.yml /etc/prometheus/prometheus.yml
COPY ./generate-config.sh /etc/prometheus/generate-config.sh

RUN chmod +x /etc/prometheus/generate-config.sh

ENTRYPOINT ["/bin/sh", "-c", "/etc/prometheus/generate-config.sh && /bin/prometheus --config.file=/etc/prometheus/prometheus.yml"]