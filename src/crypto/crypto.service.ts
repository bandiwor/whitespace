import {Injectable} from "@nestjs/common";
import {JwtService} from "@nestjs/jwt";
import * as bcrypt from "bcrypt";
import {accessExpiresIn, accessSecret, JwtPayload, refreshExpiresIn, refreshSecret} from "./jwt-constants";

@Injectable()
export default class CryptoService {
    constructor(private readonly jwtService: JwtService) {
    }

    async hash(data: string) {
        return await bcrypt.hash(data, 10);
    }

    async compareHash(data: string, hash: string) {
        return await bcrypt.compare(data, hash);
    }

    async signPairJwt(payload: JwtPayload) {
        const [accessJwt, refreshJwt] = await Promise.all([
            this.signAccessJwt(payload),
            this.signRefreshJwt(payload),
        ])

        return {accessJwt, refreshJwt};
    }

    async signAccessJwt({sub: subject, ...payload}: JwtPayload) {
        return this.jwtService.signAsync(payload, {
            expiresIn: accessExpiresIn,
            secret: accessSecret,
            subject,
        });
    }

    async decodeAccessJwt(jwt: string): Promise<JwtPayload | null> {
        try {
            return await this.jwtService.verifyAsync(jwt, {
                secret: accessSecret,
            });
        } catch {
            return null;
        }
    }

    async signRefreshJwt({sub: subject, ...payload}: JwtPayload) {
        return this.jwtService.signAsync(payload, {
            expiresIn: refreshExpiresIn,
            secret: refreshSecret,
            subject,
        })
    }

    async decodeRefreshJwt(jwt: string): Promise<JwtPayload | null> {
        try {
            return await this.jwtService.verifyAsync(jwt, {
                secret: refreshSecret,
            })
        } catch {
            return null;
        }
    }
}