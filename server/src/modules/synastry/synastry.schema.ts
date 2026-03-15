export const analyzeSchema = {
    body: {
        type: 'object',
        required: ['userProfile', 'partnerData'],
        properties: {
            userProfile: { type: 'object' },
            partnerData: {
                type: 'object',
                required: ['name', 'birthDate'],
                properties: {
                    name: { type: 'string' },
                    birthDate: { type: 'string' },
                    birthTime: { type: 'string' },
                    birthCity: { type: 'string' },
                    birthCountry: { type: 'string' },
                    coordinates: { type: 'object', properties: { lat: { type: 'number' }, lng: { type: 'number' } } },
                    utcOffset: { type: 'number' }
                }
            },
            relationshipType: { type: 'string', enum: ['ROMANTIC', 'BUSINESS', 'PARENTAL', 'FRATERNAL', 'AMISTAD', 'GROUP_DYNAMICS'] }
        }
    }
};
export const historySchema = { querystring: { type: 'object', properties: {} } };

export const analyzeGroupSchema = {
    body: {
        type: 'object',
        required: ['rosterProfiles'],
        properties: {
            rosterProfiles: {
                type: 'array',
                minItems: 3,
                maxItems: 5,
                items: {
                    type: 'object',
                    required: ['name', 'birthDate'],
                    properties: {
                        name: { type: 'string' },
                        birthDate: { type: 'string' },
                        birthTime: { type: 'string' },
                        birthCity: { type: 'string' },
                        birthState: { type: 'string' },
                        birthCountry: { type: 'string' },
                        roleLabel: { type: 'string' }
                    }
                }
            }
        }
    }
};

export const deleteHistorySchema = {
    params: {
        type: 'object',
        properties: {
            id: { type: 'string' }
        },
        required: ['id']
    }
};
