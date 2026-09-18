"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var supabaseadmin_1 = require("../src/lib/supabaseadmin");
var MayaMathV1_1 = require("../src/modules/maya/MayaMathV1");
var archetypeEngine_1 = require("../src/modules/user/archetypeEngine");
var dotenv = __importStar(require("dotenv"));
var path = __importStar(require("path"));
dotenv.config({ path: path.resolve(__dirname, '../.env') });
var NAWALES = [
    { name: "B'atz'" }, { name: "E" }, { name: "Aj" }, { name: "Ix" }, { name: "Tz'ikin" },
    { name: "Ajmaq" }, { name: "No'j" }, { name: "Tijax" }, { name: "Kawoq" }, { name: "Ajpu" },
    { name: "Imox" }, { name: "Iq'" }, { name: "Aq'ab'al" }, { name: "K'at" }, { name: "Kan" },
    { name: "Kame" }, { name: "Kej" }, { name: "Q'anil" }, { name: "Toj" }, { name: "Tz'i'" }
];
function run() {
    return __awaiter(this, void 0, void 0, function () {
        var dailyCosmicStatesCount, userEnergySnapshotsCount, profilesScanned, profilesSkipped, validBirthDates, storedNatalMayaMatch, storedNatalMayaMismatch, storedNatalToneMatch, storedNatalToneMismatch, backendNawalDifferences, backendToneDifferences, mayaColorChanged, mayaElementContributionChanged, elementScoreChangedUsers, elementScoreUnchangedUsers, archetypeChangedUsers, archetypeUnchangedUsers, nonCanonicalArchetypeGenerated, patternSourceContextChanged, identityRecompileRequired, archetypeTransitions, hasMore, start, limit, _a, profiles, error, _loop_1, _i, profiles_1, p;
        var _b, _c;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    console.log("TARGET_ENVIRONMENT: ".concat(process.env.SUPABASE_URL));
                    console.log("MIGRATION_MODE: DRY_RUN");
                    return [4 /*yield*/, supabaseadmin_1.supabaseAdmin.from('daily_cosmic_states').select('*', { count: 'exact', head: true })];
                case 1:
                    dailyCosmicStatesCount = (_d.sent()).count;
                    return [4 /*yield*/, supabaseadmin_1.supabaseAdmin.from('user_energy_snapshots').select('*', { count: 'exact', head: true })];
                case 2:
                    userEnergySnapshotsCount = (_d.sent()).count;
                    profilesScanned = 0;
                    profilesSkipped = 0;
                    validBirthDates = 0;
                    storedNatalMayaMatch = 0;
                    storedNatalMayaMismatch = 0;
                    storedNatalToneMatch = 0;
                    storedNatalToneMismatch = 0;
                    backendNawalDifferences = 0;
                    backendToneDifferences = 0;
                    mayaColorChanged = 0;
                    mayaElementContributionChanged = 0;
                    elementScoreChangedUsers = 0;
                    elementScoreUnchangedUsers = 0;
                    archetypeChangedUsers = 0;
                    archetypeUnchangedUsers = 0;
                    nonCanonicalArchetypeGenerated = 0;
                    patternSourceContextChanged = 0;
                    identityRecompileRequired = 0;
                    archetypeTransitions = {};
                    hasMore = true;
                    start = 0;
                    limit = 1000;
                    _d.label = 3;
                case 3:
                    if (!hasMore) return [3 /*break*/, 5];
                    return [4 /*yield*/, supabaseadmin_1.supabaseAdmin
                            .from('profiles')
                            .select('id, birth_date, mayan, naos_identity_code, profile_data, language')
                            .range(start, start + limit - 1)];
                case 4:
                    _a = _d.sent(), profiles = _a.data, error = _a.error;
                    if (error || !profiles || profiles.length === 0) {
                        hasMore = false;
                        return [3 /*break*/, 5];
                    }
                    _loop_1 = function (p) {
                        profilesScanned++;
                        if (!p.birth_date) {
                            profilesSkipped++;
                            return "continue";
                        }
                        validBirthDates++;
                        var lang = p.language || 'es';
                        // Current stored Maya
                        var stored = p.mayan;
                        // Canonical Maya directly from Math V1
                        var canonical = MayaMathV1_1.MayaMathV1.calculate({ localDate: p.birth_date });
                        // Legacy backend Maya (simulate the BUG mathematically)
                        // The bug was D-1, so we simulate legacy output manually for comparison:
                        var _e = p.birth_date.split('-').map(Number), year = _e[0], month = _e[1], day = _e[2];
                        var y = year;
                        var m = month;
                        if (m < 3) {
                            y -= 1;
                            m += 12;
                        }
                        var a = Math.floor(y / 100);
                        var b = 2 - a + Math.floor(a / 4);
                        var jd = Math.floor(365.25 * (y + 4716)) + Math.floor(30.6001 * (m + 1)) + day + b - 1524.5;
                        var tzolkinDays = Math.floor(jd - 584283);
                        var legacyNawalIdx = ((tzolkinDays + 9) % 20 + 20) % 20;
                        var legacyTone = ((tzolkinDays + 3) % 13 + 13) % 13 + 1;
                        var legacyNawal = NAWALES[legacyNawalIdx].name;
                        // 1. Check if stored matches Canonical (Frontend Math was right?)
                        var legacyKeyStored = (stored === null || stored === void 0 ? void 0 : stored.kicheName) === 'Ix' ? "I'x" : stored === null || stored === void 0 ? void 0 : stored.kicheName;
                        if (legacyKeyStored === canonical.canonicalNawalKey) {
                            storedNatalMayaMatch++;
                        }
                        else {
                            storedNatalMayaMismatch++;
                        }
                        if ((stored === null || stored === void 0 ? void 0 : stored.tone) === canonical.tone) {
                            storedNatalToneMatch++;
                        }
                        else {
                            storedNatalToneMismatch++;
                        }
                        // 2. Check if legacy backend differed from canonical
                        if (legacyNawal !== canonical.canonicalNawalKey && !(legacyNawal === 'Ix' && canonical.canonicalNawalKey === "I'x")) {
                            backendNawalDifferences++;
                        }
                        if (legacyTone !== canonical.tone) {
                            backendToneDifferences++;
                        }
                        // 3. Archetype re-evaluation logic
                        // The backend compiled Identity using the legacy calc.
                        // Let's re-run old vs new
                        var oldColor = ['Rojo', 'Blanco', 'Azul', 'Amarillo'][(legacyNawalIdx + 2) % 4];
                        var newNawalIdx = NAWALES.findIndex(function (n) { return n.name === (canonical.canonicalNawalKey === "I'x" ? "Ix" : canonical.canonicalNawalKey); });
                        var newColor = ['Rojo', 'Blanco', 'Azul', 'Amarillo'][(newNawalIdx + 2) % 4];
                        if (oldColor !== newColor) {
                            mayaColorChanged++;
                            mayaElementContributionChanged++;
                        }
                        // Mock minimal profile to evaluate score changes
                        if (p.profile_data) {
                            var oldProfile = __assign(__assign({}, p.profile_data), { mayan: { color: oldColor } });
                            var newProfile = __assign(__assign({}, p.profile_data), { mayan: { color: newColor } });
                            try {
                                var archOld = archetypeEngine_1.ArchetypeEngine.calculate(oldProfile, lang);
                                var archNew = archetypeEngine_1.ArchetypeEngine.calculate(newProfile, lang);
                                var oldScoreStr = JSON.stringify(((_b = archOld.assignment_v2) === null || _b === void 0 ? void 0 : _b.elementScores) || {});
                                var newScoreStr = JSON.stringify(((_c = archNew.assignment_v2) === null || _c === void 0 ? void 0 : _c.elementScores) || {});
                                if (oldScoreStr !== newScoreStr) {
                                    elementScoreChangedUsers++;
                                    identityRecompileRequired++;
                                    patternSourceContextChanged++;
                                }
                                else {
                                    elementScoreUnchangedUsers++;
                                }
                                if (archOld.nombre !== archNew.nombre) {
                                    archetypeChangedUsers++;
                                    var trans = "".concat(archOld.nombre, " -> ").concat(archNew.nombre);
                                    archetypeTransitions[trans] = (archetypeTransitions[trans] || 0) + 1;
                                }
                                else {
                                    archetypeUnchangedUsers++;
                                }
                            }
                            catch (e) {
                                // Profile data missing required astro/num fields, skip archetype eval
                            }
                        }
                    };
                    for (_i = 0, profiles_1 = profiles; _i < profiles_1.length; _i++) {
                        p = profiles_1[_i];
                        _loop_1(p);
                    }
                    start += limit;
                    return [3 /*break*/, 3];
                case 5:
                    console.log("\nPROFILES_SCANNED: ".concat(profilesScanned));
                    console.log("PROFILES_WITH_VALID_BIRTH_DATE: ".concat(validBirthDates));
                    console.log("PROFILES_SKIPPED: ".concat(profilesSkipped));
                    console.log("STORED_NATAL_MAYA_MATCH_CANONICAL: ".concat(storedNatalMayaMatch));
                    console.log("STORED_NATAL_MAYA_MISMATCH: ".concat(storedNatalMayaMismatch));
                    console.log("STORED_NATAL_TONE_MISMATCH: ".concat(storedNatalToneMismatch));
                    console.log("BACKEND_NAWAL_DIFFERENCES: ".concat(backendNawalDifferences));
                    console.log("BACKEND_TONE_DIFFERENCES: ".concat(backendToneDifferences));
                    console.log("MAYA_COLOR_CHANGED: ".concat(mayaColorChanged));
                    console.log("MAYA_ELEMENT_CONTRIBUTION_CHANGED: ".concat(mayaElementContributionChanged));
                    console.log("ELEMENT_SCORE_CHANGED_USERS: ".concat(elementScoreChangedUsers));
                    console.log("ELEMENT_SCORE_UNCHANGED_USERS: ".concat(elementScoreUnchangedUsers));
                    console.log("ARCHETYPE_CHANGED_USERS: ".concat(archetypeChangedUsers));
                    console.log("ARCHETYPE_UNCHANGED_USERS: ".concat(archetypeUnchangedUsers));
                    console.log("ARCHETYPE_TRANSITION_COUNTS:", archetypeTransitions);
                    console.log("NON_CANONICAL_ARCHETYPE_GENERATED: ".concat(nonCanonicalArchetypeGenerated));
                    console.log("IDENTITY_RECOMPILE_REQUIRED_COUNT: ".concat(identityRecompileRequired));
                    console.log("PATTERN_SOURCE_CONTEXT_CHANGED_COUNT: ".concat(patternSourceContextChanged));
                    console.log("DAILY_COSMIC_STATES_WOULD_INVALIDATE: ".concat(dailyCosmicStatesCount || 0));
                    console.log("ENERGY_SNAPSHOTS_WOULD_INVALIDATE: ".concat(userEnergySnapshotsCount || 0));
                    console.log("PROFILE_CACHE_INVALIDATION_REQUIRED_COUNT: ".concat(identityRecompileRequired));
                    return [2 /*return*/];
            }
        });
    });
}
run().catch(console.error);
