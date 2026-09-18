export class DateUtils {
    /**
     * Resolves the canonical current IANA timezone of the user, falling back to UTC if missing.
     */
    static getCurrentTimezoneIana(profile: any): string | null {
        if (!profile) return null;
        const profileData = profile.profile_data || {};
        if (profileData.timezone_iana) {
            return profileData.timezone_iana;
        }
        return null; // Explicit fallback
    }

    /**
     * Resolves the canonical current timezone offset of the user.
     * Only uses profile_data.timezone_offset (which is the browser offset).
     * Does NOT use astrology.timezone_offset which is the birth location offset!
     */
    static getCurrentTimezoneOffset(profile: any): number {
        if (!profile) return 0;
        const profileData = profile.profile_data || {};
        if (profileData.timezone_offset !== undefined && profileData.timezone_offset !== null) {
            return profileData.timezone_offset;
        }
        return 0; // Default to UTC if completely missing
    }

    /**
     * Resolves the canonical user local date string (YYYY-MM-DD) based on their timezone.
     */
    static getUserLocalDate(profile: any, now: Date = new Date()): string {
        const iana = this.getCurrentTimezoneIana(profile);
        if (iana) {
            try {
                const formatter = new Intl.DateTimeFormat('en-CA', { 
                    timeZone: iana,
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit'
                });
                return formatter.format(now).replace(/\//g, '-');
            } catch (e) {
                // If IANA is invalid, fall through to UTC
            }
        }

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
            try {
                const formatter = new Intl.DateTimeFormat('en-US', {
                    timeZone: iana,
                    hour: 'numeric',
                    hour12: false
                });
                let hourStr = formatter.format(now);
                if (hourStr === '24') hourStr = '0';
                return parseInt(hourStr, 10);
            } catch(e) {}
        }
        
        const offset = this.getCurrentTimezoneOffset(profile);
        const localTimeMs = now.getTime() + (offset * 3600000);
        return new Date(localTimeMs).getUTCHours();
    }
}
