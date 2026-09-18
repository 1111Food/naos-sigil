export class DateUtils {
    /**
     * Resolves the canonical current IANA timezone of the user, falling back to offset arithmetic if missing.
     */
    static getCurrentTimezoneIana(profile: any): string | null {
        if (!profile) return null;
        const profileData = profile.profile_data || {};
        if (profileData.timezone_iana) {
            return profileData.timezone_iana;
        }
        return null;
    }

    /**
     * Resolves the canonical current timezone offset of the user.
     */
    static getCurrentTimezoneOffset(profile: any): number {
        if (!profile) return 0;
        const profileData = profile.profile_data || {};
        const astroData = profile.astrology || {};
        if (profileData.timezone_offset !== undefined && profileData.timezone_offset !== null) return profileData.timezone_offset;
        if (astroData.timezone_offset !== undefined && astroData.timezone_offset !== null) return astroData.timezone_offset;
        return 0; 
    }

    /**
     * Resolves the canonical user local date string (YYYY-MM-DD) based on their timezone.
     */
    static getUserLocalDate(profile: any, now: Date = new Date()): string {
        const iana = this.getCurrentTimezoneIana(profile);
        if (iana) {
            // Use Intl for DST-safe formatting
            const formatter = new Intl.DateTimeFormat('en-CA', { // en-CA gives YYYY-MM-DD
                timeZone: iana,
                year: 'numeric',
                month: '2-digit',
                day: '2-digit'
            });
            // Some environments return 'YYYY-MM-DD', others 'YYYY/MM/DD', so replace slashes just in case
            return formatter.format(now).replace(/\//g, '-');
        }

        // Fallback to offset arithmetic
        const offset = this.getCurrentTimezoneOffset(profile);
        const localTimeMs = now.getTime() + (offset * 3600000);
        const localDate = new Date(localTimeMs);
        const year = localDate.getUTCFullYear();
        const month = String(localDate.getUTCMonth() + 1).padStart(2, '0');
        const day = String(localDate.getUTCDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    /**
     * Gets the user's local hour (0-23) DST-safely.
     */
    static getUserLocalHour(profile: any, now: Date = new Date()): number {
        const iana = this.getCurrentTimezoneIana(profile);
        if (iana) {
            const formatter = new Intl.DateTimeFormat('en-US', {
                timeZone: iana,
                hour: 'numeric',
                hour12: false
            });
            let hourStr = formatter.format(now);
            // Handle '24' edge case for midnight in some Intl implementations
            if (hourStr === '24') hourStr = '0';
            return parseInt(hourStr, 10);
        }
        
        // Fallback
        const offset = this.getCurrentTimezoneOffset(profile);
        const localTimeMs = now.getTime() + (offset * 3600000);
        return new Date(localTimeMs).getUTCHours();
    }
}
