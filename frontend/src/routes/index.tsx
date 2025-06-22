import { createFileRoute } from "@tanstack/react-router";

import { CreateConversation } from "@/components/create-conversation";

export const Route = createFileRoute("/")({
    component: RouteComponent,
});

function RouteComponent() {
    /**************************************************************************/
    /* Render */
    return (
        <div className="relative h-[100vh] grow overflow-hidden">
            <div className="flex h-full justify-center overflow-y-scroll px-2 pt-16">
                <div className="flex max-w-3xl grow flex-col">
                    <div className="grow pb-12" />

                    <div className="sticky bottom-0 rounded-xl">
                        <CreateConversation />
                    </div>
                </div>
            </div>
        </div>
    );
}
