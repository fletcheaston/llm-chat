import { useMemo } from "react";

import { BotIcon, Clock4Icon, SplitIcon, ZapIcon } from "lucide-react";
import { toast } from "sonner";

import { MessageSchema } from "@/api";
import { useStore } from "@/sync/stores";
import { formatDatetime } from "@/utils";

import { useSettings } from "./auth";
import { Markdown } from "./markdown";
import { ActionButton, CopyButton } from "./message-actions";

export function OtherMessage(props: {
    message: MessageSchema;
    authorName: string;
    authorImageUrl: string;
    userId: string;
    hasSiblings: boolean;
}) {
    /**************************************************************************/
    /* State */
    const settings = useSettings();
    const store = useStore();

    const delta = useMemo(() => {
        if (!props.message.llmCompleted) {
            return null;
        }

        const started = new Date(props.message.created);
        const completed = new Date(props.message.llmCompleted);

        return completed.getTime() - started.getTime();
    }, [props.message.created, props.message.modified]);

    /**************************************************************************/
    /* Render */
    return (
        <div
            data-message-id={props.message.id}
            className="group relative pb-6"
        >
            <div className="flex flex-col gap-y-4 overflow-x-hidden px-1 leading-7 text-wrap">
                <Markdown content={props.message.content} />
            </div>

            <div className="absolute -bottom-2 left-0 opacity-0 transition-all group-hover:opacity-100">
                <div className="flex items-center gap-1 text-xs font-medium">
                    <CopyButton value={props.message.content} />

                    {props.hasSiblings && (
                        <ActionButton
                            onClick={async () => {
                                try {
                                    await store.unsetMessageBranch(props.message.id, props.userId);
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

                    <p>{formatDatetime(props.message.modified)}</p>

                    <div className="border-background-light h-3 border-l" />

                    <p className="text-primary">{props.authorName}</p>

                    {props.authorImageUrl ? (
                        <img
                            src={props.authorImageUrl}
                            alt={props.authorName}
                            className="size-3 rounded"
                        />
                    ) : null}

                    {settings.visualStatsForNerds && delta && props.message.tokens ? (
                        <>
                            <div className="border-background-light h-3 border-l" />

                            <ZapIcon className="size-3" />

                            <p>{(props.message.tokens / (delta / 1000)).toFixed(1)} tok / sec</p>
                        </>
                    ) : null}

                    {settings.visualStatsForNerds && props.message.tokens ? (
                        <>
                            <div className="border-background-light h-3 border-l" />

                            <BotIcon className="size-3" />

                            <p>{props.message.tokens} tokens</p>
                        </>
                    ) : null}

                    {settings.visualStatsForNerds && delta ? (
                        <>
                            <div className="border-background-light h-3 border-l" />

                            <Clock4Icon className="size-3" />

                            <p>{(delta / 1000).toFixed(2)} sec</p>
                        </>
                    ) : null}
                </div>
            </div>
        </div>
    );
}
