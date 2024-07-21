import {Module} from "@nestjs/common";
import CryptoModule from "../crypto/crypto.module";
import {PrismaModule} from "../prisma/prisma.module";
import ChatController from "./chat.controller";
import ChatService from "./chat.service";

@Module({
    imports: [PrismaModule, CryptoModule],
    providers: [ChatService],
    controllers: [ChatController],
})
export default class ChatModule {}