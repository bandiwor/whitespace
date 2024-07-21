import {Message} from "@prisma/client";

export class MessageSentEvent {
    constructor(
        public readonly message: Message,
    ) {}
}