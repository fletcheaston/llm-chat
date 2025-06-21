import { useState } from "react";

import { useMountEffect } from "@react-hookz/web";
import { Share2Icon } from "lucide-react";
import { toast } from "sonner";

import { generateShareLink } from "@/api";
import { useUser } from "@/components/auth";
import { useStore } from "@/sync/stores";
import { Button } from "@/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/ui/dialog";
import { Input } from "@/ui/input";
import { Skeleton } from "@/ui/skeleton";

function ShareContent(props: { conversationId: string }) {
    /**************************************************************************/
    /* State */
    const [state, setState] = useState<"loading" | "done" | "error">("loading");
    const [isDelayed, setIsDelayed] = useState(true);

    const [shareLink, setShareLink] = useState<string | null>(null);

    // Artificial delay so we don't see a flash of the loading state
    useMountEffect(() => {
        const timer = setTimeout(() => {
            setIsDelayed(false);
        }, 1000);
        return () => clearTimeout(timer);
    });

    useMountEffect(() => {
        async function generateLink() {
            setState("loading");

            const { data } = await generateShareLink({
                path: {
                    conversation_id: props.conversationId,
                },
            });

            if (!data) {
                throw new Error("Failed to generate share link");
            }

            const fullUrl = `${window.location.origin}/join/${data.token}`;

            setShareLink(fullUrl);
            setState("done");
        }

        generateLink().catch(() => setState("error"));
    });

    /**************************************************************************/
    /* Render */
    return (
        <div className="flex flex-col gap-4">
            {state === "loading" || isDelayed ? (
                <Skeleton className="flex h-20 items-center justify-center">
                    <p className="text-primary-light font-semibold">Generating sharable link...</p>
                </Skeleton>
            ) : null}

            {state === "done" && shareLink && !isDelayed ? (
                <div className="flex h-20 flex-col gap-2">
                    <p className="text-text text-sm">
                        Share this link with others to let them join the chat.
                        <br />
                        This link expires in one week.
                    </p>

                    <div className="flex gap-2">
                        <Input
                            value={shareLink}
                            readOnly
                            className="font-mono text-sm"
                        />

                        <Button
                            variant="default"
                            onClick={async () => {
                                await navigator.clipboard.writeText(shareLink);

                                toast.dismiss();
                                toast.success("Copied link to clipboard!", { duration: 2500 });
                            }}
                            tooltip={null}
                        >
                            Copy
                        </Button>
                    </div>
                </div>
            ) : null}

            {state === "error" && !isDelayed ? (
                <p className="text-text">Failed to generate share link.</p>
            ) : null}
        </div>
    );
}

export function ShareButton({ conversationId }: { conversationId: string }) {
    /**************************************************************************/
    /* State */
    const user = useUser();
    const store = useStore();
    const conversation = store.getMyConversation(conversationId, user.id);

    if (!conversation) {
        return null;
    }

    /**************************************************************************/
    /* Render */
    if (user.id !== conversation.ownerId) {
        return null;
    }

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button
                    variant="plain"
                    size="icon"
                    className="bg-background hover:bg-background-dark border-border-dark border"
                    tooltip="Share chat"
                >
                    <Share2Icon className="h-5 w-5" />
                </Button>
            </DialogTrigger>

            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Share Chat</DialogTitle>
                </DialogHeader>

                <ShareContent conversationId={conversationId} />
            </DialogContent>
        </Dialog>
    );
}
