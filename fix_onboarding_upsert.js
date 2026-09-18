const fs = require('fs');

let content = fs.readFileSync('client/src/components/OnboardingForm.tsx', 'utf8');

const searchUpsert = "            const { error } = await supabase.from('profiles').upsert(fullProfile);\n            if (error) throw error;";

const replaceUpsert = `            // Use backend API via ProfileContext to avoid client-side RLS mutation block (403)
            await updateProfile({
                name: formData.name,
                nickname: formData.nickname,
                email: formData.email,
                birthDate: formData.birthDate,
                birthTime: formData.birthTime,
                birthCity: combinedCity,
                birthCountry: formData.birthCountry,
                astrology: astroData,
                numerology: {
                    lifePathNumber,
                    pinaculo,
                    nameNumber
                },
                mayan: mayanData,
                fengShui: {
                    animal: chineseData.animal,
                    element: chineseData.element,
                    birthYear: chineseData.birthYear
                },
                onboarding_completed: true
            });`;

content = content.replace(searchUpsert, replaceUpsert);
fs.writeFileSync('client/src/components/OnboardingForm.tsx', content);
console.log("Replaced successfully");
