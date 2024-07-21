import {Chat, Profile} from "@prisma/client";

type Companion = Omit<Profile, "createdAt" | "updatedAt" | "userId">


export class PrivateChatOpenedEvent {
    constructor(
        public readonly chat: Chat & { profile: Companion },
        public readonly targetProfileId: number
    ) {
    }
}