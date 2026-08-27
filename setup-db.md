## download dependencies yang duperlukan
```
npm install typeorm reflect-metadata pg
npm install @types/pg
npm install dotenv : buat ngebaca file .env
```

## setup file .env
```
ngatur konfigurasi untuk koneksi ke database
```

## create file data-source.ts di folder src
```
hampir mirip sama file .env tadi untuk info konfigurasi koneksi ke db, plus entities dan migrationsnya
```

## setup entities
```
membuat entity sesuai dengan requirement (insyaallah),
kemudian ngedaftarin entity di file data-source.ts
```

## setup scripts untuk generate migrations di package.json
```
script untu men-generate migration secara otomatis
```

## jalankan migration
```
npm run typeorm -- migration:run
```