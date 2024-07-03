export default function cleanPhoneNumber(number: string): string {
    return number.replace(/\D/g, '');
}
