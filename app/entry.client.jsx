import { RemixBrowser } from "@remix-run/react";
import { startTransition, StrictMode } from "react";
import { hydrateRoot } from "react-dom/client";
import { ThemeProvider } from "@material-tailwind/react";

if (!window.location.origin.includes("webcache.googleusercontent.com")) {
  startTransition(() => {
    hydrateRoot(
      document,
        <StrictMode>
          <ThemeProvider>
          <RemixBrowser />
          </ThemeProvider>
        </StrictMode>

    );
  });
}
