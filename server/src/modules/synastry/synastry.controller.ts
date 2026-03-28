import { supabase } from '../../lib/supabase';
import { UsageGuardService } from '../user/UsageGuard';

import { FastifyRequest, FastifyReply } from 'fastify';
import { SynastryOracle } from './SynastryOracle';
import { SynastryEngine } from './SynastryEngine';
import { TemporalEngine } from './TemporalEngine';
import { generateSynastryHash } from '../../utils/hashCombiner';
import { RelationshipType, SynastryProfile } from '../../types/synastry';
import { AstrologyService } from '../astrology/astroService';
import { NumerologyService } from '../numerology/service';
import { MayanCalculator } from '../../utils/mayaCalculator';
import { ChineseAstrology } from '../../utils/chineseAstrology';
import { GroupSynastryEngine } from './GroupSynastryEngine';
import { GroupOracle } from './GroupOracle';
import { ArchetypeEngine } from '../user/archetypeEngine';
import { ProfileConsolidator } from '../user/profileConsolidator';

export class SynastryController {
    public static async analyze(request: FastifyRequest, reply: FastifyReply) {
        const userId = (request as any).user_id;

        const { language } = request.body as any;
        const lang = language || 'es';
        const isEn = lang === 'en';

        // 🛡️ UsageGuard Limit Check (Dual)
        const limitCheck = await UsageGuardService.checkLimit(userId, 'synastry_dual');
        if (!limitCheck.ok) {
            return reply.status(403).send({ 
                error: isEn ? "Energy Limit Exceeded" : "Límite de Energía Agotado", 
                message: limitCheck.message 
            });
        }

        try {
            const { userProfile, partnerData, relationshipType, language: bodyLang } = request.body as any;
            const lang = bodyLang || language || userProfile.language || 'es';
            const isEn = lang === 'en';

            const type = relationshipType || RelationshipType.ROMANTIC;

            console.log(`🔮 Synastry Inversion: ${userProfile?.id} <-> ${partnerData?.name} (${type})`);

            if (!userProfile?.birthDate || !partnerData?.birthDate) {
                return reply.status(400).send({ 
                    error: isEn ? "Dates required." : "Fechas requeridas.", 
                    message: isEn ? "Missing birth dates for synchronization." : "Faltan fechas de nacimiento para la sincronización."
                });
            }

            // Backend Geocoding Resolution
            await SynastryController.mapCoordinates(partnerData);

            const hash = generateSynastryHash(userProfile.birthDate, partnerData.birthDate, type);

            // 1. LIMIT CHECK - Max 5 entries per user
            const { count, error: countError } = await supabase
                .from('synastry_history')
                .select('*', { count: 'exact', head: true })
                .eq('user_id', userId);

            if (countError) throw countError;

            // Check cache FIRST - if it exists, we don't count it as a "new" entry against the limit
            const { data: cached } = await supabase.from('synastry_history')
                .select('*')
                .eq('user_id', userId)
                .eq('combination_hash', hash)
                .eq('relationship_type', type)
                .single();

            if (cached) {
                console.log("⚡ Cache Hit: Returning existing resonance.");
                let results = cached.calculated_results;

                // --- ON-THE-FLY MIGRATION FOR V3 FERRARI ENGINE & REFLEJO PURGE ---
                const hasReflejo = JSON.stringify(results).includes('Reflejo');
                if (!results.report || !results.report.explanations || hasReflejo) {
                    console.log(`🛠️ ${hasReflejo ? 'Reflejo placeholder detected' : 'Old Synastry format detected'}. Upgrading to Ferrari Engine...`);
                    // Recalculate using the new engine & proper names
                    const pillarsB = await SynastryController.calculatePillarsB(partnerData);
                    const nameA = (userProfile.nickname || userProfile.name || userProfile.full_name || 'Arquitecto').split(' ')[0];
                    const nameB = (partnerData.name || 'Vínculo').split(' ')[0];

                    // ARCHETYPE CALCULATION (DUAL)
                    const archA = ArchetypeEngine.calculate({
                        ...userProfile,
                        astrology: userProfile.astrology || (await SynastryController.calculatePillarsB(userProfile)).astrology,
                        numerology: userProfile.numerology || (await SynastryController.calculatePillarsB(userProfile)).numerology
                    }, lang);
                    const archB = ArchetypeEngine.calculate({
                        ...partnerData,
                        astrology: pillarsB.astrology,
                        numerology: pillarsB.numerology
                    }, lang);

                    const newReport = SynastryEngine.calculate(userProfile, pillarsB, type, nameA, nameB);
                    results.report = newReport;

                    // If we found 'Reflejo', we MUST recalculate the Oracle too
                    if (hasReflejo) {
                        console.log("🤖 Purging Reflejo and Injecting Archetypes into Oracle...");
                        const timeWindows = TemporalEngine.project(userProfile, pillarsB);
                        results.synthesis = await SynastryOracle.generateSynthesis(newReport, timeWindows, type, nameA, nameB, archA, archB, lang);

                    }

                    // Fire-and-forget update to Supabase
                    (async () => {
                        try {
                            const { error } = await supabase.from('synastry_history')
                                .update({ calculated_results: results })
                                .eq('id', cached.id);
                            if (error) console.error("Cache upgrade failed:", error);
                            else console.log(`✓ Cache ${cached.id} purged successfully.`);
                        } catch (err: any) {
                            console.error("Cache upgrade failed exception:", err);
                        }
                    })();
                }

                return reply.send({ success: true, cached: true, data: results });
            }

            // If not cached and already at limit, block calculation
            if (count && count >= 5) {
                return reply.status(403).send({
                    error: isEn ? "Limit Reached" : "Límite Alcanzado",
                    message: isEn 
                        ? "Your astral history is full (Max. 5). You must release an akashic record to invoke a new one." 
                        : "Tu historial astral está saturado (Máx. 5). Debes liberar un registro akáshico para invocar uno nuevo."
                });
            }

            console.log("🧬 Calculating new resonance...");
            const pillarsB = await SynastryController.calculatePillarsB(partnerData);

            const nameA = (userProfile.nickname || userProfile.name || userProfile.full_name || 'Arquitecto').split(' ')[0];
            const nameB = (partnerData.name || 'Vínculo').split(' ')[0];

            // 3. ARCHETYPE CALCULATION (DUAL)
            const archA = ArchetypeEngine.calculate({
                ...userProfile,
                astrology: userProfile.astrology || (await SynastryController.calculatePillarsB(userProfile)).astrology,
                numerology: userProfile.numerology || (await SynastryController.calculatePillarsB(userProfile)).numerology
            }, lang);
            const archB = ArchetypeEngine.calculate({
                ...partnerData,
                astrology: pillarsB.astrology,
                numerology: pillarsB.numerology
            }, lang);

            const report = SynastryEngine.calculate(userProfile, pillarsB, type, nameA, nameB, lang);
            const timeWindows = TemporalEngine.project(userProfile, pillarsB);

            // Generate Premium AI Narration
            console.log(`🤖 Invoking Archetypal Oracle Synthesis... (${archA.nombre} <-> ${archB.nombre})`);
            const synthesis = await SynastryOracle.generateSynthesis(report, timeWindows, type, nameA, nameB, archA, archB, lang);

            const finalResult = {
                report,
                timeWindows,
                synthesis,
                partnerInfo: {
                    name: partnerData.name,
                    birthCity: partnerData.birthCity,
                    birthCountry: partnerData.birthCountry,
                    pillars: pillarsB
                },
                metadata: { hash, type, calculatedAt: new Date().toISOString() }
            };

            if (userId && userId !== '00000000-0000-0000-0000-000000000000') {
                const { error: insertError } = await supabase.from('synastry_history').insert({
                    user_id: userId,
                    partner_name: partnerData.name,
                    partner_birth_date: partnerData.birthDate,
                    relationship_type: type,
                    combination_hash: hash,
                    calculated_results: finalResult
                });
                if (insertError) console.error("❌ History Insertion Error:", insertError);
            }

            console.log("📤 API RESPONSE EXPLANATIONS:", finalResult.report.explanations ? "OK" : "MISSING");
            await UsageGuardService.incrementUsage(userId, 'synastry_dual');
            return reply.send({ success: true, cached: false, data: finalResult });
        } catch (error: any) {
            console.error("❌ Synastry Analysis Critical Failure:", error);
            return reply.status(500).send({ error: "System failure.", message: error.message });
        }
    }

