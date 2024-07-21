import {Injectable, NotFoundException} from "@nestjs/common";
import {FastifyRequest} from "fastify";
import {JwtPayload} from "../crypto/jwt-constants";
import {PrismaService} from "../prisma/prisma.service";


@Injectable()
export default class ProfileService {
    constructor(private readonly prismaService: PrismaService) {
    }

    async me(req: FastifyRequest) {
        const user: JwtPayload = req["user"];
        const myProfile = await this.prismaService.profile.findUnique({
            where: {
                id: user.profileId
            },
        })
        if (!myProfile) {
            throw new NotFoundException("Profile not found");
        }

        return {
            ok: true,
            profile: myProfile
        };
    }

    async updateLastSeenAt(profileId: number) {
        await this.prismaService.profile.update({
            where: {
                id: profileId,
            },
            data: {
                lastSeenAt: new Date(),
            }
        })

        return {
            ok: true,
        }
    }
}