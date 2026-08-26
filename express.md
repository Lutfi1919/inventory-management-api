## express application
```
express application : framework node.js untuk membuat API setahu saya
```

## Request dan Response
```
simple nya :
Requset : input, contoh (req.params, req.body, req.query)
Response : output, contoh (res.status)
```

## Router
```
untuk membagi dan merapikan URL
```

## Middleware
```
fungsi yang dijalanin di tengah' proses sebelum request sampe ke tujuan akhirnya, biasanya untuk memeriksa autentikasi
```

## Route parameter
```
req.params : bagian dari URL dan bersifat dinamis dan wajib diisi, untuk mencari satu data spesifik berdasarkan ID
```

## Query parameter
```
req.query : tambahan data diakhir URL setelah tanda tanya "?", biasanya dipake untuk sorting, searching, dll
```

## Request body
```
req.body : data yang dikirim didalam body dari HTTP request, biasanya pake method POST, PUT atau PATCH
```

## HTTP Status code
```
kode berupa angka 3 digit yang dikirim dari server untuk client
200 : berhasil mengambil data
201 : berhasil membuat data
400 : error validate
401 : unauthorized
404 : not found
500 : error di server/kodingan
```

## Flow express
Client
  ↓
HTTP Request
  ↓
Express
  ↓
Middleware
  ↓
Router
  ↓
Controller
  ↓
Response

**client** : dapat berupa browser/aplikasi, misalnya postman. Yang dapat melakukan request
**HTTP Request** : client ngirim HTTP Request, contohnya GET /users, request punya beberapa bagian seperti:
* Method : GET, POST, dll
- URL : /users
+ Headers : Authorization: Bearer ....
* Body : data yang dikirim
**express** : sebagai framework yang menerima dan mengatur HTTP request tsb
**middlewarw** : fungsi yang dijalanin di tengah' proses sebelum request sampe ke tujuan akhirnya, biasanya untuk ngecek auth
**router** : untuk menentukan request tsb mau diarahkan ke fungsi mana
**controller** : tempat menangani logic dari request tsb
**response** : setelah controller selesai, server ngirim HTTP response ke client