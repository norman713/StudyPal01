export const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

export function hasDuplicateStrings(strings: string[]): boolean {
    const uniqueStrings = new Set(strings);
    return uniqueStrings.size !== strings.length;
}