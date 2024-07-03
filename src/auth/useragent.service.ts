import { Injectable } from '@nestjs/common';
import {FastifyRequest} from "fastify";
import * as useragent from "useragent";

@Injectable()
export class UserAgentService {
    parse(request: FastifyRequest) {
        const agent = useragent.lookup(request.headers['user-agent']);

        return {
            browser: agent.toAgent(),
            os: agent.os.toString(),
            device: agent.device.toString(),
        };
    }

    getClientIp(request: FastifyRequest): string {
        const forwarded = request.headers['x-forwarded-for'];
        if (forwarded) {
            const forwardedIps = typeof forwarded === 'string' ? forwarded.split(',') : forwarded;
            return forwardedIps[0].trim();
        }
        return request.ip;
    }
}
