import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/settings/visuals")({
    component: RouteComponent,
});

function RouteComponent() {
    return <div>Hello "/settings/visuals"!</div>;
}
