import {
    BadRequestException,
    Body,
    Controller,
    Get,
    HttpCode,
    HttpStatus,
    Post,
    Query,
    Req,
    UseGuards,
    UsePipes,
    ValidationPipe,
} from "@nestjs/common";
import {FastifyRequest} from "fastify";
import {AuthGuard} from "../auth/auth.guard";
import ChatService from "./chat.service";
import GetChatsDto from "./dto/get-chats.dto";
import GetMessagesDto from "./dto/get-messages.dto";
import OpenChatDto from "./dto/open-chat.dto";
import OpenPrivateChatDto from "./dto/open-private-chat.dto";
import SearchChatsDto from "./dto/search-chats.dto";
import {SendTextDto} from "./dto/send-text.dto";
import {SendVoiceDto} from "./dto/send-voice.dto";

@UseGuards(AuthGuard)
@Controller("chats")
export default class ChatController {
    constructor(private readonly chatService: ChatService) {
    }

    @HttpCode(HttpStatus.OK)
    @Get("get-chats")
    @UsePipes(new ValidationPipe({
        transform: true,
    }))
    async getChatsGet(@Query() dto: GetChatsDto, @Req() req: FastifyRequest) {
        return this.chatService.getUserChats(req, dto);
    }

    @HttpCode(HttpStatus.OK)
    @Post("get-chats")
    @UsePipes(new ValidationPipe())
    async getChatsPost(@Body() dto: GetChatsDto, @Req() req: FastifyRequest) {
        return this.chatService.getUserChats(req, dto);
    }

    @HttpCode(HttpStatus.OK)
    @Get("get-messages")
    @UsePipes(new ValidationPipe())
    async getMessagesGet(@Query() dto: GetMessagesDto, @Req() req: FastifyRequest) {
        return this.chatService.getMessages(req, dto);
    }

    @HttpCode(HttpStatus.OK)
    @Post("get-messages")
    @UsePipes(new ValidationPipe())
    async getMessagesPost(@Body() dto: GetMessagesDto, @Req() req: FastifyRequest) {
        return this.chatService.getMessages(req, dto);
    }

    @HttpCode(HttpStatus.OK)
    @Get("open-chat")
    @UsePipes(new ValidationPipe())
    async openChatGet(@Query() dto: OpenChatDto, @Req() req: FastifyRequest) {
        return this.chatService.openChat(req, dto);
    }

    @HttpCode(HttpStatus.OK)
    @Post("open-chat")
    @UsePipes(new ValidationPipe())
    async openChatPost(@Body() dto: OpenChatDto, @Req() req: FastifyRequest) {
        return this.chatService.openChat(req, dto);
    }

    @HttpCode(HttpStatus.OK)
    @Get("open-private-chat")
    @UsePipes(new ValidationPipe())
    async openPrivateChatGet(@Query() dto: OpenPrivateChatDto, @Req() req: FastifyRequest) {
        return this.chatService.openPrivateChat(req, dto);
    }

    @HttpCode(HttpStatus.OK)
    @Post("open-private-chat")
    @UsePipes(new ValidationPipe())
    async openPrivateChatPost(@Body() dto: OpenPrivateChatDto, @Req() req: FastifyRequest) {
        return this.chatService.openPrivateChat(req, dto);
    }

    @HttpCode(HttpStatus.OK)
    @Get("search-chats")
    @UsePipes(new ValidationPipe())
    async searchChatsGet(@Query() dto: SearchChatsDto, @Req() req: FastifyRequest) {
        return this.chatService.searchPublicChats(req, dto);
    }

    @HttpCode(HttpStatus.OK)
    @Post("search-chats")
    @UsePipes(new ValidationPipe())
    async searchChatsPost(@Body() dto: SearchChatsDto, @Req() req: FastifyRequest) {
        return this.chatService.searchPublicChats(req, dto);
    }

    @HttpCode(HttpStatus.OK)
    @Get("search-users")
    @UsePipes(new ValidationPipe())
    async searchUsersGet(@Query() dto: SearchChatsDto, @Req() req: FastifyRequest) {
        return this.chatService.searchUsers(req, dto);
    }

    @HttpCode(HttpStatus.OK)
    @Post("search-users")
    @UsePipes(new ValidationPipe())
    async searchUsersPost(@Body() dto: SearchChatsDto, @Req() req: FastifyRequest) {
        return this.chatService.searchUsers(req, dto);
    }

    @HttpCode(HttpStatus.OK)
    @Get("send-text")
    @UsePipes(new ValidationPipe())
    async sendTextGet(@Query() dto: SendTextDto, @Req() req: FastifyRequest) {
        return this.chatService.sendText(req, dto);
    }

    @HttpCode(HttpStatus.OK)
    @Post("send-text")
    @UsePipes(new ValidationPipe())
    async sendTextPost(@Body() dto: SendTextDto, @Req() req: FastifyRequest) {
        return this.chatService.sendText(req, dto);
    }

    @HttpCode(HttpStatus.OK)
    @Post("send-voice")
    @UsePipes(new ValidationPipe())
    async sendVoicePost(@Query() dto: SendVoiceDto, @Req() req: FastifyRequest) {
        const file = await req.file();
        if (!file) {
            throw new BadRequestException("File is missing.");
        }
        return this.chatService.sendVoice(req, dto, file);
    }
}