import { useRef, useState } from "react";

import { BanIcon, CheckIcon, EditIcon, SplitIcon } from "lucide-react";
import { toast } from "sonner";

import { MessageSchema } from "@/api";
import { MyConversationSchema, useStore } from "@/sync/stores";
import { Textarea } from "@/ui/textarea";
import { formatDatetime } from "@/utils";

import { useUser } from "./auth";
import { Markdown } from "./markdown";
import { ActionButton, CopyButton } from "./message-actions";

function ViewMyMessage(props: {
    message: MessageSchema;
    onEditStart: () => void;
    hasSiblings: boolean;
}) {
    /**************************************************************************/
    /* State */
    const user = useUser();

    const store = useStore();

    /**************************************************************************/
    /* Render */
    return (
        <div
            data-message-id={props.message.id}
            className="flex justify-end"
        >
            <div
                data-limit-width
                className="group relative flex w-[85%] justify-end pb-6"
            >
                <div className="bg-background-dark border-border-dark text-text overflow-x-hidden rounded-xl rounded-br-none border px-4 py-2 leading-7 text-wrap">
                    <Markdown content={props.message.content} />
                </div>

                <div className="absolute right-0 -bottom-2 opacity-0 transition-all group-hover:opacity-100">
                    <div className="flex items-center gap-1 text-xs">
                        <p>{formatDatetime(props.message.modified)}</p>

                        {props.hasSiblings && (
                            <ActionButton
                                onClick={async () => {
                                    try {
                                        await store.unsetMessageBranch(props.message.id, user.id);
                                    } catch (e) {
                                        toast.error(`Unable to change branches: ${e}`);
                                    }
                                }}
                                tooltip="View branches"
                            >
                                <SplitIcon
                                    height={10}
                                    width={10}
                                    className="rotate-180"
                                />
                            </ActionButton>
                        )}

                        <ActionButton
                            onClick={props.onEditStart}
                            tooltip="Edit"
                        >
                            <EditIcon
                                width={10}
                                height={10}
                            />
                        </ActionButton>

                        <CopyButton value={props.message.content} />
                    </div>
                </div>
            </div>
        </div>
    );
}

function BranchMyMessage(props: {
    conversation: MyConversationSchema;
    message: MessageSchema;
    onEditStop: () => void;
}) {
    /**************************************************************************/
    /* State */
    const user = useUser();
    const store = useStore();

    // Initial content comes from original message
    const contentRef = useRef(props.message.content);

    /**************************************************************************/
    /* Render */
    return (
        <div
            data-message-id={props.message.id}
            className="flex justify-end"
        >
            <div
                data-limit-width
                className="group relative flex w-[85%] justify-end pb-6"
            >
                <div className="bg-background-dark text-text w-full overflow-x-hidden rounded-xl rounded-br-none px-4 py-2 leading-7">
                    <Textarea
                        defaultValue={props.message.content}
                        onChange={(event) => (contentRef.current = event.target.value)}
                        placeholder="Type your message here..."
                        className="max-h-48"
                    />
                </div>

                <div className="absolute right-0 -bottom-2 opacity-0 transition-all group-hover:opacity-100">
                    <div className="flex items-center gap-2">
                        <ActionButton
                            onClick={async () => {
                                if (!contentRef.current) return;

                                try {
                                    await store.createMessage({
                                        userId: user.id,
                                        replyToId: props.message.replyToId,
                                        siblingMessageId: props.message.id,
                                        conversationId: props.conversation.id,
                                        content: contentRef.current,
                                        llms: props.conversation.llms,
                                    });
                                } catch (e) {
                                    toast.error(`Unable to create message: ${e}`);
                                }
                            }}
                            tooltip="Save"
                        >
                            <CheckIcon
                                height={10}
                                width={10}
                            />
                        </ActionButton>

                        <ActionButton
                            onClick={props.onEditStop}
                            tooltip="Cancel"
                        >
                            <BanIcon
                                height={10}
                                width={10}
                            />
                        </ActionButton>

                        <CopyButton value={props.message.content} />
                    </div>
                </div>
            </div>
        </div>
    );
}

export function MessageMine(props: {
    conversation: MyConversationSchema;
    message: MessageSchema;
    hasSiblings: boolean;
}) {
    /**************************************************************************/
    /* State */
    const [editing, setEditing] = useState(false);

    /**************************************************************************/
    /* Render */
    if (!editing) {
        return (
            <ViewMyMessage
                message={props.message}
                onEditStart={() => setEditing(true)}
                hasSiblings={props.hasSiblings}
            />
        );
    }

    return (
        <BranchMyMessage
            conversation={props.conversation}
            message={props.message}
            onEditStop={() => setEditing(false)}
        />
    );
}
