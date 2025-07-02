import React from 'react';
import SearchPageClient from './SearchPageClient';

export default function SearchPage() {
  // This page now directly renders the client component.
  // The client component handles its own loading state, which simplifies the server's job
  // and resolves the rendering error.
  return <SearchPageClient />;
}
