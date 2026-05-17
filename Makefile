PYTHON=python3
PIP=$(PYTHON) -m pip

help:
	@echo "Mizan - AI Legal Assistant"
	@echo "Usage:"
	@echo "  make setup           - Install all dependencies (Backend & Mobile)"
	@echo "  make dev             - Run Backend and Mobile app concurrently"
	@echo "  make backend         - Run only Backend (FastAPI)"
	@echo "  make mobile          - Run only Mobile (Expo)"
	@echo "  make clean           - Cleanup __pycache__ and local DB"

setup:
	@echo "Installing Backend dependencies..."
	$(PIP) install -r requirements.txt
	@echo "Installing Mobile dependencies..."
	cd mobile && npm install

dev:
	@echo "Starting Backend and Mobile..."
	@echo "Note: Press Ctrl+C to stop. If processes persist, use 'make clean-ports'"
	($(PYTHON) -m backend.main & cd mobile && npx expo start)

backend:
	$(PYTHON) -m backend.main

mobile:
	cd mobile && npx expo start

clean:
	@echo "Cleaning up local artifacts..."
	find . -type d -name "__pycache__" -exec rm -rf {} +
	rm -f mizan.db
	@echo "Cleanup complete."

clean-ports:
	@echo "Killing processes on ports 8000, 8081, 8080..."
	lsof -i :8000,8081,8080 -t | xargs kill -9 || true
	@echo "Done."

clear:
	@echo "Clearing Metro cache..."
	cd mobile && npx expo start --clear

.PHONY: dev setup backend mobile clean clean-ports help
