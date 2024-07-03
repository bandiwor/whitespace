import {Module} from "@nestjs/common";
import CryptoModule from "../crypto/crypto.module";
import {PrismaModule} from "../prisma/prisma.module";
import {AuthController} from "./auth.controller";
import AuthService from "./auth.service";
import {UserAgentService} from "./useragent.service";

@Module({
    imports: [PrismaModule, CryptoModule],
    controllers: [AuthController],
    providers: [AuthService, UserAgentService],
})
export default class AuthModule {}