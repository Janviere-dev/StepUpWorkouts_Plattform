FROM ubuntu:24.04

# Prevent interactive prompts
ENV DEBIAN_FRONTEND=noninteractive

# Install dependencies
RUN apt-get update -qq && \
    apt-get install -y --no-install-recommends \
        openssh-server sudo iputils-ping ca-certificates nginx npm nodejs curl supervisor && \
    mkdir /run/sshd && \
    apt-get clean && rm -rf /var/lib/apt/lists/*

# Create user
RUN if ! id -u ubuntu >/dev/null 2>&1; then \
        useradd --create-home --uid 1000 --shell /bin/bash ubuntu; \
    fi && \
    echo 'ubuntu:pass123' | chpasswd && \
    usermod -aG sudo ubuntu && \
    sed -ri 's/#?PermitRootLogin.*/PermitRootLogin no/' /etc/ssh/sshd_config && \
    sed -ri 's/#?PasswordAuthentication.*/PasswordAuthentication yes/' /etc/ssh/sshd_config

# Configure nginx
RUN cat <<EOF > /etc/nginx/sites-available/project
server {
    listen 80 default_server;
    server_name localhost;

    location / {
        proxy_pass http://localhost:8000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
        add_header Served-By "\$HOSTNAME";
    }
}
EOF
RUN ln -s /etc/nginx/sites-available/project /etc/nginx/sites-enabled/ && rm -f /etc/nginx/sites-enabled/default

# Set working directory
WORKDIR /app

# Copy only package files first for caching (Backend)
COPY Backend/package*.json ./Backend/

# Install dependencies
WORKDIR /app/Backend
RUN npm install

# Copy the rest of the project
WORKDIR /app
COPY . .

# Configure Supervisor to manage multiple services
RUN mkdir -p /etc/supervisor/conf.d
RUN cat <<EOF > /etc/supervisor/conf.d/services.conf
[supervisord]
nodaemon=true

[program:sshd]
command=/usr/sbin/sshd -D

[program:nginx]
command=/usr/sbin/nginx -g "daemon off;"

[program:node]
directory=/app/Backend
command=node server.js
EOF

# Expose ports
EXPOSE 22 80 8000

# Start all services with Supervisor
CMD ["/usr/bin/supervisord", "-c", "/etc/supervisor/conf.d/services.conf"]
