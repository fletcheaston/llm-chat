import { Outlet, createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/settings")({
    component: RouteComponent,
});

function RouteComponent() {
    /**************************************************************************/
    /* Render */
    return (
        <div className="h-[100vh] grow overflow-hidden">
            <div className="flex h-full justify-center overflow-y-scroll px-2 pt-14">
                <div className="max-w-3xl grow">
                    <Outlet />
                </div>
            </div>
        </div>
    );
}
