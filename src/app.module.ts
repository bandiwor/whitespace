import {Module} from "@nestjs/common";
import {ConfigModule} from "@nestjs/config";
import {EventEmitterModule} from "@nestjs/event-emitter";
import AuthModule from "./auth/auth.module";
import ChatModule from "./chat/chat.module";
import GatewayModule from "./gateway/gateway.module";
import ProfileModule from "./profile/profile.module";
import TelegramModule from "./telegram/telegram.module";

@Module({
    imports: [
        EventEmitterModule.forRoot(),
        AuthModule,
        GatewayModule,
        ProfileModule,
        ChatModule,
        TelegramModule,
        ConfigModule.forRoot({
            isGlobal: true,
        }),
    ],
})
export class AppModule {
}
