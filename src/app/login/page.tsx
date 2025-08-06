
import { redirect } from 'next/navigation';
import { ROUTES } from '@/lib/constants';

// This page is obsolete now. The new login page is at /auth/login.
// We redirect from here to maintain compatibility with old bookmarks.
export default function ObsoleteLoginPage() {
  redirect(ROUTES.LOGIN);
}