    public static async analyzeGroup(request: FastifyRequest, reply: FastifyReply) {
        const userId = (request as any).user_id;

        // 🛡️ UsageGuard Limit Check (Group)
        const limitCheck = await UsageGuardService.checkLimit(userId, 'synastry_group');
        if (!limitCheck.ok) {
            return reply.status(403).send({ error: "Límite de Energía Agotado", message: limitCheck.message });
        }

        try {
            const { rosterProfiles, language } = request.body as any;
            const lang = language || 'es';
            const isEn = lang === 'en';

            if (!rosterProfiles || !Array.isArray(rosterProfiles) || rosterProfiles.length < 3 || rosterProfiles.length > 5) {
                return reply.status(400).send({ 
                    error: isEn ? "Invalid Data" : "Datos Inválidos", 
                    message: isEn 
                        ? "3 to 5 profiles are required for Group Dynamics." 
                        : "Se requieren entre 3 y 5 perfiles para Dinámica de Grupo." 
                });
            }

            console.log(`🔮 B2B Group Dynamics Analysis: ${rosterProfiles.length} members`);

            // Calculate pillars for all members concurrently
            const calculatedMembers = await Promise.all(rosterProfiles.map(async (profile: any) => {
                await SynastryController.mapCoordinates(profile);
                const pillars = await SynastryController.calculatePillarsB(profile);
                return { ...profile, pillars };
            }));

            // Calculate Elemental Mesh (Engine)
            const groupReport = GroupSynastryEngine.generateTechnicalReport(calculatedMembers, lang);

            // Generate Organizational Oracle Synthesis
            console.log("🤖 Invoking Group Oracle Synthesis...");
            const synthesis = await GroupOracle.generateSynthesis(groupReport, lang);

            const finalResult = {
                technicalReport: groupReport,
                synthesis,
                metadata: { calculatedAt: new Date().toISOString(), type: 'GROUP_DYNAMICS' }
            };

            const userId = (request as any).user_id;

            if (userId && userId !== '00000000-0000-0000-0000-000000000000') {
                const partnerNames = rosterProfiles.map((p: any) => p.name).join(', ');
                const comboHash = `group_${Date.now()}_${Math.random().toString(36).substring(7)}`;

                const { error: insertError } = await supabase.from('synastry_history').insert({
                    user_id: userId,
                    partner_name: partnerNames,
                    partner_birth_date: rosterProfiles[0].birthDate, // Required by DB schema
                    relationship_type: 'GROUP_DYNAMICS',
                    combination_hash: comboHash,
                    calculated_results: finalResult
                });
                if (insertError) console.error("❌ Group History Insertion Error:", insertError);
            }

            await UsageGuardService.incrementUsage(userId, 'synastry_group');
            return reply.send({ success: true, data: finalResult });

        } catch (error: any) {
            console.error("❌ Group Dynamics Critical Failure:", error);
            const isEn = (request.body as any)?.language === 'en';
            return reply.status(500).send({ 
                error: isEn ? "System failure." : "Falla del sistema.", 
                message: error.message 
            });
        }
    }

