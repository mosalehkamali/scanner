import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { verifyToken } from '@/lib/auth'

export default async function Home() {
  const cookieStore = cookies()
  const token = cookieStore.get('token')?.value

  if (token) {
    const decoded = verifyToken(token)
    if (decoded) {
      if (decoded.role === 'admin') {
        redirect('/admin')
      } else {
        redirect('/dashboard')
      }
    }
  }

  redirect('/login')
}
