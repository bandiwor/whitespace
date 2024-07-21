import {BadRequestException, ConflictException, Injectable, UnauthorizedException} from "@nestjs/common";
import {createId} from "@paralleldrive/cuid2";
import {FastifyRequest} from "fastify";
import CryptoService from "../crypto/crypto.service";
import {accessExpiresIn, refreshExpiresIn} from "../crypto/jwt-constants";
import {PrismaService} from "../prisma/prisma.service";
import capitalizeFirst from "../utils/capitalizeFirst";
import cleanPhoneNumber from "../utils/cleanPhoneNumber";
import isValidDateOfBirth from "../utils/isValidDateOfBirth";
import CreateProfileDto from "./dto/create-profile.dto";
import LoginDto from "./dto/login.dto";
import LogoutDto from "./dto/logout.dto";
import RefreshDto from "./dto/refresh.dto";
import RegisterDto from "./dto/register.dto";
import {UserAgentService} from "./useragent.service";


@Injectable()
export default class AuthService {
    constructor(
        private readonly prismaService: PrismaService,
        private readonly cryptoService: CryptoService,
        private readonly userAgentService: UserAgentService,
    ) {
    }

    async register({telephone, password}: RegisterDto) {
        const existsUser = await this.prismaService.user.findUnique({
            where: {
                telephone: cleanPhoneNumber(telephone),
            },
        });

        if (existsUser && (existsUser.telephoneVerified || existsUser.profileCreated)) {
            throw new ConflictException("Такой пользователь уже существует.");
        }
        // Exists user -> user where <|telephoneVerified == false|> & <|profileCreated == false|>

        const passwordHash = await this.cryptoService.hash(password);
        const code = createId() + createId();

        if (!existsUser) {
            await this.prismaService.user.create({
                data: {
                    telephone: cleanPhoneNumber(telephone),
                    passwordHash,
                    telephoneVerificationCode: code,
                },
            });
        } else {
            await this.prismaService.user.update({
                where: {
                    id: existsUser.id,
                },
                data: {
                    passwordHash,
                    telephoneVerificationCode: code,
                },
            });
        }

        return {ok: true, code};
    }

    async createProfile(dto: CreateProfileDto) {
        const existsUser = await this.prismaService.user.findUnique({
            where: {
                telephone: cleanPhoneNumber(dto.telephone),
            },
        });

        if (!existsUser) {
            throw new BadRequestException("Пользователь не найден, либо пароль не верен");
        }

        if (!await this.cryptoService.compareHash(dto.password, existsUser.passwordHash)) {
            throw new BadRequestException("Пользователь не найден, либо пароль не верен");
        }

        if (existsUser.profileCreated) {
            throw new ConflictException("Профиль уже создан");
        }

        if (!existsUser.telephoneVerified) {
            throw new BadRequestException("Номер телефона не верифицирован в нашем телеграм-боте, Вы можете пройти регистрацию заново");
        }

        if (dto.dateOfBirth && !isValidDateOfBirth(dto.dateOfBirth)) {
            throw new BadRequestException("Дата рождения указана неверно");
        }
        if (dto.username && (dto.username.startsWith("_") || dto.username.endsWith("_"))) {
            throw new BadRequestException("Ссылка-username не может начинаться или оканчиваться на символ нижнего подчеркивания.");
        }

        await this.prismaService.user.update({
            where: {
                id: existsUser.id,
            },
            data: {
                profileCreated: true,
                profile: {
                    create: {
                        firstName: capitalizeFirst(dto.firstName),
                        lastName: capitalizeFirst(dto.lastName),
                        dateOfBirth: dto.dateOfBirth,
                        gender: dto.gender,
                        username: dto.username ? dto.username.toLowerCase() : undefined,
                    },
                },
            },
        });

        return {
            ok: true,
        };
    }

