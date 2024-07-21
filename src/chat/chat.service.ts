import {MultipartFile} from "@fastify/multipart";
import {BadRequestException, Injectable, NotFoundException} from "@nestjs/common";
import {EventEmitter2} from "@nestjs/event-emitter";
import {FastifyRequest} from "fastify";
import {writeFile} from "fs/promises";
import {join, extname} from "path";
import {JwtPayload} from "../crypto/jwt-constants";
import {MessageSentEvent} from "../events/message-sent.event";
import {PrivateChatOpenedEvent} from "../events/private-chat-opened.event";
import {PrismaService} from "../prisma/prisma.service";
import GetChatsDto from "./dto/get-chats.dto";
import GetMessagesDto from "./dto/get-messages.dto";
import JoinChatDto from "./dto/join-chat.dto";
import OpenChatDto from "./dto/open-chat.dto";
import OpenPrivateChatDto from "./dto/open-private-chat.dto";
import SearchChatsDto from "./dto/search-chats.dto";
import {SendTextDto} from "./dto/send-text.dto";
import {SendVoiceDto} from "./dto/send-voice.dto";


@Injectable()
export default class ChatService {
    constructor(private readonly prismaService: PrismaService, private readonly eventEmitter: EventEmitter2) {
    }

    async getUserChats(req: FastifyRequest, {take, skip}: GetChatsDto) {
        const decodedJwt: JwtPayload = req["user"];

        const chats = await this.prismaService.chat.findMany({
            where: {
                participants: {
                    some: {
                        profile: {
                            id: decodedJwt.profileId,
                        },
                    },
                },
            },
            include: {
                participants: {
                    take: 1,
                    where: {
                        profileId: {
                            not: decodedJwt.profileId,
                        },
                    },
                    select: {
                        profile: {
                            select: {
                                id: true,
                                firstName: true,
                                lastName: true,
                                gender: true,
                                dateOfBirth: true,
                                statusText: true,
                                avatarUrl: true,
                                username: true,
                                lastSeenAt: true,
                            },
                        },
                    },
                },
                messages: {
                    take: 1,
                    orderBy: {
                        createdAt: "desc",
                    },
                },
            },
            skip,
            take,
        });

        return {
            ok: true,
            chats: chats.map(({participants, ...chat}) => {
                if (chat.type === "PRIVATE") {
                    return {
                        ...chat,
                        profile: participants[0].profile,
                    };
                }
                return chat;
            }),
        };
    }

    async searchPublicChats(req: FastifyRequest, {take, skip, query}: SearchChatsDto) {
        const decodedJwt: JwtPayload = req["user"];

        const chats = await this.prismaService.chat.findMany({
            where: {
                type: {
                    in: ["GROUP", "CHANNEL"],
                },
                name: {
                    contains: query,
                },
                participants: {
                    none: {
                        profile: {
                            id: decodedJwt.profileId,
                        },
                    },
                },
            },
            skip,
            take,
        });

        return {
            ok: true,
            chats,
        };
    }

    async searchUsers(req: FastifyRequest, {take, skip, query}: SearchChatsDto) {
        const decodedJwt: JwtPayload = req["user"];
        const queryParts = query?.split(" ") || [];
        const [firstNameQuery, lastNameQuery] = queryParts;

        const users = await this.prismaService.profile.findMany({
            where: {
                id: {
                    not: decodedJwt.profileId,
                },
                OR: [
                    {
                        username: {
                            contains: query,
                            mode: "insensitive",
                        },
                    },
                    {
                        AND: [
                            {firstName: {contains: firstNameQuery, mode: "insensitive"}},
                            {lastName: {contains: lastNameQuery, mode: "insensitive"}},
                        ],
                    },
                    {
                        AND: [
                            {firstName: {contains: lastNameQuery, mode: "insensitive"}},
                            {lastName: {contains: firstNameQuery, mode: "insensitive"}},
                        ],
                    },
                ],
                chatParticipant: {
                    none: {
                        chat: {
                            type: "PRIVATE",
                            participants: {
                                some: {
                                    profileId: decodedJwt.profileId,
                                },
                            },
                        },
                    },
                },
            },
            skip,
            take,
            select: {
                id: true,
                firstName: true,
                lastName: true,
                username: true,
                statusText: true,
                dateOfBirth: true,
                avatarUrl: true,
                gender: true,
                lastSeenAt: true,
            },
        });

        return {
            ok: true,
            users,
        };
    }

    async openChat(req: FastifyRequest, {chatId}: OpenChatDto) {
        const decodedJwt: JwtPayload = req["user"];

        const foundChat = await this.prismaService.chat.findUnique({
            where: {
                id: chatId,
                participants: {
                    some: {
                        profileId: decodedJwt.profileId,
                    },
                },
            },
            include: {
                messages: {
                    orderBy: {createdAt: "desc"},
                    take: 100,
                },
                participants: {
                    take: 1,
                    where: {
                        profileId: {
                            not: decodedJwt.profileId,
                        },
                    },
                    select: {
                        profile: {
                            select: {
                                id: true,
                                firstName: true,
                                lastName: true,
                                gender: true,
                                dateOfBirth: true,
                                statusText: true,
                                avatarUrl: true,
                                username: true,
                                lastSeenAt: true,
                            },
                        },
                    },
                },
            },
        });
        if (!foundChat) {
            throw new NotFoundException("Chat not found");
        }
        const {participants, ...chat} = foundChat;

        chat.messages.reverse();

        if (chat.type === "PRIVATE") {
            return {
                ok: true,
                chat: {
                    ...chat,
                    profile: participants[0].profile,
                },
            };
        }

        return {
            ok: true,
            chat,
        };
    }

