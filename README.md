# AI Incident Command Center

AI Incident Command Center is a full-stack incident management and investigation platform. It combines a React dashboard, Spring Boot REST API, MySQL persistence, and a Python AI agent service powered by Google Gemini, LangGraph, and MCP.

The platform helps teams create and manage production incidents, analyze incidents with AI, investigate service health and logs, collect evidence, require human approval, and review investigation history and audit logs.

## Features

- User registration and JWT-based authentication
- Protected incident management dashboard
- Create, view, and delete production incidents
- Incident status and severity tracking
- Quick AI-powered incident analysis
- Full agentic incident investigation
- Human approval workflow before evidence collection
- Service health checks
- Service log retrieval
- Investigation evidence collection
- Investigation history with full response details
- Investigation audit timeline
- MCP tools for incident details, service health, and service logs
- Responsive React interface
- Persistent data storage with MySQL

## Architecture

```text
┌──────────────────────┐
│   React Frontend     │
│   Vite + React       │
│   localhost:5173     │
└──────────┬───────────┘
           │
           ├─────────────────────────────┐
           │                             │
           ▼                             ▼
┌──────────────────────┐       ┌──────────────────────┐
│ Spring Boot Backend  │       │ Python AI Agent      │
│ REST API             │◄──────│ FastAPI + LangGraph  │
│ localhost:8081       │       │ localhost:8000       │
└──────────┬───────────┘       └──────────┬───────────┘
           │                              │
           ▼                              ▼
┌──────────────────────┐       ┌──────────────────────┐
│ MySQL Database       │       │ MCP Server           │
│                      │       │ localhost:8001       │
└──────────────────────┘       └──────────────────────┘
```

## Technology Stack

### Frontend

- React
- React Router
- Vite
- Tailwind CSS
- Axios
- ESLint

### Backend

- Java 17
- Spring Boot 4.1.1
- Spring Web MVC
- Spring Data JPA
- Spring Security
- JSON Web Tokens
- MySQL
- Lombok
- Spring AI Google Gemini integration

### AI Agent Service

- Python
- FastAPI
- Uvicorn
- LangGraph
- LangChain Google Generative AI
- Model Context Protocol
- HTTPX
- Pydantic
- python-dotenv

## Project Structure

```text
incident-command-center/
├── ai-agent-service/
│   ├── app/
│   │   ├── agents/
│   │   │   ├── basic_graph.py
│   │   │   └── incident_graph.py
│   │   ├── mcp/
│   │   │   ├── client_test.py
│   │   │   ├── mcp_client.py
│   │   │   └── server.py
│   │   ├── models/
│   │   ├── routes/
│   │   ├── services/
│   │   └── tools/
│   └── requirements.txt
│
├── backend/
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/
│   │   │   └── resources/
│   │   └── test/
│   ├── pom.xml
│   ├── mvnw
│   └── mvnw.cmd
│
└── frontend/
    ├── public/
    ├── src/
    │   ├── components/
    │   ├── context/
    │   ├── pages/
    │   ├── services/
    │   ├── App.jsx
    │   └── main.jsx
    ├── package.json
    └── vite.config.js
```

## Prerequisites

Install the following before running the application:

- Java 17 or newer
- Maven, or use the included Maven Wrapper
- Node.js and npm
- Python 3.10 or newer
- MySQL 8 or compatible MySQL server
- A Google Gemini API key

## Environment Variables

### Backend

The backend reads these variables from the environment:

```env
DB_URL=jdbc:mysql://localhost:3306/incident_command_center
DB_USERNAME=root
DB_PASSWORD=your_mysql_password
JWT_SECRET=your_long_secure_jwt_secret
JWT_EXPIRATION=86400000
GOOGLE_API_KEY=your_google_gemini_api_key
PORT=8081
```

The backend uses the following defaults:

- `PORT`: `8081`
- `JWT_EXPIRATION`: `86400000`

Create the database before starting the backend:

```sql
CREATE DATABASE incident_command_center;
```

The application is configured with:

```properties
spring.jpa.hibernate.ddl-auto=update
```

This allows Hibernate to update the database schema based on the entity definitions.

### AI Agent Service

Create a `.env` file inside `ai-agent-service`:

```env
GOOGLE_API_KEY=your_google_gemini_api_key
SPRING_BOOT_BASE_URL=http://localhost:8081
MCP_SERVER_URL=http://127.0.0.1:8001/mcp
```

The AI service defaults to:

```text
Spring Boot backend: http://localhost:8081
MCP server:          http://127.0.0.1:8001/mcp
AI service:          http://localhost:8000
```

### Frontend

The frontend currently uses these backend URLs:

```text
Spring Boot API: http://localhost:8081
AI Agent API:    http://localhost:8000
```

These URLs are configured in:

```text
frontend/src/services/api.js
frontend/src/services/agentService.js
```

## Running the Application

Run each service in a separate terminal.

### 1. Start MySQL

Make sure MySQL is running and the database exists:

```sql
CREATE DATABASE incident_command_center;
```

### 2. Start the Spring Boot Backend

Windows:

```powershell
cd backend
.\mvnw.cmd spring-boot:run
```

Or, if Maven is installed globally:

```powershell
cd backend
mvn spring-boot:run
```

