import { redirect } from 'next/navigation'

export default async function RegisterPage() {
  // Registration is currently closed - redirect to waiting list
  redirect('/waitlist')
}
