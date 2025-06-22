import { createFileRoute } from "@tanstack/react-router";
import { observer } from "mobx-react-lite";

import { useUser } from "@/components/auth";
import { CreateMessage } from "@/components/create-message";
import { MembersDialog } from "@/components/members";
import { MessageTree } from "@/components/message-content";
import { ShareButton } from "@/components/share";
import { useStore } from "@/sync/stores";

export const Route = createFileRoute("/chat/$chatId")({
    component: RouteComponent,
});

const Conversation = observer(function Conversation(props: { conversationId: string }) {
    /**************************************************************************/
    /* State */
    const store = useStore();

    const user = useUser();
    const conversation = store.getMyConversation(props.conversationId, user.id);
    const messageTree = store.getMessageTree(props.conversationId);

    if (!conversation) {
        return null;
    }

    /**************************************************************************/
    /* Render */
    return (
        <div className="flex max-w-3xl grow flex-col">
            <div className="absolute top-4 right-4 z-10 flex flex-col gap-2">
                <MembersDialog conversationId={props.conversationId} />

                <ShareButton conversationId={props.conversationId} />
            </div>

            <div className="grow px-4 pb-12 text-sm">
                <MessageTree
                    messageTree={messageTree}
                    conversation={conversation}
                />
            </div>

            <div className="sticky bottom-0 rounded-xl">
                <CreateMessage conversationId={props.conversationId} />
            </div>
        </div>
    );
});

function RouteComponent() {
    /**************************************************************************/
    /* State */
    const { chatId } = Route.useParams();

    /**************************************************************************/
    /* Render */
    return <Conversation conversationId={chatId} />;
}
