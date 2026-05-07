// People Hub outcomes feed — what CORTA Acquisition exposes to People Hub (CoreHR).
// This shape matches what People Hub would consume via the integration bus.
import { auditLog, candidates, hiringDecisions, conversionEvents, candidateById, reqById } from "./ta-data";

export type OutcomeKind = "STAGE_CHANGE" | "HIRING_DECISION" | "CONVERSION" | "ADVERSE_ACTION";

export interface PeopleHubOutcome {
  id: string;
  at: string;
  kind: OutcomeKind;
  candidateId: string;
  candidateName: string;
  reqId: string;
  reqTitle: string;
  summary: string;
  meta?: Record<string, any>;
  // Deep links back into CORTA Acquisition
  candidateUrl: string;
  requisitionUrl: string;
  // CoreHR mapping (when conversion happened)
  employeeId?: string;
}

export function getPeopleHubOutcomes(): PeopleHubOutcome[] {
  const out: PeopleHubOutcome[] = [];

  // Stage moves & adverse actions from audit log
  for (const a of auditLog) {
    if (a.entity === "Candidate" && a.action.startsWith("DECISION_")) {
      const c = candidateById(a.entityId); const r = c ? reqById(c.reqId) : undefined;
      if (!c || !r) continue;
      out.push({
        id: a.id, at: a.at, kind: "HIRING_DECISION",
        candidateId: c.id, candidateName: `${c.firstName} ${c.lastName}`,
        reqId: r.id, reqTitle: r.title,
        summary: `${a.action.replace("DECISION_", "")} — ${a.text}`,
        meta: { actor: a.actor },
        candidateUrl: `/candidates/${c.id}`, requisitionUrl: `/requisitions/${r.id}`,
      });
    }
    if (a.entity === "BackgroundCheck" && a.action.startsWith("ADVERSE_")) {
      // Find candidate via bgc
      // entityId is BGC id; we approximate by matching first candidate referenced
      out.push({
        id: a.id, at: a.at, kind: "ADVERSE_ACTION",
        candidateId: "", candidateName: a.text.split(" for ")[1]?.split(":")[0] ?? "—",
        reqId: "", reqTitle: "—",
        summary: `${a.action.replace("ADVERSE_", "Adverse: ")} — ${a.text}`,
        candidateUrl: `/background-checks`, requisitionUrl: `/background-checks`,
      });
    }
  }

  // Conversions
  for (const ev of conversionEvents) {
    const c = candidateById(ev.candidateId); const r = c ? reqById(c.reqId) : undefined;
    out.push({
      id: ev.id, at: ev.acceptedAt, kind: "CONVERSION",
      candidateId: ev.candidateId, candidateName: ev.candidateName,
      reqId: ev.reqId, reqTitle: r?.title ?? "—",
      summary: ev.status === "EMPLOYEE_CREATED"
        ? `Hired → CoreHR employee ${ev.newEmployeeId} provisioned`
        : `Conversion ${ev.status.replace("_", " ").toLowerCase()}`,
      employeeId: ev.newEmployeeId,
      meta: { offerId: ev.offerId, idempotencyKey: ev.idempotencyKey },
      candidateUrl: `/candidates/${ev.candidateId}`,
      requisitionUrl: `/requisitions/${ev.reqId}`,
    });
  }

  // Recent stage changes from candidate event timeline
  for (const c of candidates) {
    const r = reqById(c.reqId); if (!r) continue;
    for (const e of c.events.slice(0, 3)) {
      if (e.type !== "STAGE_MOVE") continue;
      out.push({
        id: `STG-${c.id}-${e.at}`, at: e.at, kind: "STAGE_CHANGE",
        candidateId: c.id, candidateName: `${c.firstName} ${c.lastName}`,
        reqId: r.id, reqTitle: r.title,
        summary: e.text,
        meta: { actor: e.actor, currentStage: c.stage },
        candidateUrl: `/candidates/${c.id}`, requisitionUrl: `/requisitions/${r.id}`,
      });
    }
  }

  return out.sort((a, b) => (a.at < b.at ? 1 : -1));
}
