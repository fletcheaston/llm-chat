import { Link } from "@tanstack/react-router";

import { Button } from "@/ui/button";
import { Separator } from "@/ui/separator";

export function SidebarHeader() {
    /**************************************************************************/
    /* Render */
    return (
        <div
            data-slot="sidebar-header"
            data-sidebar="header"
            className="flex flex-col items-center gap-2 py-0.5"
        >
            <h1 className="my-0 h-4 select-none">Fletcher's LLM Chat</h1>

            <Button
                asChild
                variant="plain"
                size="default"
                className="text-background hover:bg-primary bg-primary-light hover:border-primary border-primary-light mt-4 w-full border text-sm"
                tooltip={null}
            >
                <Link to="/chat">New Chat</Link>
            </Button>

            <Separator />
        </div>
    );
}
