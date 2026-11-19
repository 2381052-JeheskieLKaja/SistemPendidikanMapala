import axios from 'axios'

export const TOKEN_KEY = 'mapala_token'
export const USER_KEY = 'mapala_user'

const api = axios.create({ baseURL: import.meta.env.VITE_API_URL || '/api' })

api.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY)
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// 401 (token tidak ada/kedaluwarsa) → hapus sesi dan kembali ke /login.
api.interceptors.response.use(
  (res) => res,
  (err) => {
    const isLogin = err.config?.url?.includes('/auth/login')
    if (err.response?.status === 401 && !isLogin) {
      localStorage.removeItem(TOKEN_KEY)
      localStorage.removeItem(USER_KEY)
      if (window.location.pathname !== '/login') window.location.assign('/login?sesi=habis')
    }
    return Promise.reject(err)
  },
)

/** Pesan error dari respons API { success:false, message }. */
export function errorMessage(err, fallback = 'Terjadi kesalahan, coba lagi') {
  if (!err?.response) return 'Tidak dapat terhubung ke server'
  return err.response.data?.message || fallback
}

/** Error per field dari respons validasi 400 → { field: pesan }. */
export const fieldErrors = (err) => err?.response?.data?.errors || {}

export default api
