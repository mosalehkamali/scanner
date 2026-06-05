import './globals.css'
import { Bricolage_Grotesque, Inter, JetBrains_Mono } from 'next/font/google'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

const heading = Bricolage_Grotesque({
  subsets: ['latin'],
  variable: '--font-heading',
  weight: ['400', '600', '700', '800'],
})
const body = Inter({
  subsets: ['latin'],
  variable: '--font-body',
})
const mono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  weight: ['400', '500'],
})

export const metadata = {
  title: 'سیستم حسابداری و فروشگاهی',
  description: 'سیستم حسابداری هوشمند با اسکنر بارکد موبایل',
}

export default function RootLayout({ children }) {
  return (
    <html lang="fa" dir="rtl" className={`dark ${heading.variable} ${body.variable} ${mono.variable}`}>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body className="bg-zinc-950 min-h-screen font-vazir text-white antialiased">
        {children}
        <ToastContainer
          position="top-right"
          autoClose={3000}
          rtl={true}
          theme="dark"
          toastClassName="font-vazir !bg-zinc-900 !border !border-white/10 !rounded-xl !text-sm"
        />
      </body>
    </html>
  )
}
