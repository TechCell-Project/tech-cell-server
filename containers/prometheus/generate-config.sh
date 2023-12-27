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
EOF
