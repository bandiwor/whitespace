export const accessExpiresIn = `${60 * 1.5}s`; // 90 seconds
export const refreshExpiresIn = `${60 * 60 * 24 * 15}s`; // 15 days
export const accessSecret = 'doprjy0-wszd[fpg_ksp$ojgfs';
export const refreshSecret = 'asdh-o0jass3rtsef%%$';

export type JwtPayload = {
    sub: string,
    userId: string,
    profileId: number,
    sessionId: string,
}
