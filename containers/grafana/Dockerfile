FROM grafana/grafana:9.5.15-ubuntu

USER root

# Check if Grafana user and group exist before creating them and change the owner of the configuration files
RUN if ! id -u grafana > /dev/null 2>&1; then groupadd -r grafana && useradd -r -g grafana grafana; fi && \
    if getent group grafana > /dev/null 2>&1; then chown -R grafana:grafana /etc/grafana; fi

# Copy Grafana configuration files
COPY ./grafana.ini /etc/grafana/grafana.ini
COPY ./datasources.yaml /etc/grafana/provisioning/datasources/datasources.yaml
COPY ./dashboards.yaml /etc/grafana/provisioning/dashboards/dashboards.yaml

USER grafana

ENTRYPOINT ["/run.sh"]