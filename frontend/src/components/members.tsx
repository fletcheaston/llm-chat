import { UsersIcon } from "lucide-react";
import { observer } from "mobx-react-lite";

import { useStore } from "@/sync/stores";
import { Button } from "@/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/ui/dialog";

import { llmToName } from "./models";

export const MembersDialog = observer(function MembersDialog({
    conversationId,
}: {
    conversationId: string;
}) {
    /**************************************************************************/
    /* State */
    const store = useStore();
    const userMap = store.getUserMapForConversation(conversationId);

    // Calculate message counts
    const userMessageCounts = store.getUserMessageCounts(conversationId);
    const llmMessageCounts = store.getLLMMessageCounts(conversationId);

    /**************************************************************************/
    /* Render */
    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button
                    variant="plain"
                    size="icon"
                    className="bg-background hover:bg-background-dark border-border-dark border"
                    tooltip="View members"
                >
                    <UsersIcon className="h-5 w-5" />
                </Button>
            </DialogTrigger>

            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Conversation Members</DialogTitle>
                </DialogHeader>

                <div className="flex flex-col gap-4">
                    <div>
                        <h3 className="text-lg">Users</h3>

                        <div className="flex flex-col gap-1">
                            {Object.values(userMap).map((user) => {
                                const count = userMessageCounts[user.id];

                                return (
                                    <div
                                        key={user.id}
                                        className="border-border-dark flex items-center justify-between gap-2 border-b py-1 text-sm"
                                    >
                                        <div className="grow">
                                            <p className="font-medium">{user.name}</p>
                                        </div>

                                        <div>
                                            {count} {count === 1 ? "message" : "messages"}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    <div>
                        <h3 className="text-lg">Models</h3>

                        <div className="flex flex-col gap-1">
                            {Object.entries(llmToName).map(([llm, name]) => {
                                const count = llmMessageCounts[llm];

                                if (!count) return;

                                return (
                                    <div
                                        key={llm}
                                        className="border-border-dark flex items-center justify-between gap-2 border-b py-1 text-sm"
                                    >
                                        <div className="grow">
                                            <p className="font-medium">{name}</p>
                                        </div>

                                        <div>
                                            {count} {count === 1 ? "message" : "messages"}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
});
