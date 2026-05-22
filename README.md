# Frontend API Requirements

Dokumen ini berisi daftar endpoint backend yang dibutuhkan oleh frontend.

## Base URL

Frontend membaca base URL dari file `.env`.

```env
VITE_API_URL=http://localhost:3000/api
VITE_SERVER_URL=http://localhost:3000/api
```

Catatan:

- Endpoint auth memakai `VITE_API_URL`.
- Endpoint todo memakai `VITE_SERVER_URL`.
- Jika memakai cookie/session, backend harus mengaktifkan CORS credentials.

Contoh CORS untuk development:

```txt
Access-Control-Allow-Origin: http://127.0.0.1:5174
Access-Control-Allow-Credentials: true
```

## Auth Endpoints

### Sign Up

```txt
POST /auth/local/signup
```

Full URL development:

```txt
POST http://localhost:3000/api/auth/local/signup
```

Payload dari frontend:

```json
{
  "name": "User Name",
  "phoneNumber": "081234567890",
  "email": "user@example.com",
  "password": "password123"
}
```

Dipakai oleh:

```txt
src/pages/auth/Signup.jsx
src/features/auth/authContext.jsx
src/features/auth/authApi.js
```

Letak kode endpoint:

```js
signup: (data) => api.post("/auth/local/signup", data)
```

### Sign In

```txt
POST /auth/local/signin
```

Full URL development:

```txt
POST http://localhost:3000/api/auth/local/signin
```

Payload dari frontend:

```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

Dipakai oleh:

```txt
src/pages/auth/Signin.jsx
src/features/auth/authContext.jsx
src/features/auth/authApi.js
```

Letak kode endpoint:

```js
signin: (data) => api.post("/auth/local/signin", data)
```

### Get Current User

```txt
GET /auth/user/me
```

Full URL development:

```txt
GET http://localhost:3000/api/auth/user/me
```

Endpoint ini dipanggil setelah sign in/sign up untuk mengambil data user aktif.

Response yang dibutuhkan frontend:

```json
{
  "id": 1,
  "name": "User Name",
  "email": "user@example.com",
  "role": "user"
}
```

Untuk admin page, frontend membutuhkan role:

```json
{
  "role": "admin"
}
```

Letak kode endpoint:

```js
me: () => api.get("/auth/user/me")
```

### Logout

```txt
DELETE /auth/remove-session
```

Full URL development:

```txt
DELETE http://localhost:3000/api/auth/remove-session
```

Dipakai saat user klik tombol logout.

Letak kode endpoint:

```js
logout: () => api.delete("/auth/remove-session")
```

### Refresh Token

```txt
POST /auth/refresh-token
```

Full URL development:

```txt
POST http://localhost:3000/api/auth/refresh-token
```

Endpoint ini dipakai otomatis oleh Axios interceptor saat response `401`, kecuali request logout dan refresh token itu sendiri.

## Todo Endpoints

Endpoint todo dipakai oleh modul:

```txt
src/features/todos/todoApi.js
src/axios/axios.js
```

Jika backend belum tersedia, sesuaikan endpoint berikut dengan file `todoApi.js`.

### Get Todos

```txt
GET /todos
```

### Create Todo

```txt
POST /todos
```

Payload:

```json
{
  "title": "Belajar React"
}
```

### Update Todo

```txt
PUT /todos/:id
```

Payload contoh:

```json
{
  "title": "Belajar React Router",
  "completed": true
}
```

### Delete Todo

```txt
DELETE /todos/:id
```

## Format Error

Frontend bisa membaca error dalam bentuk object:

```json
{
  "message": "Email atau password salah"
}
```

Atau array:

```json
[
  {
    "message": "Email tidak valid"
  },
  {
    "message": "Password minimal 6 karakter"
  }
]
```

## File Penting

```txt
.env
.env.example
src/features/auth/authApi.js
src/features/auth/authContext.jsx
src/pages/auth/Signin.jsx
src/pages/auth/Signup.jsx
src/axios/axios.js
src/features/todos/todoApi.js
```
