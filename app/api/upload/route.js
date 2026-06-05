import { NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'

export async function POST(request) {
  try {
    const formData = await request.formData()
    const file = formData.get('file')
    if (!file) return NextResponse.json({ error: 'فایلی انتخاب نشده' }, { status: 400 })

    const uploadDir = join(process.cwd(), 'public', 'uploads')
    await mkdir(uploadDir, { recursive: true })

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const ext = file.name.split('.').pop()
    const filename = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}.${ext}`
    await writeFile(join(uploadDir, filename), buffer)

    return NextResponse.json({ url: `/uploads/${filename}` })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'خطای سرور' }, { status: 500 })
  }
}
