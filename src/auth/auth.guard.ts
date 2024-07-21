import {CanActivate, ExecutionContext, Injectable, UnauthorizedException} from "@nestjs/common";
import {Reflector} from "@nestjs/core";
import {Request} from "express";
import CryptoService from "../crypto/crypto.service";
import {IS_PUBLIC_KEY} from "./auth.public";

@Injectable()
export class AuthGuard implements CanActivate {
    constructor(private cryptoService: CryptoService, private reflector: Reflector) {
    }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);
        if (isPublic) {
            return true;
        }

        const request = context.switchToHttp().getRequest();
        const token = this.extractTokenFromHeader(request);
        if (!token) {
            throw new UnauthorizedException();
        }
        const userFromJwt = await this.cryptoService.decodeAccessJwt(token);
        if (!userFromJwt) {
            throw new UnauthorizedException();
        }
        request['user'] = userFromJwt;

        return true;
    }

    private extractTokenFromHeader(request: Request): string | undefined {
        const [type, token] = request.headers.authorization?.split(" ") ?? [];
        return type === "Bearer" ? token : undefined;
    }
}