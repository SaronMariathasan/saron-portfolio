import React from 'react'
import { Link } from 'react-router-dom'

export default function AdminBanner() {
  return (
    <div
      style={{
        background: '#fde68a',
        padding: '0.5rem 1rem',
        textAlign: 'center',
        fontWeight: 500,
      }}
    >
      🔐 Are you an Admin?{' '}
      <Link to="/admin/signin" style={{ margin: '0 0.5rem' }}>
        Sign In
      </Link>{' '}
      or{' '}
      <Link to="/admin/signup" style={{ margin: '0 0.5rem' }}>
        Sign Up
      </Link>
    </div>
  )
}
