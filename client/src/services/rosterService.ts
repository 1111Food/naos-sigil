import { API_BASE_URL, getAuthHeaders } from '../lib/api';

export interface RosterProfile {
    id?: string;
    name: string;
    birthDate: string; // YYYY-MM-DD
    birthTime?: string; // HH:mm
    birthCity?: string;
    birthState?: string;
    birthCountry?: string;
    roleLabel?: string;
}

export const RosterService = {
    // Add a new profile to the roster
    addProfile: async (profileData: RosterProfile): Promise<RosterProfile> => {
        const response = await fetch(`${API_BASE_URL}/api/roster`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify(profileData)
        });

        if (!response.ok) {
            const err = await response.json();
            throw new Error(err.message || 'Error al guardar el perfil en el Roster.');
        }

        const data = await response.json();
        return data.data;
    },

    // Get all profiles for the current user
    getProfiles: async (): Promise<RosterProfile[]> => {
        const response = await fetch(`${API_BASE_URL}/api/roster`, {
            headers: getAuthHeaders()
        });

        if (!response.ok) {
            throw new Error('No se pudo obtener el Roster de vínculos.');
        }

        const data = await response.json();
        // Map snake_case from DB to camelCase for frontend
        return data.data.map((item: any) => ({
            id: item.id,
            name: item.name,
            birthDate: item.birth_date,
            birthTime: item.birth_time,
            birthCity: item.birth_city,
            birthState: item.birth_state,
            birthCountry: item.birth_country,
            roleLabel: item.role_label
        }));
    },

    // Update an existing profile
    updateProfile: async (id: string, updates: Partial<RosterProfile>): Promise<RosterProfile> => {
        const payload = {
            name: updates.name,
            birthDate: updates.birthDate,
            birthTime: updates.birthTime,
            birthCity: updates.birthCity,
            birthState: updates.birthState,
            birthCountry: updates.birthCountry,
            roleLabel: updates.roleLabel
        };

        const response = await fetch(`${API_BASE_URL}/api/roster/${id}`, {
            method: 'PUT',
            headers: getAuthHeaders(),
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            throw new Error('Error al actualizar el perfil.');
        }

        const data = await response.json();
        return data.data;
    },

    // Delete a profile from the roster
    deleteProfile: async (id: string): Promise<void> => {
        const headers = getAuthHeaders();
        delete headers['Content-Type']; // Prevent fastify JSON body parse error on DELETE

        const response = await fetch(`${API_BASE_URL}/api/roster/${id}`, {
            method: 'DELETE',
            headers
        });

        if (!response.ok) {
            throw new Error('No se pudo eliminar el perfil.');
        }
    }
};