    async login(req: FastifyRequest, {telephone, password}: LoginDto) {
        const user = await this.prismaService.user.findUnique({
            where: {
                telephone: cleanPhoneNumber(telephone),
            },
            include: {
                profile: true,
            },
        });

        if (!user) {
            throw new BadRequestException("Пользователь не найден, либо пароль не верен");
        }

        if (!await this.cryptoService.compareHash(password, user.passwordHash)) {
            throw new BadRequestException("Пользователь не найден, либо пароль не верен");
        }

        if (!user.profileCreated) {
            return {
                ok: true,
                redirectTo: "CREATE-PROFILE",
            };
        }

        if (!user.telephoneVerified) {
            throw new BadRequestException("Номер телефона не верифицирован в нашем телеграм-боте, Вы можете пройти регистрацию заново");
        }

        const uaParsed = this.userAgentService.parse(req);
        const ip = this.userAgentService.getClientIp(req);

        const refreshExpiresAt = new Date(Date.now() + (+refreshExpiresIn.slice(0, -1)) * 1000);
        const accessExpiresAT = new Date(Date.now() + (+accessExpiresIn.slice(0, -1)) * 1000);

        const newSession = await this.prismaService.session.create({
            data: {
                user: {
                    connect: {
                        id: user.id,
                    },
                },
                device: uaParsed.device,
                browser: uaParsed.browser,
                os: uaParsed.os,
                userAgent: req.headers["user-agent"],
                ip,
                expiresAt: refreshExpiresAt,
            },
        });

        const {accessJwt, refreshJwt} = await this.cryptoService.signPairJwt({
            sub: user.id,
            userId: user.id,
            profileId: user.profile.id,
            sessionId: newSession.id,
        });

        await this.prismaService.session.update({
            where: {
                id: newSession.id,
            },
            data: {
                refreshToken: refreshJwt,
            },
        });

        return {
            ok: true,
            refresh: {
                expires: refreshExpiresAt,
                token: refreshJwt,
            },
            access: {
                expires: accessExpiresAT,
                token: accessJwt,
            },
        };
    }

    async refresh({refreshJWT: oldRefreshJwt}: RefreshDto) {
        const decodedJwt = await this.cryptoService.decodeRefreshJwt(oldRefreshJwt);
        if (!decodedJwt) {
            throw new BadRequestException("Refresh JWT invalid or expires");
        }

        const session = await this.prismaService.session.findUnique({
            where: {
                id: decodedJwt.sessionId,
                refreshToken: oldRefreshJwt,
            },
        });
        if (!session) {
            throw new UnauthorizedException("Session deleted or expires");
        }

        const {accessJwt, refreshJwt} = await this.cryptoService.signPairJwt({
            sub: decodedJwt.sub,
            sessionId: decodedJwt.sessionId,
            profileId: decodedJwt.profileId,
            userId: decodedJwt.userId,
        });

        const refreshExpiresAt = new Date(Date.now() + (+refreshExpiresIn.slice(0, -1)) * 1000);
        const accessExpiresAT = new Date(Date.now() + (+accessExpiresIn.slice(0, -1)) * 1000);

        await this.prismaService.session.update({
            where: {
                id: session.id,
            },
            data: {
                refreshToken: refreshJwt,
                expiresAt: refreshExpiresAt,
            },
        });

        return {
            ok: true,
            refresh: {
                expires: refreshExpiresAt,
                token: refreshJwt,
            },
            access: {
                expires: accessExpiresAT,
                token: accessJwt,
            },
        };
    }

    async logout({refreshJWT}: LogoutDto) {
        const decodedJwtRefresh = await this.cryptoService.decodeRefreshJwt(refreshJWT);
        if (!decodedJwtRefresh) {
            throw new UnauthorizedException("Invalid refresh jwt");
        }

        const existsSession = await this.prismaService.session.findUnique({
            where: {
                id: decodedJwtRefresh.sessionId,
            },
        });
        if (!existsSession) {
            throw new UnauthorizedException("Session not found");
        }

        await this.prismaService.session.delete({
            where: {
                id: existsSession.id,
            },
        });

        return {ok: true};
    }
}