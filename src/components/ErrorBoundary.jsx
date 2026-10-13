import { Component } from 'react'

/** Catches render crashes so the native WebView does not go blank. */
export default class ErrorBoundary extends Component {
  state = { error: null }

  static getDerivedStateFromError(error) {
    return { error }
  }

  componentDidCatch(error, info) {
    console.error('App crash', error, info?.componentStack)
  }

  render() {
    if (!this.state.error) return this.props.children

    return (
      <div
        style={{
          minHeight: '100dvh',
          display: 'grid',
          placeContent: 'center',
          gap: 12,
          padding: '24px max(20px, env(safe-area-inset-right)) 24px max(20px, env(safe-area-inset-left))',
          textAlign: 'center',
          fontFamily: 'system-ui, sans-serif',
          background: '#f2f2f7',
          color: '#1c1c1e',
        }}
      >
        <strong style={{ fontSize: 20 }}>Алдаа гарлаа</strong>
        <p style={{ margin: 0, color: '#636366', lineHeight: 1.4 }}>
          Аппыг дахин ачааллаад үзнэ үү. Хэрэв үргэлжилбэл интернет холболтоо шалгана уу.
        </p>
        <button
          type="button"
          onClick={() => window.location.reload()}
          style={{
            marginTop: 8,
            justifySelf: 'center',
            padding: '12px 22px',
            border: 0,
            borderRadius: 999,
            background: '#cc2038',
            color: '#fff',
            fontWeight: 700,
            fontSize: 16,
          }}
        >
          Дахин ачаалах
        </button>
      </div>
    )
  }
}
