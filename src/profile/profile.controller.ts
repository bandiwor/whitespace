import {Controller, Get, Req, UseGuards} from "@nestjs/common";
import {FastifyRequest} from "fastify";
import {AuthGuard} from "../auth/auth.guard";
import ProfileService from "./profile.service";

@UseGuards(AuthGuard)
@Controller("profile")
export default class ProfileController {
    constructor(private readonly profileService: ProfileService) {
    }

    @Get('my')
    async getMe(@Req() req: FastifyRequest) {
        return this.profileService.me(req);
    }

}