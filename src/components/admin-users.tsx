"use client";
/** User table for admins: reset links, roles and deletion. */
import { useState, useTransition } from "react";
import { createResetLinkAction, deleteUserAction, setRoleAction } from "@/app/actions/admin";
import { useT } from "@/i18n/client";
import { Button } from "./ui";

type Row = {
  id: string;
  name: string;
  email: string;
  role: string | null;
  createdAt: string;
  lastActiveDay: string | null;
  xp: number;
  lessonsDone: number;
  isSelf: boolean;
};

export function AdminUsers({ users }: { users: Row[] }) {
  const { t } = useT();
  const [links, setLinks] = useState<Record<string, string>>({});
  const [copied, setCopied] = useState<string | null>(null);
  const [pending, start] = useTransition();

  const makeLink = (id: string) =>
    start(async () => {
      const r = await createResetLinkAction(id);
      if ("path" in r) setLinks((l) => ({ ...l, [id]: `${window.location.origin}${r.path}` }));
    });

  return (
    <div className="overflow-x-auto rounded-xl border border-border">
      <table className="w-full text-left text-sm">
        <thead className="border-b border-border text-muted">
          <tr>
            <th className="px-4 py-3">{t("name")}</th>
            <th className="px-4 py-3">{t("adminJoined")}</th>
            <th className="px-4 py-3">{t("adminLastActive")}</th>
            <th className="px-4 py-3">XP</th>
            <th className="px-4 py-3">{t("statLessons")}</th>
            <th className="px-4 py-3">{t("adminRole")}</th>
            <th className="px-4 py-3" />
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u.id} className="border-b border-border align-top last:border-0">
              <td className="px-4 py-3">
                <div className="font-semibold">{u.name}</div>
                <div className="text-muted">{u.email}</div>
                {links[u.id] && (
                  <div className="mt-2 max-w-md space-y-1">
                    <p className="text-muted">{t("adminResetCreated")}</p>
                    <div className="flex gap-2">
                      <input readOnly value={links[u.id]} className="flex-1 rounded border border-border bg-surface px-2 py-1 font-mono text-xs" onFocus={(e) => e.target.select()} />
                      <Button
                        variant="secondary"
                        className="px-2 py-1 text-xs"
                        onClick={() => {
                          void navigator.clipboard.writeText(links[u.id]);
                          setCopied(u.id);
                        }}
                      >
                        {copied === u.id ? t("adminCopied") : t("adminCopy")}
                      </Button>
                    </div>
                  </div>
                )}
              </td>
              <td className="px-4 py-3">{u.createdAt}</td>
              <td className="px-4 py-3">{u.lastActiveDay ?? t("never")}</td>
              <td className="px-4 py-3">{u.xp}</td>
              <td className="px-4 py-3">{u.lessonsDone}</td>
              <td className="px-4 py-3">
                <select
                  value={u.role ?? "user"}
                  disabled={u.isSelf || pending}
                  onChange={(e) => start(() => setRoleAction(u.id, e.target.value as "user" | "admin"))}
                  className="rounded border border-border bg-surface px-2 py-1"
                  aria-label={t("adminRole")}
                >
                  <option value="user">user</option>
                  <option value="admin">admin</option>
                </select>
              </td>
              <td className="space-x-2 px-4 py-3 whitespace-nowrap">
                <Button variant="secondary" className="px-3 py-1.5 text-sm" disabled={pending} onClick={() => makeLink(u.id)}>
                  {t("adminMakeReset")}
                </Button>
                {!u.isSelf && (
                  <Button
                    variant="danger"
                    className="px-3 py-1.5 text-sm"
                    disabled={pending}
                    onClick={() => confirm(t("adminDeleteConfirm")) && start(() => deleteUserAction(u.id))}
                  >
                    {t("adminDeleteUser")}
                  </Button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
