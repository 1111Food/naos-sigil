export class DateUtils {
    /**
     * Resolves the canonical current timezone offset of the user.
     * MUST NOT fallback to natal utcOffset.
     */
    static getCurrentTimezoneOffset(profile: any): number {
        if (!profile) return 0;
        
        const profileData = profile.profile_data || {};
        const astroData = profile.astrology || {};
        
        // Frontend currently saves it in astrology.timezone_offset or profile_data.timezone_offset
        if (profileData.timezone_offset !== undefined && profileData.timezone_offset !== null) {
            return profileData.timezone_offset;
        }
        if (astroData.timezone_offset !== undefined && astroData.timezone_offset !== null) {
            return astroData.timezone_offset;
        }
        
        return 0; // Default to UTC if completely missing
    }
    /**
     * Resolves the canonical user local date string (YYYY-MM-DD) based on their current timezone offset.
     * @param currentTimezoneOffset The user's current timezone offset in hours (from profile.astrology.timezone_offset)
     * @param now Optional date override for testing. Defaults to new Date().
     */
    static getUserLocalDate(currentTimezoneOffset: number, now: Date = new Date()): string {
        const localTimeMs = now.getTime() + (currentTimezoneOffset * 3600000);
        const localDate = new Date(localTimeMs);
        
        const year = localDate.getUTCFullYear();
        const month = String(localDate.getUTCMonth() + 1).padStart(2, '0');
        const day = String(localDate.getUTCDate()).padStart(2, '0');
        
        return `${year}-${month}-${day}`;
    }
}
