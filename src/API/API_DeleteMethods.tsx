import axios from 'axios';


export async function deleteFamily(name: string) {
    try {
        const response = await axios.post(
            'http://localhost:5134/api/Family/delete/${uuid}',
            {
                headers: {
                    'Content-Type': 'application/json',
                },
            }
        );
        return response.data;
    } catch (error) {
        console.error(error);
        throw error;
    }
}

export async function deleteMechanism(name: string) {
    try {
        const response = await axios.post(
            'http://localhost:5134/api/Mechanism/delete/${uuid}',
            {
                headers: {
                    'Content-Type': 'application/json',
                },
            }
        );
        return response.data;
    } catch (error) {
        console.error(error);
        throw error;
    }
}

export async function deleteFamMechList(name: string) {
    try {
        const response = await axios.post(
            'http://localhost:5134/api/FamilyMechList/delete/${uuid}',
            {
                headers: {
                    'Content-Type': 'application/json',
                },
            }
        );
        return response.data;
    } catch (error) {
        console.error(error);
        throw error;
    }
}