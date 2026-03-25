# Villa Trip Manager - Deployment Guide

## Setup Database Vercel Postgres (Neon)

### 1. Buat Database di Vercel
1. Buka [Vercel Dashboard](https://vercel.com/dashboard)
2. Pilih project atau buat baru
3. Go to **Storage** tab → **Create Database**
4. Pilih **Postgres** → **Neon**
5. Pilih region (rekomendasi: Singapore untuk Indonesia)
6. Copy **Connection String**

### 2. Setup Environment Variables

Tambahkan di Vercel Dashboard → Project Settings → Environment Variables:

```
DATABASE_URL=postgres://username:password@host/database?sslmode=require
```

### 3. Run Schema

Buka Neon Console atau gunakan Vercel Shell:

```bash
# Connect to database
psql "DATABASE_URL"

# Run schema
\i database/schema.sql
```

Atau copy-paste isi file `database/schema.sql` ke SQL Editor di Neon Console.

### 4. Deploy

```bash
# Install Vercel CLI (jika belum)
npm i -g vercel

# Login
vercel login

# Deploy
vercel --prod
```

## Fitur PostgreSQL vs LocalStorage

| Fitur | LocalStorage | PostgreSQL |
|-------|--------------|------------|
| Data Sharing | ❌ Per device | ✅ Semua user |
| Persistensi | ❌ Hapus cache = hilang | ✅ Permanent |
| Offline Mode | ✅ Bisa | ❌ Butuh internet |
| Multi User | ❌ Tidak | ✅ Bisa |

## Struktur Database

**Tabel `members`:**
- `id` (UUID, PK)
- `name` (varchar)
- `phone` (varchar)
- `target_amount` (integer)
- `dp_amount` (integer)
- `dp_paid` (boolean)
- `created_at` (timestamp)

**Tabel `payments`:**
- `id` (UUID, PK)
- `member_id` (UUID, FK)
- `type` (enum: dp/savings/full)
- `amount` (integer)
- `date` (date)
- `note` (text)
- `created_at` (timestamp)

## API Routes

- `GET /api/members` - List anggota
- `POST /api/members` - Tambah anggota
- `PUT /api/members/[id]` - Update anggota
- `DELETE /api/members/[id]` - Hapus anggota
- `GET /api/members/[memberId]/payments` - List pembayaran
- `POST /api/members/[memberId]/payments` - Tambah pembayaran
- `DELETE /api/members/[memberId]/payments` - Hapus pembayaran
- `GET /api/stats` - Statistik ringkasan

## Troubleshooting

**Error: DATABASE_URL not found**
- Pastikan env var sudah di-set di Vercel Dashboard

**Error: relation "members" does not exist**
- Schema belum di-run. Execute `database/schema.sql`

**Build Error**
- Pastikan `output: 'export'` sudah dihapus dari `next.config.ts`
