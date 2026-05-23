# BloodConnect - Production

## 1. Safety First: Git & GitHub Security
The project includes a pre-configured `.gitignore` file that prevents uploading large build artifacts and sensitive credentials to GitHub. 

### Safely Excluded Files:
*   `frontend/.env` (Contains API keys and credentials)
*   `backend/src/main/resources/firebase-service-account.json` (Firebase Service Account Key)
*   `frontend/node_modules/` & `backend/target/` (Build and package dependencies)
*   `.idea/` & `.vscode/` (IDE configuration caches)

---

## 2. How to Upload the Full Code to GitHub

Follow these steps to upload your project to your GitHub account:

### Step 1: Create a Repository on GitHub
1. Go to [github.com](https://github.com) and log in.
2. Click **New** (or "+" in the top right corner) to create a new repository.
3. Set the Repository Name to `BloodConnect`.
4. **CRITICAL**: Do **NOT** check "Add a README file", "Add .gitignore", or "Choose a license" (leave them unchecked to avoid merge conflicts).
5. Click **Create repository**.
6. Copy the repository URL (e.g., `https://github.com/your-username/BloodConnect.git`).

### Step 2: Push the Code via Terminal / PowerShell
Open your terminal in your project root directory (`c:\Users\mohit\Favorites\Downloads\Blood Connect\Blood Connect`) and run these commands:

```bash
# 1. Initialize Git in the project
git init

# 2. Add all files to the staging area (Git will automatically ignore your ignored files)
git add .

# 3. Create your initial commit
git commit -m "Initial commit of BloodConnect System"

# 4. Rename the default branch to 'main'
git branch -M main

# 5. Link your local project to your GitHub repository
git remote add origin <YOUR_GITHUB_REPOSITORY_URL>

# 6. Push the code up to GitHub
git push -u origin main
```

---

## 3. Production Environment Variables & Setup

### A. Frontend Configuration (`frontend/.env`)
Create a `.env` file inside the `frontend` folder for production configuration:
```env
# Backend API Base URL
VITE_API_BASE_URL=https://api.bloodconnect.com

# Mapbox or Google Maps Geocoding API keys (if applicable)
VITE_MAP_API_KEY=your_production_map_api_key
```

### B. Backend Configuration (`backend/src/main/resources/application.yml`)
Configure these environment variables inside your production environment (or system environment variables) to override defaults safely:

| Environment Variable | Description | Production Value Example |
| :--- | :--- | :--- |
| `SPRING_DATASOURCE_URL` | PostgreSQL DB URL | `jdbc:postgresql://db.bloodconnect.com:5432/blooddonor` |
| `SPRING_DATASOURCE_USERNAME` | Database username | `db_admin` |
| `SPRING_DATASOURCE_PASSWORD` | Database password | `StrongSecurePassword123` |
| `JWT_SECRET` | 256-bit JWT Sign Key | `YourSuperSecretKeyMustBe256BitsLongAndHighlySecure!!` |
| `MAIL_USERNAME` | SMTP Email Sender Address | `alerts@bloodconnect.com` |
| `MAIL_PASSWORD` | SMTP App Password | `yoursmtpapppassword` |
| `TWILIO_ACCOUNT_SID` | Twilio SID (SMS Alert) | `ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx` |
| `TWILIO_AUTH_TOKEN` | Twilio token (SMS Alert) | `your_twilio_auth_token` |
| `TWILIO_FROM_NUMBER` | Twilio Sender Phone Number | `+1234567890` |

---

## 4. Production Deployment with Docker Compose

To deploy the entire stack to your production server (e.g., AWS EC2, DigitalOcean Droplet, Azure VM), follow these steps:

### Step 1: Install Docker & Compose on the Server
On your production Linux server, install Docker:
```bash
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
```

### Step 2: Configure `docker-compose.yml` for Production
Update the `docker-compose.yml` file to expose ports and map SSL certificates:

```yaml
version: '3.9'

services:
  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    container_name: bloodconnect-backend
    ports:
      - "8080:8080"
    environment:
      SPRING_DATASOURCE_URL: jdbc:postgresql://db.bloodconnect.com:5432/blooddonor
      SPRING_DATASOURCE_USERNAME: db_admin
      SPRING_DATASOURCE_PASSWORD: StrongSecurePassword123
      JWT_SECRET: ProductionSecretSigningKeyForJWTTokenSecurityHere!!
    restart: unless-stopped

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    container_name: bloodconnect-frontend
    ports:
      - "80:80"
      - "443:443"  # Add SSL for production
    depends_on:
      - backend
    restart: unless-stopped
```

### Step 3: Run the Production Build
Deploy the stack in detached background mode:
```bash
docker-compose up -d --build
```

---
