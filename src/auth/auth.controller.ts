import {
    Body,
    Controller,
    Get,
    HttpCode,
    HttpStatus,
    Post,
    Query,
    Req,
    Res,
    UsePipes,
    ValidationPipe,
} from "@nestjs/common";
import {FastifyReply, FastifyRequest} from "fastify";
import AuthService from "./auth.service";
import CreateProfileDto from "./dto/create-profile.dto";
import LoginDto from "./dto/login.dto";
import RefreshDto from "./dto/refresh.dto";
import RegisterDto from "./dto/register.dto";


@Controller("auth")
export class AuthController {
    constructor(private readonly authService: AuthService) {
    }

    @HttpCode(HttpStatus.OK)
    @Get("csrf-token")
    async getCsrfToken(@Res() reply: FastifyReply) {
        const token = reply.generateCsrf();

        reply.send({
            csrfToken: token,
        });
    }

    @HttpCode(HttpStatus.OK)
    @Get("register")
    @UsePipes(new ValidationPipe({
        transform: true,
    }))
    async registerGet(@Query() dto: RegisterDto) {
        return this.authService.register(dto);
    }

    @HttpCode(HttpStatus.OK)
    @Post("register")
    @UsePipes(new ValidationPipe({
        transform: true,
    }))
    async registerPost(@Body() dto: RegisterDto) {
        return this.authService.register(dto);
    }

    @HttpCode(HttpStatus.OK)
    @Get("create-profile")
    @UsePipes(new ValidationPipe({
        transform: true,
    }))
    async createProfileGet(@Query() dto: CreateProfileDto) {
        return this.authService.createProfile(dto);
    }

    @HttpCode(HttpStatus.OK)
    @Post("create-profile")
    @UsePipes(new ValidationPipe({
        transform: true,
    }))
    async createProfilePost(@Body() dto: CreateProfileDto) {
        return this.authService.createProfile(dto);
    }

    @HttpCode(HttpStatus.OK)
    @Get("login")
    @UsePipes(new ValidationPipe({
        transform: true,
    }))
    async loginGet(@Query() dto: LoginDto, @Req() req: FastifyRequest) {
        return this.authService.login(req, dto);
    }

    @HttpCode(HttpStatus.OK)
    @Post("login")
    @UsePipes(new ValidationPipe({
        transform: true,
    }))
    async loginPost(@Body() dto: LoginDto, @Req() req: FastifyRequest) {
        return this.authService.login(req, dto);
    }

    @HttpCode(HttpStatus.OK)
    @Get("refresh")
    @UsePipes(new ValidationPipe({
        transform: true,
    }))
    async refreshGet(@Query() dto: RefreshDto) {
        return this.authService.refresh(dto);
    }

    @HttpCode(HttpStatus.OK)
    @Post("refresh")
    @UsePipes(new ValidationPipe({
        transform: true,
    }))
    async refreshPost(@Body() dto: RefreshDto) {
        return this.authService.refresh(dto);
    }
}