import { useCallback, useEffect, useState } from 'react'
import api, { errorMessage } from '../api/axios'

/**
 * GET data dari API (mengambil field `data` dari respons seragam). url = null → tidak fetch.
 * Mengembalikan { data, loading, error, reload }.
 */
export default function useFetch(url, initial = null) {
  const [version, setVersion] = useState(0)
  const [state, setState] = useState({ key: null, data: initial, error: '' })
  const key = url ? `${url}#${version}` : null

  useEffect(() => {
    if (!key) return undefined
    let active = true
    api
      .get(url)
      .then((res) => active && setState({ key, data: res.data.data, error: '' }))
      .catch((err) => active && setState((s) => ({ ...s, key, error: errorMessage(err) })))
    return () => {
      active = false
    }
  }, [key, url])

  const reload = useCallback(() => setVersion((v) => v + 1), [])
  const loading = Boolean(key) && state.key !== key
  return { data: state.data, loading, error: loading ? '' : state.error, reload }
}
