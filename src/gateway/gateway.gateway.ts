import {EventEmitter2, OnEvent} from "@nestjs/event-emitter";
import {
    ConnectedSocket,
    MessageBody,
    OnGatewayConnection,
    OnGatewayDisconnect,
    SubscribeMessage,
    WebSocketGateway,
    WebSocketServer,
} from "@nestjs/websockets";
import {Server, Socket} from "socket.io";
import {MessageSentEvent} from "../events/message-sent.event";
import {PrivateChatOpenedEvent} from "../events/private-chat-opened.event";
import {PrismaService} from "../prisma/prisma.service";
import ProfileService from "../profile/profile.service";
import GatewayService from "./gateway.service";

const chatActionsList = ["typing"] as const;

@WebSocketGateway({
    cors: {
        origin: "*",
    },
    path: "/socket.io",
})
export default class GatewayGateway implements OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer()
    server: Server;
    private activeUsers: Map<number, string> = new Map();

    constructor(
        private readonly gatewayService: GatewayService,
        private readonly eventEmitter: EventEmitter2,
        private readonly prismaService: PrismaService,
        private readonly profileService: ProfileService,
    ) {
    }

    async handleConnection(client: Socket) {
        const profileId = await this.gatewayService.getProfileIdFromJwt(client.handshake.query.accessToken as string);

        if (profileId !== null) {
            this.activeUsers.set(profileId, client.id);
            await this.profileService.updateLastSeenAt(profileId);
        } else {
            client.emit("error", "Invalid access token");
            client.disconnect(true);
        }
    }

    async handleDisconnect(client: Socket) {
        const profileId = this.getProfileIdFromClient(client);
        if (profileId) {
            this.activeUsers.delete(profileId);
            await this.profileService.updateLastSeenAt(profileId);
        }
    }

    @OnEvent("message.sent")
    async handleMessageSentEvent(event: MessageSentEvent) {
        const participants = await this.prismaService.chatParticipant.findMany({
            where: {
                chatId: event.message.chatId,
            },
            include: {
                profile: true,
            },
        });

        for (const participant of participants) {
            const clientId = this.activeUsers.get(participant.profileId);
            if (clientId) {
                this.server.to(clientId).emit("incomingMessage", event.message);
            }
        }
    }

    @OnEvent("chat.private-opened")
    async handleChatPrivateOpened(event: PrivateChatOpenedEvent) {
        const clientId = this.activeUsers.get(event.targetProfileId);

        if (clientId) {
            console.log(event.chat);
            this.server.to(clientId).emit("privateChatOpened", event.chat);
        }
    }

    @SubscribeMessage("getUserIsOnline")
    async handleGetUserIsOnline(@MessageBody("profileId") profileId: number) {
        if (!profileId || typeof profileId !== "number") {
            return false;
        }

        return this.activeUsers.has(profileId);
    }

    @SubscribeMessage("sendChatAction")
    async handleSendChatAction(@ConnectedSocket() client: Socket, @MessageBody() message?: { chatId?: unknown, actionType?: unknown }) {
        if (!message || !(typeof message.actionType === "string") || !(typeof message.chatId === "string")) {
            return;
        }

        const {chatId, actionType} = message;
        const senderId = this.getProfileIdFromClient(client);
        if (!senderId) {
            return;
        }

        const participants = await this.prismaService.chatParticipant.findMany({
            where: {
                chatId: chatId,
            },
            include: {
                profile: true,
            },
        });

        if (!participants.some(participant => participant.profileId === senderId)) {
            return;
        }

        for (const participant of participants) {
            const clientId = this.activeUsers.get(participant.profileId);
            if (clientId && participant.profileId !== senderId) {
                this.server.to(clientId).emit("chatAction", {
                    actionType,
                    senderId,
                    chatId,
                });
            }
        }
    }

    private getProfileIdFromClient(client: Socket): number | null {
        for (const [profileId, clientId] of this.activeUsers.entries()) {
            if (clientId === client.id) {
                return profileId;
            }
        }
        return null;
    }
}