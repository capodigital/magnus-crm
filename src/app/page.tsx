import { redirect } from 'next/navigation'

import { auth } from '@/lib/auth'

const RootPage = async () => {
  const session = await auth()

  redirect(session?.user ? '/home' : '/login')
}

export default RootPage
