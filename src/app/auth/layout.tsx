
import React from 'react';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // This layout is minimal and doesn't include the main app sidebar or navigation.
  return <>{children}</>;
}
