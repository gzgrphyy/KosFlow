declare module '#auth-utils' {
  interface User {
    id: string
    name: string
    email: string
    role: 'OWNER' | 'ADMIN'
  }

  interface UserSession {
    loggedInAt: number
  }
}

export {}
