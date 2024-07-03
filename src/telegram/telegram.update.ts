import {ConfigService} from "@nestjs/config";
import {Ctx, Message, On, Start, Update} from "nestjs-telegraf";
import {Scenes, Telegraf} from "telegraf";

import type {Contact} from "telegraf/types"
import {PrismaService} from "../prisma/prisma.service";
import cleanPhoneNumber from "../utils/cleanPhoneNumber";

interface Context extends Scenes.SceneContext {
}


@Update()
export default class TelegramUpdate extends Telegraf<Context> {
    constructor(private readonly configService: ConfigService, private readonly prismaService: PrismaService) {
        super(configService.get('TELEGRAM_BOT_TOKEN'));
    }


    @Start()
    async onStart(@Ctx() ctx: Context) {
        if (typeof ctx.message['text'] !== 'string') {
            await ctx.reply('Пропущен токен идентификации. Убедитесь, что вы запустили бота по правильной ссылке.');
            return;
        }
        const token = ctx.message['text'].split(' ').at(-1);

        const existsUserWithToken = await this.prismaService.user.findFirst({
            where: {
                telephoneVerificationCode: token,
                telegramId: null
            }
        })
        if (!existsUserWithToken) {
            await ctx.reply('❌ Токен идентификации не валиден. Убедитесь, что вы запустили бота по правильной ссылке.')
            return;
        }

        await this.prismaService.user.update({
            where: {
                id: existsUserWithToken.id
            },
            data: {
                telegramId: ctx.from.id.toString(),
                telephoneVerificationCode: null,
            }
        })

        await ctx.replyWithHTML(`✅Успешно\n\n🆔<b>Теперь нажмите на кнопку, </b>чтобы отправить свой <b>КОНТАКТ</b> для вашей идентификации.`, {
            reply_markup: {
                one_time_keyboard: true,
                keyboard: [
                    [{text: '✉️ ОТПРАВИТЬ КОНТАКТ 📱', request_contact: true}]
                ],
                resize_keyboard: true
            }
        })
    }

    @On('contact')
    async onContact(@Ctx() ctx: Context, @Message('contact') contact: Contact) {
        const telephoneNumber = cleanPhoneNumber(contact.phone_number);

        if (!contact.user_id || contact.user_id !== ctx.from.id) {
            await ctx.replyWithHTML(`❌ Присланный вами контакт не имеет telegram id, либо это не Ваш контакт.`)
            return;
        }

        const existsUser = await this.prismaService.user.findUnique({
            where: {
                telephone: telephoneNumber,
                telegramId: ctx.from.id.toString(),
                telephoneVerified: false
            }
        });

        if (!existsUser) {
            await ctx.replyWithHTML(`❌ Пользователь с номером телефона <code>+${telephoneNumber}</code> не найден.`);
            return;
        }

        await this.prismaService.user.update({
            where: {
                id: existsUser.id
            },
            data: {
                telephoneVerified: true,
            }
        })

        await ctx.replyWithHTML(`✅ Номер телефона верифицирован. <b>Возвращайтесь на сайт.</b>`);
    }

    @On('text')
    async onText(@Ctx() ctx: Context) {
        await ctx.reply('Я пока что не понимаю, что вы хотите от меня ☹️.\nЭтот бот используется сайтом WhiteSpace-социальная сеть для верификации номера телефона.\nЧтобы пройти верификацию вы должны перейти по ссылке при регистрации на сайте, и запустить этого бота.')
    }
}
