import { makeAutoObservable } from "mobx";
import { computedFn } from "mobx-utils";
import { toast } from "sonner";

import {
    ConversationSchema,
    LargeLanguageModel,
    MemberSchema,
    MessageSchema,
    createConversation as apiCreateConversation,
    createMessage as apiCreateMessage,
    updateConversation as apiUpdateConversation,
} from "@/api";

import { ConversationStore } from "./conversation-store";
import { MemberStore } from "./member-store";
import { MessageStore } from "./message-store";
import { UserStore } from "./user-store";

export interface MessageTreeSchema {
    message: MessageSchema;
    replies: MessageTreeSchema[];
}

export interface MyConversationSchema extends ConversationSchema {
    llms: Array<LargeLanguageModel>;
    messageBranches: MemberSchema["messageBranches"];
}

export interface ConversationWithMemberData extends ConversationSchema {
    hidden: boolean;
    llmsSelected: MemberSchema["llmsSelected"];
}

export class RootStore {
    messageStore: MessageStore;
    conversationStore: ConversationStore;
    memberStore: MemberStore;
    userStore: UserStore;

    constructor() {
        this.messageStore = new MessageStore();
        this.conversationStore = new ConversationStore();
        this.memberStore = new MemberStore();
        this.userStore = new UserStore();

        makeAutoObservable(this);
    }

    /**************************************************************************/
    /* Cross-store computed values and actions */

    // Clear all stores (for logout)
    async clearAll() {
        await Promise.all([
            this.messageStore.clearAll(),
            this.conversationStore.clearAll(),
            this.memberStore.clearAll(),
            this.userStore.clearAll(),
        ]);
    }

    // Get all errors from stores
    get errors() {
        return [
            this.messageStore.error,
            this.conversationStore.error,
            this.memberStore.error,
            this.userStore.error,
        ].filter((error) => error !== null);
    }

    // Check if there are any errors
    get hasErrors() {
        return this.errors.length > 0;
    }

    // Initialize all stores from IndexedDB
    async initializeFromDatabase(): Promise<void> {
        try {
            // Load all data in parallel
            await Promise.all([
                this.userStore.loadFromDatabase(),
                this.conversationStore.loadFromDatabase(),
                this.memberStore.loadFromDatabase(),
                this.messageStore.loadFromDatabase(),
            ]);
        } catch (error) {
            console.error("Failed to initialize stores from database:", error);
        }
    }

    /**************************************************************************/

    /* Conversation-specific computed values */
    // Memoized conversation with member data computation
    getMyConversation = computedFn((conversationId: string, userId: string): MyConversationSchema | undefined => {
        const conversation = this.conversationStore.getConversation(conversationId);
        const member = this.memberStore.getMemberByUserAndConversation(userId, conversationId);

        if (!conversation || !member) {
            return undefined;
        }

        return {
            ...conversation,
            llms: member.llmsSelected,
            messageBranches: member.messageBranches,
        };
    });

    // Memoized message tree computation for better performance
    getMessageTree = computedFn((conversationId: string): MessageTreeSchema[] => {
        const messages = this.messageStore.getMessagesByConversationId(conversationId);

        // Build the tree structure
        function buildTree(message: MessageSchema): MessageTreeSchema {
            const replies = messages
                .filter((msg) => msg.replyToId === message.id)
                .map((msg) => buildTree(msg));

            return {
                message,
                replies,
            };
        }

        // Build the tree from our root messages
        return messages
            .filter((msg) => msg.replyToId === null)
            .map((rootMessage) => buildTree(rootMessage));
    });

    /**************************************************************************/

