import {Module} from "@nestjs/common";
import {ConfigModule} from "@nestjs/config";
import AuthModule from "./auth/auth.module";
import TelegramModule from "./telegram/telegram.module";

@Module({
    imports: [
        AuthModule,
        TelegramModule,
        ConfigModule.forRoot({
            isGlobal: true,
        }),
    ],
})
export class AppModule {
}
