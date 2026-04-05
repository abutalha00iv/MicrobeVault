import { NcbiExplorerClient } from "@/components/NcbiExplorerClient";
import { getCurrentAdmin } from "@/lib/auth";

export default async function NcbiExplorerPage() {
  const admin = await getCurrentAdmin();

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <NcbiExplorerClient isAdmin={Boolean(admin)} />
    </div>
  );
}
