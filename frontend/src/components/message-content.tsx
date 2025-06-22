import { MessageTreeSchema, MyConversationSchema, useStore } from "@/sync/stores";

import { useUser } from "./auth";
import { MessageMine } from "./message-mine";
import { OtherMessage } from "./message-other";
import { llmToImageUrl, llmToName } from "./models";

export function MessageContent(props: {
    conversation: MyConversationSchema;
    messageTree: MessageTreeSchema;
    hasSiblings: boolean;
}) {
    /**************************************************************************/
    /* State */
    const self = useUser();
    const store = useStore();
    const message = props.messageTree.message;

    /**************************************************************************/
    /* Render */
    if (message.authorId === self.id) {
        return (
            <MessageMine
                key={message.id}
                conversation={props.conversation}
                message={message}
                hasSiblings={props.hasSiblings ?? false}
            />
        );
    }

    const user = message.authorId ? store.userStore.getUser(message.authorId) : null;

    if (user) {
        return (
            <OtherMessage
                key={message.id}
                message={message}
                authorName={user.name}
                authorImageUrl={user.imageUrl}
                userId={self.id}
                hasSiblings={props.hasSiblings ?? false}
            />
        );
    }

    // We know for sure that we've got an `llm` here
    const llm = message.llm!;

    return (
        <OtherMessage
            key={message.id}
            message={message}
            authorName={llmToName[llm]}
            authorImageUrl={llmToImageUrl[llm]}
            userId={self.id}
            hasSiblings={props.hasSiblings ?? false}
        />
    );
}
