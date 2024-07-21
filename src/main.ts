import fastifyCompress from "@fastify/compress";
import fastifyCookie from "@fastify/cookie";
import fastifyCsrfProtection from "@fastify/csrf-protection";
import fastifyMultipart from "@fastify/multipart";
import {NestFactory} from "@nestjs/core";
import {FastifyAdapter, NestFastifyApplication} from "@nestjs/platform-fastify";
import {IoAdapter} from "@nestjs/platform-socket.io";
import helmet from "helmet";
import {join} from "path";
import {AppModule} from "./app.module";

async function bootstrap() {
    const app = await NestFactory.create<NestFastifyApplication>(AppModule, new FastifyAdapter());
    app.use(helmet());

    // Register static assets
    app.useStaticAssets({
        root: join(__dirname, "..", "static"),
        prefix: "/static/",
    });

    // Register fastify plugins
    await app.register(fastifyCompress, {
        encodings: ["gzip", "deflate"],
    });
    await app.register(fastifyCookie);
    await app.register(fastifyCsrfProtection);
    await app.register(fastifyMultipart, {
        limits: {
            fileSize: 10000000, // 10 MB limit
            fieldNameSize: 128,
        },
    });

    // Enable CORS
    app.enableCors({
        origin: true,
        credentials: true,
    });

    // Use WebSocket adapter
    app.useWebSocketAdapter(new IoAdapter(app));

    // Start the application
    await app.listen(3000);
}

void bootstrap();
