import fastifyCompress from "@fastify/compress";
import fastifyCookie from "@fastify/cookie";
import fastifyCsrfProtection from "@fastify/csrf-protection";
import {NestFactory} from "@nestjs/core";
import {FastifyAdapter, NestFastifyApplication} from "@nestjs/platform-fastify";
import {AppModule} from "./app.module";
import {join} from "path";


async function bootstrap() {
    const app = await NestFactory.create<NestFastifyApplication>(AppModule, new FastifyAdapter());
    app.useStaticAssets({
        root: join(__dirname, '..', 'public'),
        prefix: "/public/",
    })
    await app.register(fastifyCompress, {
        encodings: ['gzip', 'deflate']
    });
    await app.register(fastifyCookie);
    await app.register(fastifyCsrfProtection);

    await app.listen(3000);
}

void bootstrap();
