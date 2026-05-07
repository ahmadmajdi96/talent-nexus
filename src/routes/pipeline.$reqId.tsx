import { createFileRoute } from "@tanstack/react-router";
import AppShell from "@/components/AppShell";
import PageHeader from "@/components/PageHeader";
import { PipelineBoard } from "./pipeline.index";
import { reqById } from "@/lib/ta-data";

export const Route = createFileRoute("/pipeline/$reqId")({
  head: ({ params }) => ({ meta: [
    { title: `Pipeline ${params.reqId} — HireFlow` },
    { name: "description", content: "Candidate kanban for a specific requisition." },
  ]}),
  component: ReqPipeline,
});

function ReqPipeline() {
  const { reqId } = Route.useParams();
  const r = reqById(reqId);
  return (
    <AppShell>
      <PageHeader title={r ? `Pipeline · ${r.title}` : "Pipeline"} description={r ? `${r.id} · ${r.location} · ${r.department}` : ""} />
      <PipelineBoard reqId={reqId} />
    </AppShell>
  );
}
