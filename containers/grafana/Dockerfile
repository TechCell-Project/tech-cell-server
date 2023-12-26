FROM grafana/grafana:latest

USER root

# Copy Grafana configuration files
COPY ./grafana.ini /etc/grafana/grafana.ini
COPY ./datasources.yaml /etc/grafana/provisioning/datasources/datasources.yaml
COPY ./dashboards.yaml /etc/grafana/provisioning/dashboards/dashboards.yaml

# Change the owner of the configuration files to the Grafana user
RUN chown -R grafana:grafana /etc/grafana

USER grafana

ENTRYPOINT ["/run.sh"]