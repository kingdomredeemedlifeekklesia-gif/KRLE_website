Param()

Write-Host "This script will interactively create a .env.local file in the project root." -ForegroundColor Cyan
$envPath = Join-Path -Path (Get-Location) -ChildPath '.env.local'
if (Test-Path $envPath) {
  $ok = Read-Host ".env.local already exists. Overwrite? (y/N)"
  if ($ok -ne 'y' -and $ok -ne 'Y') { Write-Host 'Aborting.'; exit 0 }
}

function prompt($name, $example) {
  $val = Read-Host "$name (example: $example)"
  return $val
}

$pairs = @()
$pairs += @{ k = 'DATABASE_URL'; v = prompt 'DATABASE_URL' 'postgresql://postgres:password@db.project.supabase.co:5432/postgres?sslmode=require' }
$pairs += @{ k = 'NEXT_PUBLIC_SUPABASE_URL'; v = prompt 'NEXT_PUBLIC_SUPABASE_URL' 'https://project.supabase.co' }
$pairs += @{ k = 'SUPABASE_SERVICE_ROLE_KEY'; v = prompt 'SUPABASE_SERVICE_ROLE_KEY' 'service_role_key' }
$pairs += @{ k = 'NEXT_PUBLIC_YOUTUBE_API_KEY'; v = prompt 'NEXT_PUBLIC_YOUTUBE_API_KEY' 'AIzaSy...' }
$pairs += @{ k = 'NEXT_PUBLIC_YOUTUBE_CHANNEL_ID'; v = prompt 'NEXT_PUBLIC_YOUTUBE_CHANNEL_ID' 'UCxxxx' }
$pairs += @{ k = 'NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY'; v = prompt 'NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY' 'pk_live_...' }
$pairs += @{ k = 'PAYSTACK_SECRET_KEY'; v = prompt 'PAYSTACK_SECRET_KEY' 'sk_live_...' }
$pairs += @{ k = 'NEXT_PUBLIC_ADMIN_PASSWORD'; v = prompt 'NEXT_PUBLIC_ADMIN_PASSWORD' 'admin_password' }
$pairs += @{ k = 'NEXT_PUBLIC_FACEBOOK_URL'; v = prompt 'NEXT_PUBLIC_FACEBOOK_URL' 'https://facebook.com/your-church' }
$pairs += @{ k = 'NEXT_PUBLIC_X_URL'; v = prompt 'NEXT_PUBLIC_X_URL' 'https://x.com/your-church' }
$pairs += @{ k = 'NEXT_PUBLIC_YOUTUBE_URL'; v = prompt 'NEXT_PUBLIC_YOUTUBE_URL' 'https://youtube.com/@your-church' }
$pairs += @{ k = 'NEXT_PUBLIC_LINKEDIN_URL'; v = prompt 'NEXT_PUBLIC_LINKEDIN_URL' 'https://linkedin.com/company/your-church' }
$pairs += @{ k = 'NEXT_PUBLIC_INSTAGRAM_URL'; v = prompt 'NEXT_PUBLIC_INSTAGRAM_URL' 'https://instagram.com/your-church' }
$pairs += @{ k = 'NEXT_PUBLIC_TIKTOK_URL'; v = prompt 'NEXT_PUBLIC_TIKTOK_URL' 'https://tiktok.com/@your-church' }
$pairs += @{ k = 'NODE_ENV'; v = 'development' }

# Write file
$content = $pairs | ForEach-Object { "$($_.k)=$($_.v)`n" } | Out-String
Set-Content -Path $envPath -Value $content -Encoding UTF8
Write-Host "Created .env.local at $envPath" -ForegroundColor Green
