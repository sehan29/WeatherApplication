import { useCallback, useEffect, useMemo, useState } from 'react'
import { useAuth0 } from '@auth0/auth0-react'
import Header from './Header'

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5158'


export default function Dashboard() {
  const { getAccessTokenSilently } = useAuth0()
 
  return (
    <div className="app-shell">
      <Header />

    </div>
  )
}
