import { ReceiptShell } from "@/components/ReceiptShell";
import { PasteForm } from "@/components/PasteForm";

export default function Home() {
  return (
    <ReceiptShell
      footer={
        <span>
          No account. No tracking. Slips expire on their own — or you can
          make them one-time.
        </span>
      }
    >
      <PasteForm />
    </ReceiptShell>
  );
}