The backend starts on:

```text
http://localhost:8081
```

### 3. Start the MCP Server

Open another terminal:

```powershell
cd ai-agent-service
python -m app.mcp.server
```

The MCP server starts on:

```text
http://127.0.0.1:8001/mcp
```

### 4. Start the AI Agent Service

Open another terminal:

```powershell
cd ai-agent-service
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

The AI agent service starts on:

```text
http://localhost:8000
```

Health check:

```text
http://localhost:8000/health
```

### 5. Start the Frontend

Open another terminal:

```powershell
cd frontend
npm install
npm run dev
```

The frontend starts on:

```text
http://localhost:5173
```

Open the application at:

```text
http://localhost:5173
```

## Authentication Flow

1. Register a user from the frontend.
2. Log in with the registered credentials.
3. The backend returns a JWT token.
4. The frontend stores the token in `localStorage`.
5. Axios automatically adds the token to authenticated requests.
6. Protected routes require a valid Bearer token.

Public backend endpoints:

```text
POST /api/auth/register
POST /api/auth/login
```

All other backend API endpoints require authentication.

## Backend API Endpoints

### Authentication

```text
POST /api/auth/register
POST /api/auth/login
```

### Incidents

```text
POST   /api/incidents
GET    /api/incidents
GET    /api/incidents/{id}
DELETE /api/incidents/{id}
```

### AI Analysis

```text
POST /api/ai/test
GET  /api/ai/analyze/{incidentId}
```

### Investigations

```text
POST /api/investigations/incident/{incidentId}
GET  /api/investigations/{investigationId}
GET  /api/investigations/incident/{incidentId}
PUT  /api/investigations/{investigationId}/complete
PUT  /api/investigations/{investigationId}/reject
```

### Investigation Evidence

```text
POST /api/investigations/{investigationId}/evidence
GET  /api/investigations/{investigationId}/evidence
```

### Audit Logs

```text
GET  /api/investigations/{investigationId}/audit-logs
POST /api/investigations/{investigationId}/audit-logs
```

### Service Health

```text
GET  /api/health/service/{serviceName}
POST /api/health/service
```

### Service Logs

```text
GET /api/logs/service/{serviceName}
```

## AI Agent Endpoints

The AI agent service exposes:

```text
POST /api/agent/test
GET  /api/agent/incident/{incidentId}
GET  /api/agent/checkpoint/{threadId}
POST /api/agent/resume/{threadId}
```

The investigation workflow can:

1. Receive an incident investigation request.
2. Retrieve incident details.
3. Check service health.
4. Retrieve service logs.
5. Ask the Gemini model to analyze gathered evidence.
6. Pause for human approval when required.
7. Resume or reject the investigation.
8. Return the final investigation response.

## MCP Tools

The MCP server exposes tools used by the AI agent:

```text
get_incident_details
check_service_health
get_service_logs
```

Each tool forwards the authenticated request to the Spring Boot backend.

## Frontend Routes

```text
/                  Root redirect
/login             Login page
/register          Registration page
/dashboard         Incident dashboard
/incidents         Incident list
/incidents/:id     Incident details
```

The dashboard and incident routes are protected and require authentication.

## Useful Commands

### Frontend

```powershell
cd frontend

npm install
npm run dev
npm run build
npm run lint
npm run preview
```

### Backend

```powershell
cd backend

.\mvnw.cmd spring-boot:run
.\mvnw.cmd test
.\mvnw.cmd package
```

### AI Agent Service

```powershell
cd ai-agent-service

.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
python -m app.mcp.server
```

## Troubleshooting

### Backend cannot connect to MySQL

Check that:

- MySQL is running.
- The database exists.
- `DB_URL` points to the correct database.
- `DB_USERNAME` and `DB_PASSWORD` are correct.

### Frontend cannot reach the backend

Check that the Spring Boot backend is running on:

```text
http://localhost:8081
```

Also verify that the frontend service URLs match the backend and AI service ports.

### AI investigation fails

Check that:

- The AI agent service is running on port `8000`.
- The MCP server is running on port `8001`.
- The Spring Boot backend is running on port `8081`.
- `GOOGLE_API_KEY` is configured.
- `SPRING_BOOT_BASE_URL` is correct.
- `MCP_SERVER_URL` is correct.
- The user is authenticated and the JWT token is valid.

### CORS errors

The backend and AI service are configured for the frontend origin:

```text
http://localhost:5173
```

If the frontend runs on another port, update the CORS configuration in the backend and AI service.

## Security Notes

- Do not commit `.env` files or API keys.
- Use a strong, random value for `JWT_SECRET`.
- Use a production database password in deployed environments.
- Replace local development URLs before deployment.
- Configure HTTPS for production deployments.
- Restrict CORS origins in production.
- Store secrets using a secure secret manager.

## Current Development Status

This project is configured primarily for local development. The frontend currently uses local backend URLs, and the backend expects environment variables for database, JWT, and Gemini configuration.

Before deploying to production, update:

- API base URLs
- CORS allowed origins
- Database configuration
- JWT secret management
- Gemini API key management
- Logging and monitoring
- Container or cloud deployment configuration

## License

Add your preferred license here, for example:

```text
MIT License
```