    async getMessages(req: FastifyRequest, {chatId, take, skip}: GetMessagesDto) {
        const decodedJwt: JwtPayload = req["user"];

        const chat = await this.prismaService.chat.findFirst({
            where: {
                id: chatId,
                participants: {
                    some: {
                        profileId: decodedJwt.profileId,
                    },
                },
            },
        });

        if (!chat) {
            throw new BadRequestException("User not part of this chat");
        }

        const messages = await this.prismaService.message.findMany({
            where: {chatId},
            orderBy: {createdAt: "desc"},
            skip,
            take,
        });

        return {
            ok: true,
            messages,
        };
    }

    async openPrivateChat(req: FastifyRequest, {targetProfileId}: OpenPrivateChatDto) {
        const decodedJwt: JwtPayload = req["user"];

        if (decodedJwt.profileId === targetProfileId) {
            throw new BadRequestException("The target profile ID cannot be your profile ID");
        }

        let chat = await this.prismaService.chat.findFirst({
            where: {
                type: "PRIVATE",
                participants: {
                    every: {
                        OR: [
                            {profile: {id: decodedJwt.profileId}},
                            {profile: {id: targetProfileId}},
                        ],
                    },
                },
            },
        });

        if (!chat) {
            try {
                const newChat = await this.prismaService.chat.create({
                    data: {
                        type: "PRIVATE",
                        participants: {
                            create: [
                                {
                                    profile: {
                                        connect: {
                                            id: targetProfileId,
                                        },
                                    },
                                },
                                {
                                    profile: {
                                        connect: {
                                            id: decodedJwt.profileId,
                                        },
                                    },
                                },
                            ],
                        },
                    },
                    include: {
                        participants: {
                            take: 1,
                            where: {
                                profileId: {
                                    not: decodedJwt.profileId,
                                },
                            },
                            select: {
                                profile: {
                                    select: {
                                        id: true,
                                        firstName: true,
                                        lastName: true,
                                        gender: true,
                                        dateOfBirth: true,
                                        statusText: true,
                                        avatarUrl: true,
                                        username: true,
                                        lastSeenAt: true,
                                    },
                                },
                            },
                        },
                    },
                });
                const {participants, ...data} = newChat;

                const chatEvent = new PrivateChatOpenedEvent({
                    ...data,
                    profile: participants[0].profile,
                }, targetProfileId);
                console.log("emit", chatEvent);

                await this.eventEmitter.emitAsync("chat.private-opened", chatEvent);

                chat = newChat;
            } catch {
                throw new BadRequestException("Profile not found");
            }
        }

        return {
            ok: true,
            chat,
        };
    }

    async joinChat(req: FastifyRequest, {chatId}: JoinChatDto) {
        const decodedJwt: JwtPayload = req["user"];

        const chat = await this.prismaService.chat.findUnique({
            where: {
                id: chatId,
            },
            include: {
                participants: true,
            },
        });

        if (!chat) {
            throw new NotFoundException("Chat not found.");
        }

        if (chat.type !== "GROUP" && chat.type !== "CHANNEL") {
            throw new BadRequestException("Cannot join private chats.");
        }

        const isAlreadyParticipant = chat.participants.some(
            (participant) => participant.profileId === decodedJwt.profileId,
        );

        if (isAlreadyParticipant) {
            throw new BadRequestException("User is already a participant of the chat.");
        }

        await this.prismaService.chatParticipant.create({
            data: {
                chatId: chat.id,
                profileId: decodedJwt.profileId,
            },
        });

        return {
            ok: true,
            message: "User has joined the chat.",
        };
    }

    async sendText(req: FastifyRequest, {chatId, content}: SendTextDto) {
        const decodedJwt: JwtPayload = req["user"];

        const existsMember = await this.prismaService.chatParticipant.findFirst({
            where: {
                chatId,
                profileId: decodedJwt.profileId,
            },
        });
        if (!existsMember) {
            throw new BadRequestException("User not a part of the chat.");
        }

        const message = await this.prismaService.message.create({
            data: {
                type: "TEXT",
                chatId: chatId,
                content: content.trim(),
                profileId: decodedJwt.profileId,
            },
        });

        const event = new MessageSentEvent(message);
        await this.eventEmitter.emitAsync("message.sent", event);

        return {
            ok: true,
            message,
        };
    }

    async sendVoice(req: FastifyRequest, dto: SendVoiceDto, file: MultipartFile) {
        const decodedJwt: JwtPayload = req["user"];

        const existsMember = await this.prismaService.chatParticipant.findFirst({
            where: {
                chatId: dto.chatId,
                profileId: decodedJwt.profileId,
            },
        });
        if (!existsMember) {
            throw new BadRequestException("User not a part of the chat.");
        }

        const date = new Date();

        const filename = date.toISOString().replaceAll(':', '-') + `_${existsMember.id}_${existsMember.chatId}` + extname(file.filename);

        const filePath = join(__dirname, "..", "..", "static", filename);
        const fileBuffer = await file.toBuffer();
        await writeFile(filePath, fileBuffer);

        const message = await this.prismaService.message.create({
            data: {
                type: 'VOICE',
                chatId: dto.chatId,
                audioUrl: filename,
                profileId: decodedJwt.profileId,
            },
        });

        const event = new MessageSentEvent(message);
        await this.eventEmitter.emitAsync("message.sent", event);
    }
}