    private static async calculatePillarsB(data: SynastryProfile) {
        const astro = await AstrologyService.calculateProfile(
            data.birthDate,
            data.birthTime || "12:00",
            data.coordinates?.lat || 14.6349,
            data.coordinates?.lng || -90.5069,
            data.utcOffset || -6
        );
        const num = NumerologyService.calculateProfile(data.birthDate, data.name);
        const maya = MayanCalculator.calculate(data.birthDate);
        const chinese = ChineseAstrology.calculate(data.birthDate);

        return {
            astrology: astro,
            numerology: num,
            mayan: { nawal: maya.kicheName, tone: maya.tone },
            chinese: { animal: chinese.animal, element: chinese.element }
        };
    }

    private static async mapCoordinates(profile: any) {
        if ((!profile.coordinates || !profile.coordinates.lat) && profile.birthCity) {
            try {
                // Incorporate birthState and birthCountry for better geocoding accuracy
                const locationComponents = [profile.birthCity, profile.birthState, profile.birthCountry].filter(Boolean);
                const queryStr = locationComponents.join(', ');
                console.log(`🌍 Backend Geocoding for: ${queryStr}`);

                const query = encodeURIComponent(queryStr);
                const geoRes = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${query}&limit=1`, {
                    headers: { 'User-Agent': 'NAOS-Platform/1.0' }
                });
                if (geoRes.ok) {
                    const geoData = await geoRes.json();
                    if (geoData && geoData.length > 0) {
                        profile.coordinates = {
                            lat: parseFloat(geoData[0].lat),
                            lng: parseFloat(geoData[0].lon)
                        };
                        profile.utcOffset = Math.round(profile.coordinates.lng / 15);
                        console.log(`📍 Found: ${profile.coordinates.lat}, ${profile.coordinates.lng} (Offset: ${profile.utcOffset})`);
                        return; // Mapping successful
                    }
                }
            } catch (e) {
                console.warn("⚠️ Backend Geocoding failed, using fallback", e);
            }
        }

        // Apply fallbacks if mapping failed or city is missing
        if (!profile.coordinates || isNaN(profile.coordinates.lat)) {
            profile.coordinates = { lat: 14.6349, lng: -90.5069 };
            profile.utcOffset = -6;
        }
    }
    public static async getHistory(request: FastifyRequest, reply: FastifyReply) {
        const userId = (request as any).user_id;
        const { data, error } = await supabase.from('synastry_history').select('*').eq('user_id', userId).order('created_at', { ascending: false });
        if (error) return reply.status(500).send({ error: "Failed to fetch history." });

        // On-the-fly 'Reflejo' sanitization for cached records
        const sanitizedData = data.map((item: any) => {
            if (item.calculated_results) {
                const resultStr = JSON.stringify(item.calculated_results);
                if (resultStr.includes('Reflejo')) {
                    const partnerFirstName = (item.partner_name || 'Vínculo').split(' ')[0];
                    const fixedStr = resultStr.replace(/Reflejo/g, partnerFirstName);
                    item.calculated_results = JSON.parse(fixedStr);
                    // Fire and forget deep DB clean
                    supabase.from('synastry_history')
                        .update({ calculated_results: item.calculated_results })
                        .eq('id', item.id).then();
                }
            }
            return item;
        });

        return reply.send(sanitizedData);
    }

    public static async deleteHistory(request: FastifyRequest, reply: FastifyReply) {
        const userId = (request as any).user_id;
        let { id } = request.params as { id: string };

        // Sanitización: Si por alguna razón llega con el prefijo r_ detectado en logs, lo limpiamos
        if (id.startsWith('r_')) {
            id = id.substring(2);
        }

        console.log(`🗑️ Deleting Synastry Record: ${id} (Original was prefixed: ${id !== (request.params as any).id}) for User: ${userId}`);

        const { error } = await supabase
            .from('synastry_history')
            .delete()
            .eq('id', id)
            .eq('user_id', userId);

        if (error) {
            console.error("❌ Deletion Error:", error);
            const isEn = (request as any).headers?.['accept-language']?.includes('en'); // Fallback check
            return reply.status(500).send({ 
                error: isEn ? "Could not delete record." : "No se pudo borrar el registro." 
            });
        }

        return reply.send({ 
            success: true, 
            message: (request as any).headers?.['accept-language']?.includes('en') ? "Record released." : "Registro liberado." 
        });
    }
}
