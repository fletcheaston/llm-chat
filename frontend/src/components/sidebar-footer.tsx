import { Link } from "@tanstack/react-router";
import { observer } from "mobx-react-lite";

import { useUser } from "@/components/auth";
import { useStore } from "@/sync/stores";
import { Button } from "@/ui/button";
import { Separator } from "@/ui/separator";

const DailyMessageCounter = observer(function DailyMessageCounter() {
    /**************************************************************************/
    /* State */
    const user = useUser();
    const store = useStore();
    const messageCount = store.getDailyLLMResponseCount(user.id);

    /**************************************************************************/
    /* Render */
    return <p className="text-xs tabular-nums">{messageCount} / 100</p>;
});

export function SidebarFooter() {
    /**************************************************************************/
    /* State */
    const user = useUser();

    /**************************************************************************/
    /* Render */
    return (
        <div
            data-slot="sidebar-header"
            data-sidebar="header"
            className="flex flex-col items-center gap-2 py-0.5"
        >
            <Separator />

            <Button
                asChild
                variant="plain"
                size="custom"
                className="hover:bg-background-light -mx-1 flex w-full items-center justify-start gap-2 px-1 py-1 text-left"
                tooltip="Daily alottment of LLM messages"
            >
                <Link to="/settings/visuals">
                    {user.imageUrl ? (
                        <img
                            src={user.imageUrl}
                            alt={user.name}
                            className="size-8 rounded-full"
                        />
                    ) : null}

                    <div className="grow">
                        <p className="text-sm">{user.name}</p>

                        <DailyMessageCounter />
                    </div>
                </Link>
            </Button>
        </div>
    );
}
