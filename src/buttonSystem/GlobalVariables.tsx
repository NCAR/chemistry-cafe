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

export const useReactionUuid = () => {
    const [reactionUuid, setReactionUuid] = useState<string | null>(null);

    useEffect(() => {
        const storedReactionUuid = localStorage.getItem('reaction_uuid');
        if (storedReactionUuid) {
            setReactionUuid(storedReactionUuid);
        }
    }, []);

    const handleReactionClick = (uuid: string) => {
        localStorage.setItem('reaction_uuid', uuid);
        console.log(uuid);
        setReactionUuid(uuid);
    };

    return { reactionUuid, handleReactionClick };
};

export const useSpeciesUuid = () => {
    const [speciesUuid, setSpeciesUuid] = useState<string | null>(null);

    useEffect(() => {
        const storedSpeciesUuid = localStorage.getItem('species_uuid');
        if (storedSpeciesUuid) {
            setSpeciesUuid(storedSpeciesUuid);
        }
    }, []);

    const handleSpeciesClick = (uuid: string) => {
        localStorage.setItem('species_uuid', uuid);
        console.log(uuid);
        setSpeciesUuid(uuid);
    };

    return { speciesUuid, handleSpeciesClick };
};

export const useTagMechanismUuid = () => {
    const [tagMechanismUuid, setTagMechanismUuid] = useState<string | null>(null);

    useEffect(() => {
        const storedTagMechanismUuid = localStorage.getItem('tag_mechanism_uuid');
        if (storedTagMechanismUuid) {
            setTagMechanismUuid(storedTagMechanismUuid);
        }
    }, []);

    const handleTagMechanismClick = (uuid: string) => {
        localStorage.setItem('tag_mechanism_uuid', uuid);
        console.log(uuid);
        setTagMechanismUuid(uuid);
    };

    return { tagMechanismUuid, handleTagMechanismClick };
};