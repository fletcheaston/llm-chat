import { MouseEvent, useCallback, useMemo, useState } from "react";

import { Link, useLocation } from "@tanstack/react-router";
import { EyeIcon, EyeOffIcon } from "lucide-react";
import { observer } from "mobx-react-lite";
import { toast } from "sonner";

import { updateConversation } from "@/api";
import { useUser } from "@/components/auth";
import { ConversationWithMemberData, useStore } from "@/sync/stores";
import { Button } from "@/ui/button";
import {
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from "@/ui/sidebar";
import { cn } from "@/utils";

function ConversationLink(props: { id: string; title: string; hidden: boolean; pathname: string }) {
    /**************************************************************************/
    /* State */
    const selected = props.pathname.includes(props.id);

    const toggleHidden = useCallback(
        async (event: MouseEvent) => {
            event.preventDefault();
            event.stopPropagation();

            await updateConversation({
                body: { hidden: !props.hidden },
                path: { conversation_id: props.id },
            });

            toast.success(props.hidden ? "Chat displayed" : "Chat hidden");
        },
        [props.id, props.hidden]
    );

    /**************************************************************************/
    /* Render */
    return (
        <SidebarMenuItem className="group/item relative">
            <>
                <SidebarMenuButton
                    asChild
                    className={cn(
                        "text-text hover:bg-primary-light hover:text-background-dark block flex-1 rounded-none rounded-t-lg border-b px-1.5 py-1 transition-all",
                        selected
                            ? "border-b-primary"
                            : "hover:border-b-primary-light border-b-border-dark"
                    )}
                >
                    <Link
                        to="/chat/$chatId"
                        params={{ chatId: props.id }}
                        className="truncate text-nowrap"
                    >
                        {props.title}
                    </Link>
                </SidebarMenuButton>

                <Button
                    size="icon"
                    variant="plain"
                    className="hover:bg-background-light bg-background absolute top-0.5 right-0.5 size-6 opacity-0 group-hover/item:opacity-100"
                    onClick={toggleHidden}
                    tooltip={props.hidden ? "Show chat" : "Hide chat"}
                >
                    {props.hidden ? (
                        <EyeOffIcon className="h-4 w-4" />
                    ) : (
                        <EyeIcon className="h-4 w-4" />
                    )}
                </Button>
            </>
        </SidebarMenuItem>
    );
}

export const ConversationSidebar = observer(function ConversationSidebar() {
    /**************************************************************************/
    /* State */
    const [showAll, setShowAll] = useState(false);
    const user = useUser();
    const store = useStore();

    const pathname = useLocation({ select: (state) => state.pathname });

    const conversations = store.getConversationsForUser(user.id);

    const filteredConversations = useMemo(() => {
        if (showAll) {
            return conversations;
        }

        return conversations.filter(
            (conversation: ConversationWithMemberData) => !conversation.hidden
        );
    }, [showAll, conversations]);

    /**************************************************************************/
    /* Render */
    return (
        <>
            <SidebarGroupLabel className="flex justify-between gap-2">
                <div>Chats</div>

                <Button
                    size="icon"
                    variant="plain"
                    className="hover:bg-background-light bg-background size-6 opacity-0 group-hover:opacity-100"
                    onClick={() => setShowAll((prevState) => !prevState)}
                    tooltip={showAll ? "Hide hidden chats" : "Show all chats"}
                >
                    {showAll ? <EyeOffIcon className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}
                </Button>
            </SidebarGroupLabel>

            <SidebarGroupContent>
                <SidebarMenu>
                    {filteredConversations.map((conversation) => {
                        return (
                            <ConversationLink
                                key={conversation.id}
                                id={conversation.id}
                                title={conversation.title}
                                hidden={conversation.hidden}
                                pathname={pathname}
                            />
                        );
                    })}
                </SidebarMenu>
            </SidebarGroupContent>
        </>
    );
});
