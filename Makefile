.PHONY: help build up down restart logs shell clean lint test dev prod

# Default target
help: ## Show this help message
	@echo 'Usage: make [target]'
	@echo ''
	@echo 'Available targets:'
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / {printf "  %-15s %s\n", $$1, $$2}' $(MAKEFILE_LIST)

# Docker commands
build: ## Build the Docker image
	docker build -t activity-manage .

up: ## Start the application in Docker
	docker compose up -d

down: ## Stop the application
	docker compose down

restart: ## Restart the application
	docker compose restart

logs: ## Show application logs
	docker compose logs -f

shell: ## Open a shell in the running container
	docker compose exec app sh

clean: ## Remove Docker containers and images
	docker compose down -v --rmi all
	docker system prune -f

# Development commands
dev: ## Run development server locally
	npm run dev

server: ## Run server locally
	npm run server

lint: ## Run linting
	npm run lint

build-local: ## Build the project locally
	npm run build

test: ## Run tests (if available)
	npm run test 2>/dev/null || echo "No tests configured"

# Production commands
prod: ## Build and run production Docker container
	docker build -t activity-manage . && \
	docker run -d --name activity-manage \
		-p 3000:3000 \
		--env-file .env \
		activity-manage

prod-stop: ## Stop production container
	docker stop activity-manage && docker rm activity-manage

# Utility commands
install: ## Install dependencies locally
	npm install

install-prod: ## Install only production dependencies
	npm ci --omit=dev

env-check: ## Check if .env file exists
	@test -f .env || echo "Warning: .env file not found. Please create one based on .env.example"

setup: env-check install ## Initial setup for the project
	@echo "Setup complete. Make sure to configure your .env file."

# Docker Compose shortcuts
dc-up: up
dc-down: down
dc-logs: logs
dc-shell: shell