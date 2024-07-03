import {CanActivate, ExecutionContext, Injectable, UnauthorizedException} from "@nestjs/common";
import {Request} from "express";
import CryptoService from "../crypto/crypto.service";

@Injectable()
export class AuthGuard implements CanActivate {
    constructor(private cryptoService: CryptoService) {
    }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        const token = this.extractTokenFromHeader(request);
        if (!token) {
            throw new UnauthorizedException();
        }
        try {
            request["user"] = await this.cryptoService.decodeAccessJwt(token);
        } catch (e) {
            console.log(e);
            throw new UnauthorizedException();
        }
        return true;
    }

    private extractTokenFromHeader(request: Request): string | undefined {
        const [type, token] = request.headers.authorization?.split(" ") ?? [];
        return type === "Bearer" ? token : undefined;
    }
}