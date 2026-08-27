import { WorkspaceProvider } from "@/lib/workspace";
import IDEShell from "@/components/ide/IDEShell";
import Editor from "@/components/ide/Editor";

export default function Portfolio() {
  return (
    <WorkspaceProvider>
      <IDEShell>
        <Editor />
      </IDEShell>
    </WorkspaceProvider>
  );
}
