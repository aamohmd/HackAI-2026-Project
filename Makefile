COMPOSE=docker-compose

help:
	@echo "Usage:"
	@echo "  make build   - Build the Docker images"
	@echo "  make up      - Start the containers in detached mode"
	@echo "  make down    - Stop and remove the containers"
	@echo "  make logs    - Follow the logs of the containers"

build:
	$(COMPOSE) build

up:
	$(COMPOSE) up

down:
	$(COMPOSE) down

logs:
	$(COMPOSE) logs -f

.PHONY: build up down logs help