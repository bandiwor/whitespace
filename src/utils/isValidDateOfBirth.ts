export default function isValidDateOfBirth(dateString: string | Date) {
    const date = typeof dateString === 'string' ? new Date(dateString) : dateString
    if (isNaN(date.getTime())) {
        return false;
    }
    const now = new Date();

    if (date > now && date.getFullYear() < now.getFullYear() - 140) {
        return false;
    }

    return true;
}