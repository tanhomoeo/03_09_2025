
import { redirect } from 'next/navigation';
import { ROUTES } from '@/lib/constants';

export default function RootPage() {
  redirect(ROUTES.LOGIN);
}
