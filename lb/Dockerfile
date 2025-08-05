FROM ubuntu:24.04

ENV DEBIAN_FRONTEND=noninteractive
RUN apt-get update -qq && \
    apt-get install -y --no-install-recommends \
        openssh-server sudo iputils-ping ca-certificates nginx supervisor && \
    mkdir /run/sshd && \
    if ! id -u ubuntu >/dev/null 2>&1; then \
        useradd --create-home --uid 1000 --shell /bin/bash ubuntu; \
    fi && \
    echo 'ubuntu:pass123' | chpasswd && \
    usermod -aG sudo ubuntu && \
    sed -ri 's/#?PermitRootLogin.*/PermitRootLogin no/'  /etc/ssh/sshd_config && \
    sed -ri 's/#?PasswordAuthentication.*/PasswordAuthentication yes/' /etc/ssh/sshd_config && \
    apt-get clean && rm -rf /var/lib/apt/lists/*

RUN ssh-keygen -A

RUN cat <<EOF > /etc/nginx/sites-available/load-balancer
# Load Balancer Configuration
# Define backend servers
upstream backend_servers {
    # Default is round-robin (no directive needed)
    server 172.20.0.11:80 max_fails=3 fail_timeout=10s;
    server 172.20.0.12:80 max_fails=3 fail_timeout=10s;
}

# Server block to listen for incoming requests
server {
    listen 80;
    server_name _;

    location / {
        proxy_pass http://backend_servers;
        # Forward headers
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
}
EOF

RUN ln -s /etc/nginx/sites-available/load-balancer /etc/nginx/sites-enabled/ && \
    rm -f /etc/nginx/sites-enabled/default

RUN mkdir -p /etc/supervisor/conf.d

RUN cat <<EOF > /etc/supervisor/conf.d/services.conf
[supervisord]
nodaemon=true

[program:sshd]
command=/usr/sbin/sshd -D

[program:nginx]
command=/usr/sbin/nginx -g "daemon off;"
EOF

EXPOSE 22 80
CMD ["/usr/bin/supervisord", "-c", "/etc/supervisor/conf.d/services.conf"]

