#!/bin/sh

set -eu

exec /bin/node_exporter \
    --path.procfs=/host/proc \
    --path.sysfs=/host/sys \
    --path.rootfs=/rootfs \
    --collector.filesystem.ignored-mount-points=^/(sys|proc|dev|host|etc)($$|/)