# StepUpWorkouts_Plattform 

A beginner-friendly fitness platform designed to inspire transformation through personalized workouts, motivational design, and resilient infrastructure. Built with Node.js, Docker, Nginx, and HAProxy—deployed across mirrored containers for high availability.

---

##  Local Setup Instructions

Follow these steps to run the application locally:

### 1. Clone the Repository

```bash
git clone git@github.com:Janviere-dev/StepUpWorkouts_Plattform.git
Recommended: Use VS Code for easier navigation and Live Server support.

2. Start the Backend Server
Navigate to the backend folder and run the server:

bash
cd StepUpWorkouts_Plattform/Backend
node server.js
3. Install Node.js (if not installed)
Visit Node.js official site

Download and install the LTS version

After installation, verify with:

bash
node -v
npm -v
Then rerun:

bash
node server.js
4. Launch the Frontend
Open Frontend/index.html in VS Code and use the Live Server extension to preview the site.

 Deployment to Web Servers
This project uses the Web Infrastructure Lab to simulate a multi-server environment with Docker containers.

1. Set Up the Lab Environment
From a separate terminal:

bash
git clone https://github.com/waka-man/web_infra_lab.git
cd web_infra_lab
docker compose up -d --build
docker compose ps
You should see:

Container	IP Address	Ports
web-01	172.20.0.11	2211 (SSH), 8080
web-02	172.20.0.12	2212 (SSH), 8081
lb-01	172.20.0.10	2210 (SSH), 8082
2. SSH into Containers
bash
ssh ubuntu@localhost -p 2211  # web-01
ssh ubuntu@localhost -p 2212  # web-02
ssh ubuntu@localhost -p 2210  # lb-01
Password: pass123

3. Install Nginx on web-01 and web-02
bash
sudo apt update && sudo apt install -y nginx
Repeat on both containers.

4. Copy Website to Servers
From the host machine:

bash
scp -r StepUpWorkouts_Plattform ubuntu@localhost:/var/www -P 2211  # web-01
scp -r StepUpWorkouts_Plattform ubuntu@localhost:/var/www -P 2212  # web-02
Note: -P specifies the port. Adjust if needed.

 Dockerize the Backend
Inside StepUpWorkouts_Plattform, create a Dockerfile:

Dockerfile
FROM node:18-alpine
WORKDIR /app
COPY Backend ./Backend
COPY Frontend ./Frontend
RUN cd Backend && npm install
EXPOSE 8080
CMD ["node", "Backend/server.js"]
Build and run:

bash
docker build -t <dockerhub-username>/<app-name>:v1 .
docker run -p 8080:8080 <dockerhub-username>/<app-name>:v1
 Nginx Configuration (web-01 & web-02)
Edit /etc/nginx/sites-available/default:

nginx
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

    location = /favicon.ico {
        access_log off;
        log_not_found off;
    }

    error_page 404 /index.html;
}
Then:

bash
sudo nginx -t
sudo nginx -s reload
curl http://localhost:8080
Repeat on web-02.

 APIs Used
1. ExerciseDB API
Over 1,300 exercises categorized by body part, equipment, and target muscle.

Ideal for building personalized workout flows.

2. AI Workout Planner API
Generates custom workout plans based on user goals.

Uses AI to optimize training efficiency.

 Credits to the API developers for providing powerful tools that made this platform possible.

 Challenges & Lessons Learned
API Limitations Initially used an API with limited requests. Switched to one with higher quota and better documentation.

Misaligned Endpoints Misread API docs and had to redesign parts of the project to match actual data structure.

Deployment Struggles Faced issues with backend visibility across containers. Solved by containerizing the backend and serving it via Docker Hub.

Traffic Routing Requests weren’t reaching web-01/web-02. Learned to configure Nginx and HAProxy properly for load balancing.

 Final Thoughts
This project is more than just code—it's a journey of resilience, learning, and empowerment. Every bug fixed and every container deployed is a step toward making fitness accessible and inspiring for all.

 Contact
For questions, feedback, or collaboration ideas, feel free to reach out via GitHub or j.munezero@student.com


---

Let me know if you'd like help writing a motivational commit message or turning this into a downloadable PDF for submission. You crushed this, Munezero 💪🔥
