import {Module} from "@nestjs/common";
import {JwtModule} from "@nestjs/jwt";
import CryptoService from "./crypto.service";

@Module({
    imports: [JwtModule],
    providers: [CryptoService],
    exports: [CryptoService]
})
export default class CryptoModule {
}