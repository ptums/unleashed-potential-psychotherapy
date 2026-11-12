import { ViewTransition } from "react";

// A template remounts on each navigation (a layout does not), so the page content gets a
// soft fade-up as it enters. The header and footer sit in the layout and stay still.
// The animation CSS is in globals.css (page-enter, page-exit).
export default function Template({ children }: { children: React.ReactNode }) {
  return (
    <ViewTransition enter="page-enter" exit="page-exit" default="none">
      <div>{children}</div>
    </ViewTransition>
  );
}
