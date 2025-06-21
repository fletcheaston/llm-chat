import { useState } from "react";

import { ArrowUpIcon } from "lucide-react";
import { observer } from "mobx-react-lite";
import { toast } from "sonner";

import { useUser } from "@/components/auth";
import { ModelMultiSelect } from "@/components/model-select";
import { useStore } from "@/sync/stores";
import { Button } from "@/ui/button";
import { Textarea } from "@/ui/textarea";
import { cn } from "@/utils";

export const CreateMessage = observer(function CreateMessage({
    conversationId,
}: {
    conversationId: string;
}) {
    /**************************************************************************/
    /* State */
    const user = useUser();
    const store = useStore();
    const conversation = store.getMyConversation(conversationId, user.id);

    const [message, setMessage] = useState("");

    const empty = message === "";

    if (!conversation) {
        return null;
    }

    /**************************************************************************/
    /* Render */
    return (
        <div className="bg-background/50 rounded-t-2xl p-2 pb-0 backdrop-blur-xs">
            <div className="bg-background-light/30 mb-0 flex flex-col justify-between gap-2 rounded-t-xl p-3 pb-1 backdrop-blur-xs">
                <Textarea
                    value={message}
                    onChange={(event) => setMessage(event.target.value)}
                    placeholder="Type your message here..."
                    className="max-h-48"
                />

                <div className="flex items-end justify-between">
                    <ModelMultiSelect
                        llms={conversation.llms}
                        setLlms={(llms) => {
                            store.setConversationLlms(user.id, conversationId, llms).catch((e) => {
                                toast.error(`Unable to update LLMs: ${e}`);
                            });
                        }}
                    />

                    <Button
                        size="icon"
                        className={cn(
                            "bg-primary-light",
                            empty ? "cursor-default opacity-50" : "hover:bg-primary"
                        )}
                        onClick={async () => {
                            if (!message) return;

                            const tempMessage = message;

                            setMessage("");

                            // Pull the message we're replying to from the DOM
                            // MUCH easier to do this than pass state around in very hard ways
                            const elements =
                                document.querySelectorAll<HTMLElement>("[data-message-id]");
                            const lastElement = elements[elements.length - 1];
                            const replyToId = lastElement?.getAttribute("data-message-id") ?? null;

                            try {
                                await store.createMessage({
                                    userId: user.id,
                                    replyToId,
                                    siblingMessageId: null,
                                    conversationId,
                                    content: message,
                                    llms: conversation.llms,
                                });
                            } catch (e) {
                                toast.error(`Unable to create message: ${e}`);
                                setMessage(tempMessage);
                            }
                        }}
                        tooltip={empty ? "Message requires text" : "Send message"}
                    >
                        <ArrowUpIcon className="text-background-dark size-5" />
                        <span className="sr-only">Send Message</span>
                    </Button>
                </div>
            </div>
        </div>
    );
});
