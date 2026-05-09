COMPOSE=docker compose

help:
	@echo "Usage:"
	@echo "  make dev             - Run in DEVELOPMENT mode (Hot-reloading, Vite dev server)"
	@echo "  make prod            - Run in PRODUCTION mode (Nginx, Minified build, No hot-reload)"
	@echo "  make build           - Build all Docker images"
	@echo "  make down            - Stop and remove all Docker containers"
	@echo "  make clean           - Full cleanup: Stop containers, remove volumes, and images"
	@echo "  make logs            - Follow the logs of the containers"

dev:
	$(COMPOSE) up --build

prod:
	docker compose -f docker-compose.yaml -f docker-compose.prod.yaml up --build -d

down:
	$(COMPOSE) down

clean:
	@echo "Cleaning up Docker resources..."
	$(COMPOSE) down -v --rmi all
	@echo "Cleaning up local artifacts..."
	rm -rf frontend/node_modules
	rm -rf frontend/dist
	find . -type d -name "__pycache__" -exec rm -rf {} +
	@echo "Cleanup complete."

logs:
	$(COMPOSE) logs -f

.PHONY: dev build up down clean logs help
