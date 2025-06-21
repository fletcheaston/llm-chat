import { makeAutoObservable, runInAction } from "mobx";

import { LargeLanguageModel, MemberSchema } from "@/api";
import { db } from "@/sync/database";

export class MemberStore {
    members = new Map<string, MemberSchema>();
    isLoading = false;
    error: string | null = null;

    constructor() {
        makeAutoObservable(this);
    }

    // Actions
    setMembers(members: MemberSchema[]) {
        runInAction(() => {
            this.members.clear();
            members.forEach((member) => {
                this.members.set(member.id, member);
            });
        });
    }

    addMember(member: MemberSchema) {
        runInAction(() => {
            this.members.set(member.id, member);
        });
    }

    updateMember(memberId: string, updates: Partial<MemberSchema>) {
        runInAction(() => {
            const existing = this.members.get(memberId);
            if (existing) {
                this.members.set(memberId, { ...existing, ...updates });
            }
        });
    }

    removeMember(memberId: string) {
        runInAction(() => {
            this.members.delete(memberId);
        });
    }

    setLoading(loading: boolean) {
        runInAction(() => {
            this.isLoading = loading;
        });
    }

    setError(error: string | null) {
        runInAction(() => {
            this.error = error;
        });
    }

    // Update LLM selection for a member
    updateLLMSelection(memberId: string, llms: LargeLanguageModel[]) {
        runInAction(() => {
            const member = this.members.get(memberId);
            if (member) {
                this.members.set(memberId, { ...member, llmsSelected: llms });
            }
        });
    }

    // Update message branches for a member
    updateMessageBranches(memberId: string, branches: Record<string, boolean>) {
        runInAction(() => {
            const member = this.members.get(memberId);
            if (member) {
                this.members.set(memberId, { ...member, messageBranches: branches });
            }
        });
    }

    // Toggle message branch visibility
    toggleMessageBranch(memberId: string, messageId: string) {
        runInAction(() => {
            const member = this.members.get(memberId);
            if (member) {
                const newBranches = { ...member.messageBranches };
                newBranches[messageId] = !newBranches[messageId];
                this.members.set(memberId, { ...member, messageBranches: newBranches });
            }
        });
    }

    // Toggle member visibility
    toggleMemberVisibility(memberId: string) {
        runInAction(() => {
            const member = this.members.get(memberId);
            if (member) {
                this.members.set(memberId, { ...member, hidden: !member.hidden });
            }
        });
    }

    // Computed getters
    get allMembers(): MemberSchema[] {
        return Array.from(this.members.values());
    }

    get visibleMembers(): MemberSchema[] {
        return this.allMembers.filter((member) => !member.hidden);
    }

    get hiddenMembers(): MemberSchema[] {
        return this.allMembers.filter((member) => member.hidden);
    }

    get membersByConversation() {
        const grouped = new Map<string, MemberSchema[]>();
        this.members.forEach((member) => {
            const conversationId = member.conversationId;
            if (!grouped.has(conversationId)) {
                grouped.set(conversationId, []);
            }
            grouped.get(conversationId)!.push(member);
        });
        return grouped;
    }

    getMembersByConversationId(conversationId: string): MemberSchema[] {
        return this.membersByConversation.get(conversationId) || [];
    }

    getVisibleMembersByConversationId(conversationId: string): MemberSchema[] {
        return this.getMembersByConversationId(conversationId).filter((member) => !member.hidden);
    }

    getMember(memberId: string): MemberSchema | undefined {
        return this.members.get(memberId);
    }

    getMembersByUserId(userId: string): MemberSchema[] {
        return this.allMembers.filter((member) => member.userId === userId);
    }

    getMembersByAddedBy(addedById: string): MemberSchema[] {
        return this.allMembers.filter((member) => member.addedById === addedById);
    }

    // Find member by user and conversation
    getMemberByUserAndConversation(
        userId: string,
        conversationId: string
    ): MemberSchema | undefined {
        return this.allMembers.find(
            (member) => member.userId === userId && member.conversationId === conversationId
        );
    }

    // Check if message branch is visible for a member
    isBranchVisible(memberId: string, messageId: string): boolean {
        const member = this.members.get(memberId);
        if (!member) return false;
        return member.messageBranches[messageId] ?? false;
    }

    // Get all selected LLMs across all members
    get allSelectedLLMs(): LargeLanguageModel[] {
        const llmSet = new Set<LargeLanguageModel>();
        this.members.forEach((member) => {
            member.llmsSelected.forEach((llm) => llmSet.add(llm));
        });
        return Array.from(llmSet);
    }

    // Database persistence methods
    async loadFromDatabase(): Promise<void> {
        try {
            this.setLoading(true);
            const members = await db.members.toArray();
            this.setMembers(members as MemberSchema[]);
        } catch (error) {
            this.setError(error instanceof Error ? error.message : "Failed to load members");
        } finally {
            this.setLoading(false);
        }
    }

    async saveToDatabase(member: MemberSchema): Promise<void> {
        try {
            await db.members.put(member);
            this.addMember(member);
        } catch (error) {
            this.setError(error instanceof Error ? error.message : "Failed to save member");
        }
    }

    async saveAllToDatabase(): Promise<void> {
        try {
            const members = Array.from(this.members.values());
            await db.members.bulkPut(members);
        } catch (error) {
            this.setError(error instanceof Error ? error.message : "Failed to save members");
        }
    }

    async deleteFromDatabase(memberId: string): Promise<void> {
        try {
            await db.members.delete(memberId);
            this.removeMember(memberId);
        } catch (error) {
            this.setError(error instanceof Error ? error.message : "Failed to delete member");
        }
    }
}
