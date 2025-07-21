
import React, { Suspense } from 'react';
import SearchPageClient from './SearchPageClient';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';

export default function SearchPage() {
  return (
    <Suspense fallback={<LoadingSpinner variant="page" label="অনুসন্ধান পৃষ্ঠা লোড হচ্ছে..." showLogo />}>
        <SearchPageClient />
    </Suspense>
  );
}
