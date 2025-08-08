# StepUpWorkouts_Plattform

Your all-in-one fitness web application powered by Node.js, Docker, and multi-server infrastructure.

---

##  Clone the Repository
```bash
git clone git@github.com:Janviere-dev/StepUpWorkouts_Plattform.git
```

> **Recommended:** Use VS Code for easier navigation and Live Server support.

---

##  Backend Setup

### 1. Navigate to the Backend
```bash
cd StepUpWorkouts_Plattform/Backend
```

### 2. Start the Server
```bash
node server.js
```

### 3. Install Node.js (if not installed)
- Download and install the LTS version of Node.js
- Verify installation:
```bash
node -v
npm -v
```
- Rerun the server:
```bash
node server.js
```

---

##  Frontend Setup

Open `Frontend/index.html` in VS Code and use the **Live Server** extension to preview the site.

---

##  Local Docker Testing

### Build & Run the App Locally
```bash
docker build -t <dockerhub-username>/<app-name>:v1 .
docker run -p 8080:8080 <dockerhub-username>/<app-name>:v1
curl http://localhost:8080  # Confirm it works
```

---

###  Push to Docker Hub
```bash
docker login
docker push <dockerhub-username>/<app-name>:v1
```
> Use semantic tags like `v1`, `v1.1`, `latest` to version your builds.

---

##  Deployment in Web Infrastructure Lab

### Step 1: Clone & Launch Lab Environment
```bash
git clone https://github.com/waka-man/web_infra_lab.git
cd web_infra_lab
docker compose up -d --build
docker compose ps
```

Expected Output:

| Container | IP Address   | Ports                  |
|-----------|--------------|------------------------|
| web-01    | 172.20.0.11  | SSH: 2211, HTTP: 8080  |
| web-02    | 172.20.0.12  | SSH: 2212, HTTP: 8081  |
| lb-01     | 172.20.0.10  | SSH: 2210, HTTP: 8082  |

---

### Step 2: SSH into Each Container
```bash
ssh ubuntu@localhost -p 2211  # web-01
ssh ubuntu@localhost -p 2212  # web-02
ssh ubuntu@localhost -p 2210  # lb-01
```
> Password: `pass123`

---

### Step 3: Pull & Run Docker Image on Web Servers
```bash
docker pull <dockerhub-username>/<app-name>:v1
docker run -d --name app --restart unless-stopped \
  -p 8080:8080 <dockerhub-username>/<app-name>:v1
```

Access Internally:

- http://web-01:8080  
- http://web-02:8080

---

##  HAProxy Load Balancer Configuration

Edit `/etc/haproxy/haproxy.cfg` in `lb-01`:

```haproxy
backend webapps
    balance roundrobin
    server web01 172.20.0.11:8080 check
    server web02 172.20.0.12:8080 check
```

Reload HAProxy:
```bash
docker exec -it lb-01 sh -c 'haproxy -sf $(pidof haproxy) -f /etc/haproxy/haproxy.cfg'
```

> Verify everything is served correctly:
```bash
curl -I http://localhost:8082
```

Expected Response:
```http
HTTP/1.1 200 OK
Server: nginx/1.24.0 (Ubuntu)
X-Powered-By: Express
Served-By: web-01
...
```

---

##  Nginx Server Configuration

On `web-01` & `web-02`, edit `/etc/nginx/sites-available/default`:
```nginx
server {
    listen 8080;
    server_name localhost;

    root /var/www/StepUpWorkouts_Plattform/Frontend;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api/ {
        proxy_pass http://localhost:8000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }

    error_page 404 /index.html;
}
```

Test & Reload:
```bash
sudo nginx -t
sudo nginx -s reload
```

---

##  Demo

Experience the platform in action:  
**YouTube:** [StepUpWorkouts Demo](https://youtu.be/LuVybblLBN0)

---

##  APIs Used

### 1. ExerciseDB API
- Over 1300 exercises categorized by body part, equipment, and target muscle.
- Ideal for building personalized workout flows.
- API Docs: [https://exercisedb.io](https://exercisedb.io)

### 2. AI Workout Planner API
- Generates custom workout plans based on user goals.
- Uses AI to optimize training efficiency.
- API Docs: [https://rapidapi.com/ajith/api/ai-workout-planner](https://rapidapi.com/ajith/api/ai-workout-planner)

##  Credits

This project was made possible thanks to the incredible work of these API creators:

###  ExerciseDB API  
Created by the team at [ExerciseDB.io](https://exercisedb.io), this comprehensive fitness database enabled over 1300 exercises to be integrated with precision and ease.  
> _Big shoutout to the developers for their commitment to accessible fitness data and clean documentation._

###  AI Workout Planner API  
Provided by [Ajith on RapidAPI](https://rapidapi.com/ajith/api/ai-workout-planner), this intelligent API added a personalized touch to training plans, making fitness journeys smarter and goal-focused.  
> _Huge thanks to Ajith for blending artificial intelligence with human wellness so seamlessly._


##  Challenges & Lessons Learned

| Challenge              | Resolution                                                                 |
|------------------------|----------------------------------------------------------------------------|
| API Limitations        | Switched to generous APIs with solid docs                                  |
| Misaligned Endpoints   | Refactored to match real data structure                                     |
| Container Visibility   | Solved backend access via Docker networking & port mappings                |
| Load Balancing Setup   | Configured Nginx and HAProxy for efficient request routing                 |

---

##  Final Thoughts

This project is more than just code—it’s a reflection of resilience, experimentation, and the drive to make fitness accessible and engaging. Every container deployed, every bug squashed... is a step forward in your dev journey.

---

##  Contact

- GitHub: [Janviere-dev](https://github.com/Janviere-dev)
- Email: j.munezero@student.com
- Instagram: https://www.instagram.com/__janviere/
