#!/usr/bin/env bash
set -euo pipefail
echo "This script will interactively create a .env.local file in the project root."
ENV_PATH="$(pwd)/.env.local"
if [ -f "$ENV_PATH" ]; then
  read -p ".env.local already exists. Overwrite? (y/N) " ok
  if [ "$ok" != "y" ] && [ "$ok" != "Y" ]; then
    echo "Aborting." && exit 0
  fi
fi

prompt() {
  local name="$1"; local example="$2"
  read -p "$name (example: $example): " val
  echo "$val"
}

cat > "$ENV_PATH" <<'ENV'
DATABASE_URL=
NEXT_PUBLIC_SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_YOUTUBE_API_KEY=
NEXT_PUBLIC_YOUTUBE_CHANNEL_ID=
NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=
PAYSTACK_SECRET_KEY=
NEXT_PUBLIC_ADMIN_PASSWORD=
NEXT_PUBLIC_FACEBOOK_URL=
NEXT_PUBLIC_X_URL=
NEXT_PUBLIC_YOUTUBE_URL=
NEXT_PUBLIC_LINKEDIN_URL=
NEXT_PUBLIC_INSTAGRAM_URL=
NEXT_PUBLIC_TIKTOK_URL=
NODE_ENV=development
ENV

echo ".env.local created at $ENV_PATH. Edit it and fill in your secrets."
