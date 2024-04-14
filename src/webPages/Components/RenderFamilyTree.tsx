import { useEffect, useState } from 'react';

import { Family, TagMechanism } from '../../API/API_Interfaces';
import { getFamilies, getTagMechanismsFromFamily } from '../../API/API_GetMethods';

import { SimpleTreeView } from '@mui/x-tree-view/SimpleTreeView';
import { TreeItem } from '@mui/x-tree-view/TreeItem';

import ButtonGroup from '@mui/material/ButtonGroup';
import Button from '@mui/material/Button';

import CircularProgress from '@mui/material/CircularProgress';

const treeItemStyle = {
    fontSize: '1.2rem',
    backgroundColor: '#f0f0f0',
    border: '1px solid #ccc',
    borderRadius: '4px',
    padding: '8px 12px',
    margin: '4px',
    cursor: 'pointer',
};

interface RenderFamilyTreeProps {
    setSelectedFamily: React.Dispatch<React.SetStateAction<string | null>>;
    setSelectedTagMechanism: React.Dispatch<React.SetStateAction<string | null>>;
    handleCreateFamilyOpen: () => void;
    handleCreateTagMechanismOpen: () => void;
    selectedFamily: string | null;
    createdFamilyBool: boolean;
    setCreatedFamilyBool: React.Dispatch<React.SetStateAction<boolean>>;
    createdTagMechanismBool: boolean;
    setCreatedTagMechanismBool: React.Dispatch<React.SetStateAction<boolean>>;
};

const RenderFamilyTree: React.FC<RenderFamilyTreeProps> = ({ 
    selectedFamily, 
    setSelectedFamily, 
    setSelectedTagMechanism, 
    handleCreateFamilyOpen, 
    handleCreateTagMechanismOpen,
    createdFamilyBool,
    setCreatedFamilyBool,
    createdTagMechanismBool,
    setCreatedTagMechanismBool
}) => {
    const [expandedItems, setExpandedItems] = useState<string[]>([]);
    
    const [families, setFamilies] = useState<Family[]>([]);
    const [tagMechanismsMap, setTagMechanismsMap] = useState<Record<string, TagMechanism[]>>({});

    const [loading, setLoading] = useState<boolean>(true);

    const [popUpOpen, setPopUpOpen] = useState<boolean>(false);
    
    useEffect(() => {
        const fetchData = async () => {
            try {
                const fetchedFamilies = await getFamilies();
                setFamilies(fetchedFamilies);
                setLoading(false);

                const tagMechanismsPromises = fetchedFamilies.map(family => getTagMechanismsFromFamily(family.uuid));
                const tagMechanisms = await Promise.all(tagMechanismsPromises);
                const tagMechanismsMap: Record<string, TagMechanism[]> = {};
                fetchedFamilies.forEach((family, index) => {
                    tagMechanismsMap[family.uuid] = tagMechanisms[index];
                });
                setTagMechanismsMap(tagMechanismsMap);
                setCreatedFamilyBool(false);
                setCreatedTagMechanismBool(false);
            } catch (error) {
                console.error(error);
            }
        };

        fetchData();
    }, [createdFamilyBool == true, createdTagMechanismBool == true]);

    const handleCreateTagMechanismClick = () => {
        if (selectedFamily === null) {
            setPopUpOpen(true);
            setTimeout(() => {
                setPopUpOpen(false);
            }, 1500);
        } else {
            handleCreateTagMechanismOpen();
        }
    };

    const handleItemExpansionToggle = (event: React.SyntheticEvent, itemId: string, isExpanded: boolean) => {
        setExpandedItems(isExpanded ? [itemId] : []);
    };
    
    return (
        <>
            {loading ? (
                <CircularProgress />
            ) : (
                <>
                    <div>
                        <ButtonGroup orientation='vertical' variant='contained'>
                            <Button onClick={handleCreateFamilyOpen}>
                                Create Family
                            </Button>
                            <Button onClick={handleCreateTagMechanismClick}>
                                Create Tag Mechanism
                            </Button>
                        </ButtonGroup>
                        {popUpOpen && (
                            <div className="popup">
                                <span className="popuptext">Family Not Selected</span>
                            </div>
                        )}
                        <h2 style={{textAlign: 'center'}}>Families</h2>
                    </div>
                    <SimpleTreeView
                        expandedItems={expandedItems}
                        onItemExpansionToggle={handleItemExpansionToggle}
                    >
                        {families.map((family) => (
                            <TreeItem
                                key={family.uuid}
                                itemId={family.uuid}
                                label={family.name}
                                sx={treeItemStyle}
                                onClick={() => {
                                    setSelectedFamily(family.uuid);
                                    setSelectedTagMechanism(family.super_tag_mechanism_uuid);
                                }}
                            >
                                <h3 style={{textAlign: 'center'}}>Tag Mechanisms</h3>
                                {tagMechanismsMap[family.uuid]?.map((tagMechanism) => (
                                    <TreeItem
                                        key={tagMechanism.uuid}
                                        itemId={tagMechanism.uuid}
                                        label={tagMechanism.tag}
                                        sx={treeItemStyle}
                                        onClick={() => setSelectedTagMechanism(tagMechanism.uuid)}
                                    />
                                ))}
                            </TreeItem>
                        ))}
                    </SimpleTreeView>
                </>
            )}
        </>
    );
}

export default RenderFamilyTree;
