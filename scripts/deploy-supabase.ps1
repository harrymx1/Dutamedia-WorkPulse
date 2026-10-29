# =============================================================================
# WorkPulse - Script Otomasi Migrasi & Seeding Supabase Cloud (Tahap 2.1)
# =============================================================================
param (
    [string]$DirectUrl = $env:DIRECT_URL,
    [string]$DatabaseUrl = $env:DATABASE_URL
)

$ErrorActionPreference = "Stop"

Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "🚀 WorkPulse Supabase Cloud Provisioning (Tahap 2.1)" -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan

if (-not $DatabaseUrl) {
    Write-Error "Variabel DATABASE_URL (Supabase Transaction Pooler) belum diset!"
    exit 1
}

if (-not $DirectUrl) {
    Write-Host "⚠️ PERINGATAN: DIRECT_URL tidak diset. Menggunakan DATABASE_URL untuk migrasi." -ForegroundColor Yellow
    $DirectUrl = $DatabaseUrl
}

Write-Host "1. Mempersiapkan Lingkungan Koneksi Cloud..." -ForegroundColor Green
$env:DATABASE_URL = $DatabaseUrl
$env:DIRECT_URL = $DirectUrl

Write-Host "2. Menjalankan Migrasi Skema ke Supabase (npx prisma migrate deploy)..." -ForegroundColor Green
Set-Location -Path "$PSScriptRoot\..\backend"
npx prisma migrate deploy

if ($LASTEXITCODE -ne 0) {
    Write-Error "Migrasi skema database Supabase gagal!"
    exit 1
}

Write-Host "3. Menjalankan Master Seeder Idempoten (npx ts-node prisma/seed.ts)..." -ForegroundColor Green
npx ts-node prisma/seed.ts

if ($LASTEXITCODE -ne 0) {
    Write-Error "Database seeding gagal!"
    exit 1
}

Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "✅ TAHAP 2.1 BERHASIL: Database Supabase Siap Digunakan!" -ForegroundColor Green
Write-Host "============================================================" -ForegroundColor Cyan
