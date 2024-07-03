import {Module} from "@nestjs/common";
import {TelegrafModule} from "nestjs-telegraf";
import {PrismaModule} from "../prisma/prisma.module";
import {options} from "./telegraf-config.factory";
import TelegramUpdate from "./telegram.update";

@Module({
    providers: [TelegramUpdate],
    imports: [TelegrafModule.forRootAsync(options()), PrismaModule],
})
export default class TelegramModule {
}