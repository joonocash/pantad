import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { OnboardingForm } from './onboarding-form'

export default async function OnboardingPage({
  searchParams,
}: {
  searchParams: Promise<{ edit?: string }>
}) {
  const { edit } = await searchParams
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/auth/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('username, onboarded')
    .eq('id', user.id)
    .single()

  if (profile?.onboarded && !edit) redirect('/map')

  return (
    <OnboardingForm
      userId={user.id}
      initialUsername={profile?.username ?? ''}
      isEdit={!!edit}
    />
  )
}
