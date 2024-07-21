import {Module} from "@nestjs/common";
import CryptoModule from "../crypto/crypto.module";
import ProfileModule from "../profile/profile.module";
import GatewayGateway from "./gateway.gateway";
import GatewayService from "./gateway.service";

@Module({
    imports: [CryptoModule, ProfileModule],
    providers: [GatewayService, GatewayGateway],
})
export default class GatewayModule {
}