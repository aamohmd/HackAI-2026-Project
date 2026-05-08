# Git Workflow & Standards for HackAI 2026

To maintain speed and clarity during the hackathon, we will follow a simplified **Feature Branch Workflow**.

## 1. Branching Strategy

*   **`main`**: The "Production" branch. Code here must always be stable and deployable.
*   **`dev`**: The "Integration" branch. All features are merged here first for testing.
*   **Feature Branches (`feat/`, `fix/`, `docs/`)**: 
    *   Create a new branch for every discrete task.
    *   Naming convention: `category/short-description` (e.g., `feat/auth-backend`, `feat/login-ui`, `fix/db-connection`).

## 2. Commit Message Standard (Conventional Commits)

We will use a simplified version of [Conventional Commits](https://www.conventionalcommits.org/). This makes the history searchable and easy to read.

**Format:** `<type>: <description>`

*   **`feat`**: A new feature (e.g., `feat: add jwt token generation`)
*   **`fix`**: A bug fix (e.g., `fix: resolve cors error on login`)
*   **`docs`**: Documentation only (e.g., `docs: update setup instructions`)
*   **`refactor`**: Code change that neither fixes a bug nor adds a feature
*   **`chore`**: Updating dependencies, config files, etc. (e.g., `chore: update docker-compose for frontend`)

## 3. The "Homework" Phase Protocol

Since we are working on "homework" before the hackathon starts:
1.  Work in a branch called `feat/homework-base`.
2.  Once all boilerplate (Auth + DB + Frontend Scaffolding) is complete, merge it into `main`.
3.  When the hackathon officially starts, `main` will be our clean "Day 0" starting point.

## 4. Workflow Example

```bash
# 1. Start a new task
git checkout -b feat/frontend-scaffold

# 2. Work and commit (often!)
git add .
git commit -m "feat: initialize vite project with tailwind"

# 3. Pull latest changes from dev to avoid conflicts
git checkout dev
git pull origin dev
git checkout feat/frontend-scaffold
git merge dev

# 4. Finalize and Merge
# (In a team, this is where you'd open a Pull Request)
git checkout dev
git merge feat/frontend-scaffold
```

## 5. Golden Rules for the Hackathon
1.  **Never commit to `main` directly.**
2.  **Commit small, commit often.** It's easier to revert a 10-line commit than a 500-line one.
3.  **Sync frequently.** Pull from the base branch (`dev` or `main`) at least every hour to avoid "Merge Hell" at 4 AM.
