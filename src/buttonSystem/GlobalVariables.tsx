import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

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
        setFamilyUuid(uuid);
    };

    return { familyUuid, handleFamilyClick };
};


export const useMechanismUuid = () => {
    const navigate = useNavigate();
    
    const [mechanismUuid, setMechanismUuid] = useState<string | null>(null);

    useEffect(() => {
        const storedMechanismUuid = localStorage.getItem('mechanism_uuid');
        if (storedMechanismUuid) {
            setMechanismUuid(storedMechanismUuid);
        }
    }, []);

    const handleMechanismsClick = (uuid: string) => {
        localStorage.setItem('mechanism_uuid', uuid);
        setMechanismUuid(uuid);
    };

    const handleFamilyMechanismClick = (uuid: string) => {
        localStorage.setItem('mechanism_uuid', uuid);
        setMechanismUuid(uuid);
        navigate('/MechanismPage')
    };

    return { mechanismUuid, handleMechanismsClick, handleFamilyMechanismClick };
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
        setTagMechanismUuid(uuid);
    };

    return { tagMechanismUuid, handleTagMechanismClick };
};