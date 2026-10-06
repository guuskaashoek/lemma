/**
 * Distraction-free layout for lessons, tests and reviews: no navigation,
 * just the content. The toolbox (calculator, legend) stays available.
 */
import { requireOnboardedUser } from "@/lib/session";

export default async function FocusLayout({ children }: LayoutProps<"/">) {
  await requireOnboardedUser();
  return <main className="px-6 py-8 pb-28">{children}</main>;
}