    /* Helper functions for data operations */
    async createConversation(
        userId: string,
        content: string,
        llms: Array<LargeLanguageModel>,
        onOptimisticSave: ((id: string) => Promise<void>) | null
    ) {
        // 1. Optimistically update local stores
        const timestamp = new Date().toISOString();

        const conversation: ConversationSchema = {
            id: crypto.randomUUID(),
            created: timestamp,
            modified: timestamp,
            title: content,
            ownerId: userId,
        };

        const member: MemberSchema = {
            id: crypto.randomUUID(),
            created: timestamp,
            modified: timestamp,
            conversationId: conversation.id,
            userId: userId,
            addedById: userId,
            llmsSelected: llms,
            messageBranches: {},
            hidden: false,
        };

        const message: MessageSchema = {
            id: crypto.randomUUID(),
            created: timestamp,
            modified: timestamp,
            title: content,
            content: content,
            conversationId: conversation.id,
            replyToId: null,
            authorId: userId,
            llm: null,
            llmCompleted: null,
            tokens: null,
        };

        // Save to stores (which handle database persistence)
        await Promise.all([
            this.conversationStore.save(conversation),
            this.memberStore.save(member),
            this.messageStore.save(message),
        ]);

        // 1.5. If provided, optimistically navigate
        if (onOptimisticSave !== null) {
            await onOptimisticSave(conversation.id);
        }

        // 2. Save to API
        const result = await apiCreateConversation({
            body: {
                id: conversation.id,
                title: conversation.title,
                memberId: member.id,
                messageId: message.id,
                messageTitle: message.title,
                messageContent: message.content,
                llms,
            },
        });

        if (result.error) {
            if (result.response.status === 429) {
                toast.error(
                    "You've exceeded the number of free LLM responses for the last 24 hours.",
                    {
                        duration: 5000,
                    }
                );
            }
        }
    }

    async createMessage(props: {
        userId: string;
        replyToId: string | null;
        siblingMessageId: string | null;
        conversationId: string;
        content: string;
        llms: Array<LargeLanguageModel>;
    }) {
        // 1. Optimistically update local stores
        const timestamp = new Date().toISOString();

        const message: MessageSchema = {
            id: crypto.randomUUID(),
            created: timestamp,
            modified: timestamp,
            title: props.content,
            content: props.content,
            conversationId: props.conversationId,
            replyToId: props.replyToId,
            authorId: props.userId,
            llm: null,
            llmCompleted: null,
            tokens: null,
        };

        // Save message to store
        await this.messageStore.save(message);

        // Update member message branches
        const member = this.memberStore.getMemberByUserAndConversation(
            props.userId,
            props.conversationId
        );

        if (!member) {
            throw new Error("Unable to find membership.");
        }

        const messageBranches = {
            ...member.messageBranches,
            [message.id]: true,
        };

        if (props.siblingMessageId) {
            messageBranches[props.siblingMessageId] = false;
        }

        await this.memberStore.save({
            ...member,
            messageBranches,
        });

        // 2. Save to API
        const result = await apiCreateMessage({
            body: {
                id: message.id,
                title: message.title,
                content: message.content,
                conversationId: message.conversationId,
                replyToId: message.replyToId,
                llms: props.llms,
            },
        });

        if (result.error) {
            if (result.response.status === 429) {
                toast.error(
                    "You've exceeded the number of free LLM responses for the last 24 hours.",
                    {
                        duration: 5000,
                    }
                );
            }
        }
    }

    async updateMessageBranches(props: {
        userId: string;
        conversationId: string;
        hiddenMessageIds: Array<string>;
        shownMessageId: string | null;
    }) {
        // 1. Optimistically update local store
        const member = this.memberStore.getMemberByUserAndConversation(
            props.userId,
            props.conversationId
        );

        if (!member) {
            throw new Error("Unable to find membership.");
        }

        const messageBranches = { ...member.messageBranches };

        props.hiddenMessageIds.forEach((id) => {
            messageBranches[id] = false;
        });

        if (props.shownMessageId) {
            messageBranches[props.shownMessageId] = true;
        }

        await this.memberStore.save({
            ...member,
            messageBranches,
        });

        // 2. Save to API
        await apiUpdateConversation({
            body: {
                messageBranches,
            },
            path: { conversation_id: props.conversationId },
        });
    }

