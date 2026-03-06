'use client'

import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { LogOut } from 'lucide-react'

export function LogoutButton() {
  const router = useRouter()
  const supabase = createClient()

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  return (
    <Button variant="outline" className="w-full text-destructive hover:text-destructive" onClick={handleLogout}>
      <LogOut className="mr-2 h-4 w-4" />
      Logga ut
    </Button>
  )
}
