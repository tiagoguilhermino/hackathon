import { AlertTriangle, CheckCircle2, LogOut, MousePointerClick } from "lucide-react";

export interface LogEntry {
  key: string;
  agentIndex: number;
  personaName: string;
  screenId: string;
  actionId: string;
  value?: string;
  reasoning: string;
  thinkTimeMs: number;
  load: number;
  optimal: boolean;
}

export function DecisionLog({ entries }: { entries: LogEntry[] }) {
  if (!entries.length) {
    return <p className="p-4 text-sm text-neutral-500">As decisões π(a|s) dos agentes aparecerão aqui.</p>;
  }
  return (
    <ol className="divide-y divide-neutral-100">
      {entries.map((e) => {
        const abandon = e.actionId === "ABANDONAR";
        return (
          <li key={e.key} className="px-3 py-2 text-xs">
            <div className="flex items-center gap-1.5">
              {abandon ? (
                <LogOut size={13} className="text-red-600" />
              ) : e.optimal ? (
                <CheckCircle2 size={13} className="text-green-600" />
              ) : (
                <AlertTriangle size={13} className="text-amber-500" />
              )}
              <span className="font-semibold text-itau-navy">#{e.agentIndex + 1}</span>
              <span className="text-neutral-500">{e.screenId}</span>
              <MousePointerClick size={12} className="text-neutral-400" />
              <code className={`truncate ${abandon ? "text-red-600" : "text-itau-orange"}`}>
                {e.actionId}
                {e.value ? ` = "${e.value}"` : ""}
              </code>
              <span className="ml-auto shrink-0 tabular-nums text-neutral-400">
                {(e.thinkTimeMs / 1000).toFixed(1)}s · L={e.load.toFixed(2)}
              </span>
            </div>
            <p className="mt-0.5 pl-5 italic text-neutral-600">“{e.reasoning}”</p>
          </li>
        );
      })}
    </ol>
  );
}
