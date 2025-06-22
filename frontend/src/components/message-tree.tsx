import { useMemo } from "react";

import { toast } from "sonner";

import { MessageTreeSchema, MyConversationSchema, useStore } from "@/sync/stores";
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
} from "@/ui/carousel";
import { cn } from "@/utils";

import { useSettings, useUser } from "./auth";
import { MessageContent } from "./message-content";

export function MessageTree(props: {
    conversation: MyConversationSchema;
    messageTree: Array<MessageTreeSchema>;
}) {
    /**************************************************************************/
    /* State */
    const user = useUser();
    const settings = useSettings();
    const store = useStore();

    const selectedBranch = useMemo(() => {
        if (!props.conversation) return;

        return props.messageTree.find((tree) => {
            return props.conversation.messageBranches[tree.message.id];
        });
    }, [props.messageTree, props.conversation?.messageBranches]);

    /**************************************************************************/
    /* Render */
    if (props.messageTree.length === 1) {
        const messageTreeItem = props.messageTree[0]!;

        return (
            <div className="flex flex-col gap-10">
                <MessageContent
                    conversation={props.conversation}
                    messageTree={messageTreeItem}
                    hasSiblings={false}
                />

                {messageTreeItem.replies.length > 0 ? (
                    <MessageTree
                        conversation={props.conversation}
                        messageTree={messageTreeItem.replies}
                    />
                ) : null}
            </div>
        );
    }

    if (selectedBranch) {
        return (
            <div className="flex flex-col gap-10">
                <MessageContent
                    conversation={props.conversation}
                    messageTree={selectedBranch}
                    hasSiblings={props.messageTree.length > 1}
                />

                {selectedBranch.replies.length > 0 ? (
                    <MessageTree
                        conversation={props.conversation}
                        messageTree={selectedBranch.replies}
                    />
                ) : null}
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-10">
            <Carousel
                orientation={settings.visualBranchVertical ? "vertical" : "horizontal"}
                className="w-full"
                opts={{ startIndex: 0, watchDrag: false }}
            >
                <CarouselContent
                    className={settings.visualBranchVertical ? "py-1 pt-4" : "px-1 pl-4"}
                >
                    {props.messageTree.map((tree) => (
                        <CarouselItem
                            key={tree.message.id}
                            className={cn(
                                "group bg-background hover:bg-background-dark border-border h-fit basis-3/5 cursor-pointer rounded-lg border pb-4",
                                settings.visualBranchVertical ? "my-1" : "mx-1"
                            )}
                            onClick={async () => {
                                try {
                                    await store.updateMessageBranches({
                                        userId: user.id,
                                        conversationId: props.conversation.id,
                                        hiddenMessageIds: props.messageTree
                                            .map(({ message }) => message.id)
                                            .filter((id) => id !== tree.message.id),
                                        shownMessageId: tree.message.id,
                                    });
                                } catch (e) {
                                    toast.error(`Unable to change branches: ${e}`);
                                }
                            }}
                        >
                            <MessageContent
                                conversation={props.conversation}
                                messageTree={tree}
                                hasSiblings={true}
                            />
                        </CarouselItem>
                    ))}
                </CarouselContent>

                <CarouselPrevious tooltip="Previous" />
                <CarouselNext tooltip="Next" />
            </Carousel>
        </div>
    );
}
