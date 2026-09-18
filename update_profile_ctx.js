const fs = require('fs');
let content = fs.readFileSync('client/src/contexts/ProfileContext.tsx', 'utf8');

const replacement = `    useEffect(() => {
        if (profile && profile.onboarding_completed) {
            const currentOffset = new Date().getTimezoneOffset() / -60;
            const currentIana = Intl.DateTimeFormat().resolvedOptions().timeZone;
            const savedOffset = profile.astrology?.timezone_offset;
            const savedIana = profile.profile_data?.timezone_iana;

            if (savedOffset !== currentOffset || savedIana !== currentIana) {
                console.log("🌌 Calibrando Timezone a:", currentIana, "offset:", currentOffset);
                updateProfile({
                    astrology: {
                        ...(profile.astrology || {}),
                        timezone_offset: currentOffset
                    },
                    profile_data: {
                        ...(profile.profile_data || {}),
                        timezone_iana: currentIana
                    }
                }).catch(err => console.error("Error calibrating timezone:", err));
            }
        }
    }, [profile, updateProfile]);`;

const rx = /useEffect\(\(\) => \{\s*if \(profile && profile\.onboarding_completed\) \{[\s\S]*?\}, \[profile, updateProfile\]\);/;

content = content.replace(rx, replacement);

fs.writeFileSync('client/src/contexts/ProfileContext.tsx', content);
