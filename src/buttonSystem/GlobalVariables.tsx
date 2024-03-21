import { useEffect, useState } from "react";

export const useFamilyUuid = () => {
    const [familyUuid, setFamilyUuid] = useState<string | null>(null);

    useEffect(() => {
        const storedFamilyUuid = localStorage.getItem('family_uuid');
        if (storedFamilyUuid) {
            setFamilyUuid(storedFamilyUuid);
        }
    }, []);

    const handleFamilyClick = (uuid: string) => {
        localStorage.setItem('family_uuid', uuid);
        console.log(uuid);
        setFamilyUuid(uuid);
    };

    return { familyUuid, handleFamilyClick };
};


export const useMechanismUuid = () => {
    const [mechanismUuid, setMechanismUuid] = useState<string | null>(null);

    useEffect(() => {
        const storedMechanismUuid = localStorage.getItem('mechanism_uuid');
        if (storedMechanismUuid) {
            setMechanismUuid(storedMechanismUuid);
        }
    }, []);

    const handleMechanismClick = (uuid: string) => {
        localStorage.setItem('mechanism_uuid', uuid);
        console.log(uuid);
        setMechanismUuid(uuid);
    };

    return { mechanismUuid, handleMechanismClick };
};