    async hideConversation(userId: string, conversationId: string) {
        // 1. Optimistically update local store
        const member = this.memberStore.getMemberByUserAndConversation(userId, conversationId);

        if (!member) {
            throw new Error("Unable to find membership.");
        }

        await this.memberStore.save({
            ...member,
            hidden: true,
        });

        // 2. Save to API
        await apiUpdateConversation({
            body: {
                hidden: true,
            },
            path: { conversation_id: conversationId },
        });
    }

    async showConversation(userId: string, conversationId: string) {
        // 1. Optimistically update local store
        const member = this.memberStore.getMemberByUserAndConversation(userId, conversationId);

        if (!member) {
            throw new Error("Unable to find membership.");
        }

        await this.memberStore.save({
            ...member,
            hidden: false,
        });

        // 2. Save to API
        await apiUpdateConversation({
            body: {
                hidden: false,
            },
            path: { conversation_id: conversationId },
        });
    }

    async setConversationLlms(
        userId: string,
        conversationId: string,
        llms: Array<LargeLanguageModel>
    ) {
        // 1. Optimistically update local store
        const member = this.memberStore.getMemberByUserAndConversation(userId, conversationId);

        if (!member) {
            throw new Error("Unable to find membership.");
        }

        await this.memberStore.save({
            ...member,
            llmsSelected: llms,
        });

        // 2. Save to API
        await apiUpdateConversation({
            body: {
                llmsSelected: llms,
            },
            path: { conversation_id: conversationId },
        });
    }

    /**************************************************************************/

    /* Additional helper methods for components */

    getMessagesByConversationId(conversationId: string): MessageSchema[] {
        return this.messageStore.getMessagesByConversationId(conversationId);
    }

    getUserMessageCounts(conversationId: string): Record<string, number> {
        const messages = this.getMessagesByConversationId(conversationId);

        const userIdCounts: Record<string, number> = {};

        messages.forEach((msg) => {
            if (msg.authorId) {
                userIdCounts[msg.authorId] = (userIdCounts[msg.authorId] || 0) + 1;
            }
        });

        return userIdCounts;
    }

    getLLMMessageCounts(conversationId: string): Record<string, number> {
        const messages = this.getMessagesByConversationId(conversationId);
        const llmCounts: Record<string, number> = {};

        messages.forEach((msg) => {
            if (msg.llm) {
                llmCounts[msg.llm] = (llmCounts[msg.llm] || 0) + 1;
            }
        });

        return llmCounts;
    }

    // Memoized conversations for user computation
    getConversationsForUser = computedFn((userId: string): ConversationWithMemberData[] => {
        const conversations = this.conversationStore.sortedConversations;
        const userMembers = this.memberStore.getMembersByUserId(userId);

        const memberMap = Object.fromEntries(
            userMembers.map((member) => [member.conversationId, member])
        );

        return conversations.map((conversation) => {
            const member = memberMap[conversation.id];
            return {
                ...conversation,
                hidden: member?.hidden || false,
                llmsSelected: member?.llmsSelected || [],
            };
        });
    });

    // Memoized daily LLM response count computation
    getDailyLLMResponseCount = computedFn((userId: string): number => {
        const oneDayAgo = new Date();
        oneDayAgo.setDate(oneDayAgo.getDate() - 1);

        // Get all messages from the user
        const userMessages = this.messageStore.allMessages.filter(
            (message) => message.authorId === userId
        );
        const userMessageIds = new Set(userMessages.map((msg) => msg.id));

        // Count LLM replies to those messages created in the last 24 hours
        return this.messageStore.allMessages.filter((message) => {
            return (
                message.llm !== null &&
                message.replyToId !== null &&
                userMessageIds.has(message.replyToId) &&
                new Date(message.created) >= oneDayAgo
            );
        }).length;
    });

    async unsetMessageBranch(messageId: string, userId: string) {
        // Get the message to find its siblings
        const message = this.messageStore.getMessage(messageId);

        if (!message) {
            throw new Error("Message not found");
        }

        // Hide the current message and show no specific message (null means show all siblings)
        await this.updateMessageBranches({
            userId,
            conversationId: message.conversationId,
            hiddenMessageIds: [messageId],
            shownMessageId: null,
        });
    }
}

// Create a singleton instance
export const rootStore = new RootStore();
