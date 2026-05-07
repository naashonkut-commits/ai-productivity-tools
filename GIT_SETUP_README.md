# Git Remote / Push Setup (Quick Commands)

Use this if the repository is not yet configured with the correct `origin` remote.

## 1) Add the remote origin
```bash
git remote add origin https://github.com/naashonkut-commits/ai-productivity-tools.git
```

## 2) Rename the current branch to `main`
If you are currently on a different branch name (e.g., `master` or `develop`):
```bash
git branch -M main
```

## 3) Push and set upstream tracking
```bash
git push -u origin main
```

## Verify remotes
```bash
git remote -v
```

## Note
If `origin` already exists, run:
```bash
git remote set-url origin https://github.com/naashonkut-commits/ai-productivity-tools.git
```

