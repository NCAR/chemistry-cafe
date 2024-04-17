import { useEffect, useState } from 'react';

import { Family, TagMechanism } from '../../API/API_Interfaces';
import { downloadOA, getFamilies, getTagMechanismsFromFamily } from '../../API/API_GetMethods';

import { SimpleTreeView } from '@mui/x-tree-view/SimpleTreeView';
import { TreeItem } from '@mui/x-tree-view/TreeItem';

import IconButton from '@mui/material/IconButton';
import { Add, GetApp } from '@mui/icons-material';

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

    const [, setPopUpOpen] = useState<boolean>(false);
    
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

    const handleDownloadClick = async (tag_mechanism_uuid: string) => {
        const link = document.createElement("a");
        const body = await downloadOA(tag_mechanism_uuid as string);

        const blob = new Blob([body], { type: 'application/json' });

        const blobUrl = window.URL.createObjectURL(blob);

        link.download = 'openAtmos.json';
        link.href = blobUrl;

        link.click();

        window.URL.revokeObjectURL(blobUrl);
    };

    const handleItemExpansionToggle = (_event: React.SyntheticEvent, itemId: string, isExpanded: boolean) => {
        setExpandedItems(isExpanded ? [itemId] : []);
    };
    
    return (
        <div style={{ margin: '5px' }}>
            {loading ? (
                <CircularProgress />
            ) : (
                <>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <h2 style={{ textAlign: 'center', margin: '0' }}>Families</h2>
                        <IconButton 
                            onClick={handleCreateFamilyOpen} 
                            aria-label="create family" 
                            style={{ color: 'blue', margin: '5px' }}
                        >
                            <Add sx={{ fontSize: 32, fontWeight: 'bold' }} />
                        </IconButton>
                    </div>
                    <SimpleTreeView
                        expandedItems={expandedItems}
                        onItemExpansionToggle={handleItemExpansionToggle}
                    >
                        {families.map((family) => (
                            <TreeItem
                                key={family.uuid}
                                itemId={family.uuid}
                                label={
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <span>{family.name}</span>
                                        <IconButton
                                            onClick={() => {
                                                handleDownloadClick(family.super_tag_mechanism_uuid);
                                            }}
                                            aria-label="download"
                                            style={{ color: 'green' }}
                                        >
                                            <GetApp />
                                        </IconButton>
                                    </div>
                                }
                                sx={treeItemStyle}
                                onClick={() => {
                                    setSelectedFamily(family.uuid);
                                    setSelectedTagMechanism(family.super_tag_mechanism_uuid);
                                }}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                    <h2 style={{ textAlign: 'left', margin: '0' }}>Tag Mechanisms</h2>
                                    <IconButton 
                                        onClick={handleCreateTagMechanismClick} 
                                        aria-label="create tag mechanism" 
                                        style={{ color: 'blue', margin: '5px' }}
                                    >
                                        <Add sx={{ fontSize: 32, fontWeight: 'bold' }} />
                                    </IconButton>
                                </div>
                                {tagMechanismsMap[family.uuid]?.map((tagMechanism) => (
                                    <TreeItem
                                        key={tagMechanism.uuid}
                                        itemId={tagMechanism.uuid}
                                        label={<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <span>{tagMechanism.tag}</span>
                                            <IconButton
                                                onClick={() => {
                                                    handleDownloadClick(tagMechanism.uuid);
                                                }}
                                                aria-label="download"
                                                style={{ color: 'green' }}
                                            >
                                                <GetApp />
                                            </IconButton>
                                        </div>}
                                        sx={treeItemStyle}
                                        onClick={() => setSelectedTagMechanism(tagMechanism.uuid)}
                                    />
                                ))}
                            </TreeItem>
                        ))}
                    </SimpleTreeView>
                </>
            )}
        </div>
    );
}

export default RenderFamilyTree;
