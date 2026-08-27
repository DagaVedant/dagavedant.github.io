import { useState } from "react";
import { WorkspaceProvider } from "@/lib/workspace";
import IDEShell from "@/components/ide/IDEShell";
import Editor from "@/components/ide/Editor";
import BootSequence from "@/components/ide/BootSequence";

export default function Portfolio() {
  // The chrome is mounted and painted from the first frame; `booted` only
  // controls whether the overlay is still up. Nothing about the site's
  // visibility depends on it.
  const [booted, setBooted] = useState(false);

  return (
    <WorkspaceProvider>
      <IDEShell>
        <Editor />
      </IDEShell>
      {booted ? null : <BootSequence onDone={() => setBooted(true)} />}
    </WorkspaceProvider>
  );
}
