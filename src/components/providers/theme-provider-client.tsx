
"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";
import type { ThemeProviderProps } from "next-themes/dist/types";
import { useEffect, useState } from "react";

export default function ThemeProviderClient({ children, ...props }: ThemeProviderProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    // Return null or a loading state on the server or before hydration
    // This prevents hydration mismatch errors by ensuring the UI is consistent
    // between server and client initial render.
    return <html lang="pt-BR" suppressHydrationWarning><body className="antialiased">{children}</body></html>;
  }

  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}
