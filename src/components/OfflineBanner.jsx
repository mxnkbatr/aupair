import { useEffect, useState } from 'react'
import './OfflineBanner.css'

export default function OfflineBanner() {
  const [online, setOnline] = useState(() => navigator.onLine)
  const [backOnline, setBackOnline] = useState(false)

  useEffect(() => {
    let timer
    const goOnline = () => {
      setOnline(true)
      setBackOnline(true)
      clearTimeout(timer)
      timer = setTimeout(() => setBackOnline(false), 2500)
    }
    const goOffline = () => {
      setOnline(false)
      setBackOnline(false)
    }
    window.addEventListener('online', goOnline)
    window.addEventListener('offline', goOffline)
    return () => {
      clearTimeout(timer)
      window.removeEventListener('online', goOnline)
      window.removeEventListener('offline', goOffline)
    }
  }, [])

  if (online && !backOnline) return null

  return (
    <div className={`offline-banner${online ? ' is-online' : ''}`} role="status">
      {online ? 'Интернэт сэргэлээ' : 'Интернэт холболт алга · хадгалсан мэдээлэл харагдаж байна'}
    </div>
  )
}
