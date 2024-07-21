import {Injectable} from "@nestjs/common";
import CryptoService from "../crypto/crypto.service";

@Injectable()
export default class GatewayService {
    constructor(private readonly cryptoService: CryptoService) {
    }

    async getProfileIdFromJwt(token: string) {
        const decodedJwt = await this.cryptoService.decodeAccessJwt(token);
        if (!decodedJwt) {
            return null;
        }
        return decodedJwt.profileId;
    }
}