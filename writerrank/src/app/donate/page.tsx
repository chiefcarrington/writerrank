import { redirect } from 'next/navigation';

export default function DonatePage() {
  redirect('/about#support');
}
