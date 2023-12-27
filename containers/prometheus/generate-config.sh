#!/bin/sh

cat << EOF > /etc/prometheus/prometheus.yml
scrape_configs:
  - job_name: "api-sws"
    scrape_interval: "10s"
    metrics_path: "/api-stats/metrics"
    scheme: https
    static_configs:
      - targets: [api.techcell.cloud]
    basic_auth:
      username: ${STATS_USER}
      password: ${STATS_PASSWORD}

  - job_name: 'node-exporter'
    static_configs:
      - targets: ['node_exporter:9092']
EOF
