COMPOSE=docker compose

help:
	@echo "Usage:"
	@echo "  make install         - Install both Backend & Frontend dependencies natively"
	@echo "  make dev             - Run EVERYTHING (DB in Docker, Apps natively) in one terminal"
	@echo "  make dev-frontend    - Run Vite frontend natively (Host machine)"
	@echo "  make dev-backend     - Run FastAPI backend natively (Host machine)"
	@echo "  make up-db           - Start only the PostgreSQL database in Docker"
	@echo "  make build           - Build all Docker images"
	@echo "  make up              - Start all services (API, DB, Frontend) in Docker"
	@echo "  make down            - Stop and remove all Docker containers"
	@echo "  make logs            - Follow the logs of the containers"

install:
	pip install -r requirements.txt
	cd frontend && npm install

dev: up-db
	@echo "Starting Backend and Frontend in parallel..."
	@echo "Press Ctrl+C to stop both."
	@ (trap 'kill 0' SIGINT; make dev-backend & make dev-frontend & wait)

dev-frontend:
	cd frontend && npm run dev

dev-backend:
	python3 -m uvicorn api.main:app --reload --host 0.0.0.0 --port 8000

up-db:
	$(COMPOSE) up -d db

build:
	$(COMPOSE) build

up:
	$(COMPOSE) up -d

down:
	$(COMPOSE) down

logs:
	$(COMPOSE) logs -f

.PHONY: install dev-frontend dev-backend up-db build up down logs help