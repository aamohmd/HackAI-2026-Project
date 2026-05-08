# Frontend Integration Plan: Vite + React + Tailwind

## Objective
Integrate a modern, fast frontend (Vite + React + Tailwind CSS) into the existing Docker Compose infrastructure alongside the FastAPI backend.

## Key Files & Context
- `frontend/` (New directory for the React application)
- `frontend/Dockerfile` (New Dockerfile for the frontend development server)
- `docker-compose.yaml` (Update to include the new frontend service)
- `Makefile` (No changes strictly required, but `make build` and `make up` will now include the frontend)
- `frontend/vite.config.ts` (Configure proxying to the backend)

## Implementation Steps

### 1. Scaffold the Frontend
- Create a new directory named `frontend/` inside the project root.
- Initialize a new Vite project using the React + TypeScript template.
- Install necessary dependencies including `tailwindcss`, `postcss`, `autoprefixer`, `react-router-dom`, and `axios`.

### 2. Configure Tailwind CSS
- Initialize Tailwind configuration (`tailwind.config.js`).
- Update `tailwind.config.js` to scan for classes in the `src/` directory.
- Replace the contents of `src/index.css` with the Tailwind directives (`@tailwind base; @tailwind components; @tailwind utilities;`).

### 3. Dockerize the Frontend
- Create a `frontend/Dockerfile.dev` specifically for local development to leverage Vite's hot-module replacement (HMR).
- The Dockerfile will use a Node.js image, install dependencies, and run the Vite dev server.

### 4. Update Docker Compose
- Add a `frontend` service to `docker-compose.yaml`.
- Map port `5173` (Vite's default) to the host.
- Set up a volume mount (`- ./frontend:/app`) so local code changes trigger HMR without rebuilding the container.
- Ensure the `frontend` service depends on the `api` service.

### 5. Configure API Proxying
- Update `frontend/vite.config.ts` to include `server: { host: true, port: 5173 }` so it is accessible outside the container.
- Configure a proxy in `vite.config.ts` so that requests to `/api` are automatically forwarded to `http://api:8000`. This prevents CORS issues during development.

## Verification & Testing
- Run `make down` followed by `make up --build` to start all services.
- Verify the FastAPI backend is running at `http://localhost:8000/health`.
- Verify the React frontend is running and accessible at `http://localhost:5173`.
- (Optional) Create a quick test fetch on the frontend to ensure the `/api` proxy successfully routes to the backend's `/health` endpoint.