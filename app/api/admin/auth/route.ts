import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function POST(request: Request) {
  try {
    const { password } = await request.json()
    console.log('Received password:', password)

    if (password !== process.env.NEXT_PUBLIC_ADMIN_PASSWORD) {
      return NextResponse.json(
        { error: 'Invalid password' },
        { status: 401 }
      )
    }

    const token = btoa(`:${password}`)
    const response = NextResponse.json({ success: true })
    
    cookies().set('adminAuthenticated', 'true', {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60 // 7 days
    })
    
    return response
  } catch (error) {
    console.error('Authentication error:', error)
    return NextResponse.json(
      { error: 'Server configuration error' },
      { status: 500 }
    )
  }
}

export async function DELETE() {
  // Clear server-side cookies
  cookies().delete('adminAuthenticated')
  cookies().delete('adminAuth')
  
  const response = NextResponse.json({ success: true })
  
  // Clear client-side cookies by setting expiry in the past
  response.cookies.set('adminAuthenticated', '', { 
    expires: new Date(0),
    path: '/'
  })
  response.cookies.set('adminAuth', '', { 
    expires: new Date(0),
    path: '/'
  })
  
  return response
} 