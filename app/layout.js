import './globals.css'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

export const metadata = {
  title: 'سیستم حسابداری و فروشگاهی',
  description: 'سیستم حسابداری هوشمند با اسکنر بارکد موبایل',
}

export default function RootLayout({ children }) {
  return (
    <html lang="fa" dir="rtl">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body className="bg-gray-50 min-h-screen font-vazir">
        {children}
        <ToastContainer
          position="top-right"
          autoClose={3000}
          rtl={true}
          theme="light"
          toastClassName="font-vazir"
        />
      </body>
    </html>
  )
}
