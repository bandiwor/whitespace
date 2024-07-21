import {Module} from "@nestjs/common";
import CryptoModule from "../crypto/crypto.module";
import {PrismaModule} from "../prisma/prisma.module";
import ProfileController from "./profile.controller";
import ProfileService from "./profile.service";

@Module({
    imports: [PrismaModule, CryptoModule],
    providers: [ProfileService],
    controllers: [ProfileController],
    exports: [ProfileService],
})
export default class ProfileModule {}