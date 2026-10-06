/**
 * Admin overview: usage numbers and the user list with reset links.
 */
import { AdminUsers } from "@/components/admin-users";
import { Card, Eyebrow } from "@/components/ui";
import { getT } from "@/i18n/server";
import { listUsers, usageStats } from "@/lib/admin";
import { requireAdmin } from "@/lib/session";

export default async function AdminPage() {
  const admin = await requireAdmin();
  const { t } = await getT();
  const stats = usageStats();
  const users = listUsers().map((u) => ({
    ...u,
    createdAt: u.createdAt.toISOString().slice(0, 10),
    isSelf: u.id === admin.id,
  }));
  const tiles: Array<[string, number]> = [
    [t("adminTotalUsers"), stats.users],
    [t("adminActive7"), stats.active7],
    [t("adminAnswers7"), stats.answers7],
    [t("adminLessonsDone"), stats.lessonsDone],
  ];
  return (
    <div className="space-y-10">
      <h1 className="text-4xl font-semibold tracking-tight">{t("adminTitle")}</h1>
      <section>
        <h2 className="mb-3 text-xl font-semibold">{t("adminStats")}</h2>
        <div className="grid gap-3 sm:grid-cols-4">
          {tiles.map(([label, value]) => (
            <Card key={label}>
              <Eyebrow>{label}</Eyebrow>
              <p className="text-3xl font-semibold">{value}</p>
            </Card>
          ))}
        </div>
      </section>
      <section>
        <h2 className="mb-3 text-xl font-semibold">{t("adminUsers")}</h2>
        <AdminUsers users={users} />
      </section>
    </div>
  );
}
