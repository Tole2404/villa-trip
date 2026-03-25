# Cara Mengakses Database

## 1. LocalStorage (Mode Offline - Versi Lama)

Jika masih pakai versi localStorage (belum deploy ke Vercel):

### Via Browser DevTools:
1. Buka website di browser
2. Tekan `F12` atau `Ctrl+Shift+I` (Inspect Element)
3. Pilih tab **Application** (Chrome) atau **Storage** (Firefox)
4. Di sidebar kiri, klik **Local Storage** → **http://localhost:3000**
5. Cari key: `villa-trip-members`
6. Klik untuk lihat data JSON

### Screenshot langkah:
```
F12 → Application → Local Storage → villa-trip-members
```

## 2. PostgreSQL (Mode Online - Vercel + Neon)

Setelah deploy ke Vercel dengan Neon Postgres:

### A. Via Neon Console (Web Interface)
1. Buka [neon.tech](https://neon.tech) → Login
2. Pilih project database kamu
3. Klik **SQL Editor**
4. Jalankan query contoh:

```sql
-- Lihat semua anggota
SELECT * FROM members;

-- Lihat semua pembayaran
SELECT * FROM payments;

-- Lihat statistik
SELECT * FROM member_stats;
```

### B. Via Terminal (psql)
```bash
# Install psql (jika belum ada)
# Windows: https://www.postgresql.org/download/windows/

# Connect ke database
psql "DATABASE_URL"

# Atau format lengkap:
psql -h host-name.neon.tech -U username -d database_name

# Setelah connect, jalankan query:
\dt              -- List tabel
SELECT * FROM members;
SELECT * FROM payments;
```

### C. Via Vercel Dashboard
1. Buka [vercel.com/dashboard](https://vercel.com/dashboard)
2. Pilih project
3. Tab **Storage** → Klik database
4. Buka **SQL Editor**

## 3. Backup & Export Data

### Export PostgreSQL:
```bash
pg_dump "DATABASE_URL" > backup.sql
```

### Import ke PostgreSQL:
```bash
psql "DATABASE_URL" < backup.sql
```

### Export LocalStorage:
```javascript
// Di console browser (F12 → Console)
localStorage.getItem('villa-trip-members')
// Copy hasil JSON, simpan sebagai file .json
```

## 4. Struktur Tabel

### Tabel `members`:
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | ID unik |
| name | varchar | Nama anggota |
| phone | varchar | Nomor HP |
| target_amount | integer | Target bayar |
| dp_amount | integer | Nominal DP |
| dp_paid | boolean | Status DP |
| created_at | timestamp | Tanggal daftar |

### Tabel `payments`:
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | ID unik |
| member_id | UUID | ID anggota |
| type | enum | dp/savings/full |
| amount | integer | Jumlah bayar |
| date | date | Tanggal bayar |
| note | text | Catatan |

## 5. Query Berguna

```sql
-- Total uang terkumpul
SELECT SUM(amount) FROM payments;

-- Anggota yang sudah lunas
SELECT * FROM member_stats WHERE status = 'completed';

-- Anggota yang belum DP
SELECT * FROM member_stats WHERE status = 'pending';

-- Pembayaran per anggota
SELECT 
  m.name, 
  p.type, 
  p.amount, 
  p.date 
FROM members m 
JOIN payments p ON m.id = p.member_id 
ORDER BY p.date DESC;
```
