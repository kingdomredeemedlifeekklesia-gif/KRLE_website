## Secure environment variable setup

Never commit real secrets into the repository. Use the scripts in `scripts/` to create a local `.env.local` file.

PowerShell (Windows):

```powershell
pwsh ./scripts/create-env-local.ps1
```

Bash (macOS/Linux/Git Bash):

```bash
bash ./scripts/create-env-local.sh
```

After creating `.env.local`, open it and fill in the secret values. `.env.local` is ignored by git (see `.gitignore`).

If you deploy to Railway, add the same environment variables in the Railway project settings; do NOT store secrets in the repo.
