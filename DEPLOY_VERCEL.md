# Alur Deploy ke Vercel

## Prerequisites
- Akun GitHub (untuk push code)
- Akun Vercel (bisa login pakai GitHub)

---

## Step 1: Push ke GitHub

```bash
# Inisialisasi git (kalau belum)
git init

# Tambah semua file
git add .

# Commit
git commit -m "Ready for deploy: Prisma + Neon + Image Upload"

# Create repo di GitHub, lalu:
git remote add origin https://github.com/username/villa-trip.git
git branch -M main
git push -u origin main
```

---

## Step 2: Setup Environment Variables

### Di Vercel Dashboard:
1. Buka [vercel.com](https://vercel.com) → Login
2. Click **"Add New..."** → **"Project"**
3. Import GitHub repo `villa-trip`
4. Click **"Environment Variables"**

### Tambahkan 2 env var:

| Variable | Value | Dapat dari |
|----------|-------|------------|
| `DATABASE_URL` | `postgresql://neondb_owner:xxx@ep-xxx.neon.tech/neondb?sslmode=require` | Neon Console |
| `BLOB_READ_WRITE_TOKEN` | `vercel_blob_rw_xxx` | Vercel Storage |

---

## Step 3: Setup Vercel Blob (Untuk Gambar)

### Cara 1: Via Vercel Dashboard (Rekomendasi)
1. Di project Vercel, tab **"Storage"**
2. Click **"Connect Store"** → **"Blob"**
3. Vercel auto-create & set `BLOB_READ_WRITE_TOKEN`

### Cara 2: Via CLI
```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Tambah env var
vercel env add BLOB_READ_WRITE_TOKEN
vercel env add DATABASE_URL
```

---

## Step 4: Deploy

### Cara 1: Git Push (Auto Deploy)
```bash
# Push ke GitHub → Vercel auto-deploy
git push origin main
```

### Cara 2: Vercel CLI
```bash
vercel --prod
```

### Cara 3: GitHub Integration
1. Connect GitHub repo ke Vercel
2. Setiap push ke `main` akan auto-deploy

---

## Step 5: Database Migration

Setelah deploy pertama:

```bash
# Jalankan migration di production database
npx prisma migrate deploy

# Atau kalau pakai db push:
npx prisma db push
```

---

## Post-Deploy Checklist

- [ ] Website buka tanpa error
- [ ] Bisa tambah anggota
- [ ] Bisa tambah pembayaran dengan gambar
- [ ] Gambar tampil di riwayat
- [ ] Database persist (tidak hilang)

---

## Troubleshooting Deploy

### Error: "DATABASE_URL not found"
→ Pastikan env var sudah di-set di Vercel Dashboard

### Error: "Can't reach database server"
→ Cek connection string Neon, pastikan SSL mode `require`

### Error: "BLOB_READ_WRITE_TOKEN missing"
→ Setup Vercel Blob storage atau ganti ke link eksternal saja

### Error: "Prisma Client not found"
→ Tambah postinstall script di `package.json`:
```json
{
  "scripts": {
    "postinstall": "prisma generate"
  }
}
```

---

## Domain Custom (Opsional)

1. Vercel Dashboard → Project → **"Settings"** → **"Domains"**
2. Masukkan domain (misal: `villa-trip.vercel.app` atau custom domain)
3. Follow instruksi setup DNS

---

## Ringkasan Command

```bash
# 1. Push ke GitHub
git add .
git commit -m "Deploy ready"
git push origin main

# 2. Deploy via CLI (alternatif)
vercel --prod

# 3. Check status
vercel --version
```

**Deploy berhasil!** 🚀 Website live di URL vercel.app kamu.
