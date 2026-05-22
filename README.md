### Sign Up

| Item | Value |
| --- | --- |
| Frontend route | `/sign-up` |
| Method | `POST` |
| Endpoint | `/auth/local/signup` |
| Full URL | `http://localhost:3000/api/auth/local/signup` |

Payload:

```json
{
  "name": "User Name",
  "phoneNumber": "081234567890",
  "email": "user@example.com",
  "password": "password123"
}
```

Kode endpoint:

```js
signup: (data) => api.post("/auth/local/signup", data)
```

Dipakai oleh:

```txt
src/pages/auth/Signup.jsx
```

### Sign In

| Item | Value |
| --- | --- |
| Frontend route | `/sign-in` |
| Method | `POST` |
| Endpoint | `/auth/local/signin` |
| Full URL | `http://localhost:3000/api/auth/local/signin` |

Payload:

```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

Kode endpoint:

```js
signin: (data) => api.post("/auth/local/signin", data)
```

Dipakai oleh:

```txt
src/pages/auth/Signin.jsx
```

### Get Current User

| Item | Value |
| --- | --- |
| Method | `GET` |
| Endpoint | `/auth/user/me` |
| Full URL | `http://localhost:3000/api/auth/user/me` |

Endpoint ini dipanggil setelah sign in/sign up berhasil untuk mengambil data user aktif.

Response minimal yang dibutuhkan frontend:

```json
{
  "id": 1,
  "name": "User Name",
  "email": "user@example.com",
  "role": "user"
}
```

Untuk membuka halaman `/admin`, user harus memiliki:

```json
{
  "role": "admin"
}
```

Kode endpoint:

```js
me: () => api.get("/auth/user/me")
```

### Logout

| Item | Value |
| --- | --- |
| Method | `DELETE` |
| Endpoint | `/auth/remove-session` |
| Full URL | `http://localhost:3000/api/auth/remove-session` |

Kode endpoint:

```js
logout: () => api.delete("/auth/remove-session")
```

### Refresh Token

| Item | Value |
| --- | --- |
| Method | `POST` |
| Endpoint | `/auth/refresh-token` |
| Full URL | `http://localhost:3000/api/auth/refresh-token` |

Endpoint ini dipanggil otomatis oleh Axios interceptor ketika response API bernilai `401`.

## Todo Endpoints

File utama:

```txt
src/features/todos/todoApi.js
src/axios/axios.js
```

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

