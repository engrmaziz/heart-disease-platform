"use client"

import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ text: string; error: boolean } | null>(null)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage(null)

    const supabase = createClient()
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${location.origin}/auth/callback`,
      },
    })

    if (error) {
      setMessage({ text: error.message, error: true })
    } else {
      setMessage({ text: 'Check your email for the login link!', error: false })
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-warm-50 dark:bg-charcoal-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-warm-900 dark:text-white">
          Sign in to CardioRisk
        </h2>
        <p className="mt-2 text-center text-sm text-warm-600 dark:text-warm-400">
          Secure, passwordless authentication
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white dark:bg-charcoal-800 py-8 px-4 shadow sm:rounded-lg sm:px-10 border border-warm-200 dark:border-charcoal-700">
          <form className="space-y-6" onSubmit={handleLogin}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-warm-700 dark:text-warm-300">
                Email address
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-warm-300 dark:border-charcoal-600 rounded-md shadow-sm placeholder-warm-400 focus:outline-none focus:ring-sage-500 focus:border-sage-500 sm:text-sm bg-white dark:bg-charcoal-900 text-warm-900 dark:text-white"
                  placeholder="doctor@hospital.org"
                />
              </div>
            </div>

            {message && (
              <div className={`p-4 rounded-md text-sm ${message.error ? 'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400' : 'bg-sage-50 text-sage-700 dark:bg-sage-900/30 dark:text-sage-400'}`}>
                {message.text}
              </div>
            )}

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-sage-600 hover:bg-sage-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sage-500 disabled:opacity-50 transition-colors"
              >
                {loading ? 'Sending magic link...' : 'Send Magic Link'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
