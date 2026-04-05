import { NextResponse, type NextRequest } from 'next/server'

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  const token = request.cookies.get('hub_token')?.value
  const isAuthed = token === process.env.HUB_TOKEN

  const isPublic = pathname === '/' || pathname.startsWith('/api/')

  if (!isAuthed && !isPublic) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  if (isAuthed && pathname === '/') {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
