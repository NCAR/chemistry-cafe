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
        setFamilyUuid(uuid);
    };

    return { familyUuid, setFamilyUuid, handleFamilyClick };
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

export const useReactionUuid = () => {
    const [reactionUuid, setReactionUuid] = useState<string | null>(null);
    const [reactantListUuid, setReactantListUuid] = useState<string | null>(null);
    const [productListUuid, setProductListUuid] = useState<string | null>(null);

    useEffect(() => {
        const storedReactionUuid = localStorage.getItem('reaction_uuid');
        const storedReactantListUuid = localStorage.getItem('reactant_list_uuid');
        const storedProductListUuid = localStorage.getItem('product_list_uuid');
        if (storedReactionUuid) {
            setReactionUuid(storedReactionUuid);
        }
        if (storedReactantListUuid) {
            setReactantListUuid(storedReactantListUuid);
        }
        if (storedProductListUuid) {
            setProductListUuid(storedProductListUuid);
        }
    }, []);

    const handleReactionClick = (uuid: string, reactant_list_uuid: string, product_list_uuid: string) => {
        localStorage.setItem('reaction_uuid', uuid);
        setReactionUuid(uuid);
        localStorage.setItem('reactant_list_uuid', reactant_list_uuid);
        setReactantListUuid(reactant_list_uuid);
        localStorage.setItem('product_list_uuid', product_list_uuid);
        setProductListUuid(product_list_uuid);
    };

    return { reactionUuid, setReactionUuid, reactantListUuid, setReactantListUuid, productListUuid, setProductListUuid, handleReactionClick };
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

    return { speciesUuid, setSpeciesUuid, handleSpeciesClick };
};