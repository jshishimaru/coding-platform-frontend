import { type ReactNode } from 'react';

export function RootLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b px-4 py-2">
        <h1 className="text-xl font-bold">Coding Platform</h1>
      </header>
      <main className="p-4">
        {children}
      </main>
    </div>
  );
}
