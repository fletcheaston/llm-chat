import { createFileRoute } from "@tanstack/react-router";

import { CreateConversation } from "@/components/create-conversation";

export const Route = createFileRoute("/chat/")({
    component: RouteComponent,
});

function RouteComponent() {
    /**************************************************************************/
    /* Render */
    return (
        <div className="flex max-w-3xl grow flex-col">
            <div className="grow pb-12" />

            <div className="sticky bottom-0 rounded-xl">
                <CreateConversation />
            </div>
        </div>
    );
}
