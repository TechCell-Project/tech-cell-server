#!/bin/sh

cat << EOF > /etc/prometheus/prometheus.yml
scrape_configs:
  - job_name: "sws-authtest"
    scrape_interval: "10s"
    metrics_path: "/api-stats/metrics"
    static_configs:
      - targets: [api:8000]
    basic_auth:
      username: ${STATS_USER}
      password: ${STATS_PASSWORD}
EOF
