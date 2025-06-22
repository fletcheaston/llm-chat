import { Outlet, createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/chat")({
    component: RouteComponent,
});

function RouteComponent() {
    /**************************************************************************/
    /* Render */
    return (
        <div className="relative h-[100vh] grow overflow-hidden">
            <div className="flex h-full justify-center overflow-y-scroll px-2 pt-16">
                <Outlet />
            </div>
        </div>
    );
}
