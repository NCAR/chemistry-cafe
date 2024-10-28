import React, { useEffect, useRef, useState } from "react";

import {
  getSpeciesByMechanismId,
  getReactionsByMechanismId,
  getSpeciesByFamilyId,
  getReactionsByFamilyId,
} from "../../API/API_GetMethods";
import {
  Family,
  Mechanism,
  MechanismReaction,
  MechanismSpecies,
  Reaction,
  ReactionSpecies,
  Species,
} from "../../API/API_Interfaces";
import {
  createSpecies,
  createReaction,
  addSpeciesToMechanism,
  addReactionToMechanism,
  addSpeciesToReaction,
  createFamily,
  createMechanism,
} from "../../API/API_CreateMethods";

import {
  Modal,
  Box,
  TextField,
  Button,
  Typography,
  Select,
  MenuItem,
} from "@mui/material";

const style = {
  position: "absolute" as "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 600,
  bgcolor: "background.paper",
  border: "2px solid #000",
  boxShadow: 24,
  p: 4,
};

interface CreatePublishModalProps {
  open: boolean;
  onClose: () => void;
}

interface CreateShareModalProps {
  open: boolean;
  onClose: () => void;
}

interface CreateDOIModalProps {
  open: boolean;
  onClose: () => void;
}

interface CreateFamilyModalProps {
  open: boolean;
  onClose: () => void;
  setCreatedFamilyBool: React.Dispatch<React.SetStateAction<boolean>>;
}

interface CreateMechanismModalProps {
  open: boolean;
  onClose: () => void;
  selectedFamilyId: number | null;
  setCreatedMechanismBool: React.Dispatch<React.SetStateAction<boolean>>;
}

interface CreateSpeciesModalProps {
  open: boolean;
  onClose: () => void;
  selectedFamilyId: number | null;
  selectedMechanismId: number | null;
  setSpeciesCreated: React.Dispatch<React.SetStateAction<boolean>>;
}

interface CreateReactionModalProps {
  open: boolean;
  onClose: () => void;
  selectedFamilyId: number | null;
  selectedMechanismId: number | null;
  setReactionCreated: React.Dispatch<React.SetStateAction<boolean>>;
}

interface CreateReactantModalProps {
  open: boolean;
  onClose: () => void;
  selectedMechanismId: number | null;
  selectedReaction: Reaction | null;
  setCreatedReactantBool: React.Dispatch<React.SetStateAction<boolean>>;
  setReactionUpdated: React.Dispatch<React.SetStateAction<boolean>>;
}

interface CreateProductModalProps {
  open: boolean;
  onClose: () => void;
  selectedMechanismId: number | null;
  selectedReaction: Reaction | null;
  setCreatedProductBool: React.Dispatch<React.SetStateAction<boolean>>;
  setReactionUpdated: React.Dispatch<React.SetStateAction<boolean>>;
}

export const CreatePublishModal: React.FC<CreatePublishModalProps> = ({
  open,
  onClose,
}) => {
  return (
    <Modal open={open} onClose={onClose}>
      <Box sx={style}>
        <Typography variant="h6">Published!</Typography>
      </Box>
    </Modal>
  );
};

export const CreateShareModal: React.FC<CreateShareModalProps> = ({
  open,
  onClose,
}) => {
  return (
    <Modal open={open} onClose={onClose}>
      <Box sx={style}>
        <Typography variant="h6">Shared!</Typography>
      </Box>
    </Modal>
  );
};

export const CreateDOIModal: React.FC<CreateDOIModalProps> = ({
  open,
  onClose,
}) => {
  return (
    <Modal open={open} onClose={onClose}>
      <Box sx={style}>
        <Typography variant="h6">DOI!</Typography>
      </Box>
    </Modal>
  );
};

export const CreateFamilyModal: React.FC<CreateFamilyModalProps> = ({
  open,
  onClose,
  setCreatedFamilyBool,
}) => {
  const createFamilyRef = useRef("");

  const handleCreateFamilyClick = async () => {
    try {
      const newFamily: Family = {
        id: 0,
        name: createFamilyRef.current,
        description: "",
        created_by: "current_user",
      };
      await createFamily(newFamily);
      createFamilyRef.current = "";
      onClose();
      setCreatedFamilyBool(true);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <Modal open={open} onClose={onClose}>
      <Box sx={style}>
        Enter Name for Family below.
        <TextField
          id="family-name"
          label="Name"
          onChange={(e) => (createFamilyRef.current = e.target.value)}
          fullWidth
          margin="normal"
        />
        <Button onClick={handleCreateFamilyClick}>Submit</Button>
      </Box>
    </Modal>
  );
};

export const CreateMechanismModal: React.FC<CreateMechanismModalProps> = ({
  open,
  onClose,
  selectedFamilyId,
  setCreatedMechanismBool,
}) => {
  const [speciesList, setSpeciesList] = useState<Species[]>([]);
  const [selectedSpeciesIds, setSelectedSpeciesIds] = useState<number[]>([]);

  const [reactionList, setReactionList] = useState<Reaction[]>([]);
  const [selectedReactionIds, setSelectedReactionIds] = useState<number[]>([]);

  const createMechanismRef = useRef("");

  useEffect(() => {
    const fetchSpeciesReactions = async () => {
      try {
        if (selectedFamilyId) {
          const species = await getSpeciesByFamilyId(selectedFamilyId);
          setSpeciesList(species);

          const reactions = await getReactionsByFamilyId(selectedFamilyId);
          setReactionList(reactions);
        }
      } catch (error) {
        console.error(error);
      }
    };

    fetchSpeciesReactions();
  }, [open, selectedFamilyId]);

  const handleCreateMechanismClick = async () => {
    try {
      const mechanismData: Mechanism = {
        id: 0,
        family_id: selectedFamilyId!,
        name: createMechanismRef.current,
        description: "",
        created_by: "current_user",
        createdDate: "",
      };

      const createdMechanism = await createMechanism(mechanismData);

      for (const speciesId of selectedSpeciesIds) {
        const mechanismSpecies: MechanismSpecies = {
          id: 0,
          mechanism_id: createdMechanism.id,
          species_id: speciesId,
        };
        await addSpeciesToMechanism(mechanismSpecies);
      }

      for (const reactionId of selectedReactionIds) {
        const mechanismReaction: MechanismReaction = {
          id: 0,
          mechanism_id: createdMechanism.id,
          reaction_id: reactionId,
        };
        await addReactionToMechanism(mechanismReaction);
      }

      createMechanismRef.current = "";
      setSelectedSpeciesIds([]);
      setSelectedReactionIds([]);
      onClose();
      setCreatedMechanismBool(true);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <Modal open={open} onClose={onClose}>
      <Box sx={style}>
        <Typography variant="h6">Enter Name for Mechanism</Typography>
        <TextField
          id="mechanism-name"
          label="Tag / Name"
          onChange={(e) => (createMechanismRef.current = e.target.value)}
          fullWidth
          margin="normal"
        />
        <p />
        <Typography variant="h6" style={{ marginTop: "1rem" }}>
          {" "}
          Select species (Multiple Selection)
        </Typography>
        <Select
          label="Species"
          multiple
          value={selectedSpeciesIds}
          onChange={(e) => setSelectedSpeciesIds(e.target.value as number[])}
          fullWidth
        >
          {speciesList.map((species) => (
            <MenuItem key={species.id} value={species.id}>
              {species.name}
            </MenuItem>
          ))}
        </Select>
        <Typography variant="h6" style={{ marginTop: "1rem" }}>
          Select Reactions (Multiple Selection)
        </Typography>
        <Select
          multiple
          value={selectedReactionIds}
          onChange={(e) => setSelectedReactionIds(e.target.value as number[])}
          fullWidth
        >
          {reactionList.map((reaction) => (
            <MenuItem key={reaction.id} value={reaction.id}>
              {reaction.equation}
            </MenuItem>
          ))}
        </Select>
        <Button
          variant="contained"
          onClick={handleCreateMechanismClick}
          style={{ marginTop: "1rem" }}
        >
          Submit
        </Button>
      </Box>
    </Modal>
  );
};

export const CreateSpeciesModal: React.FC<CreateSpeciesModalProps> = ({
  open,
  onClose,
  selectedFamilyId,
  selectedMechanismId,
  setSpeciesCreated,
}) => {
  const createSpeciesRef = useRef("");

  const [speciesList, setSpeciesList] = useState<Species[]>([]);
  const [selectedSpeciesIds, setSelectedSpeciesIds] = useState<number[]>([]);

  useEffect(() => {
    const fetchSpecies = async () => {
      try {
        if (selectedFamilyId && selectedMechanismId) {
          const speciesFamily = await getSpeciesByFamilyId(selectedFamilyId);
          const speciesMechanism = await getSpeciesByMechanismId(
            selectedMechanismId
          );

          const uniqueSpecies = speciesFamily.filter(
            (species: Species) =>
              !speciesMechanism.some(
                (mechSpecies) => mechSpecies.id === species.id
              )
          );
          setSpeciesList(uniqueSpecies);
        }
      } catch (error) {
        console.error(error);
      }
    };

    fetchSpecies();
  }, [open, selectedFamilyId, selectedMechanismId]);

  const handleCreateSpeciesClick = async () => {
    try {
      if (selectedFamilyId && selectedMechanismId) {
        if (createSpeciesRef.current !== "") {
          const speciesData: Species = {
            id: 0,
            name: createSpeciesRef.current,
            description: "",
            created_by: "current_user",
            created_date: "",
          };
          const newSpecies = await createSpecies(speciesData);

          const mechanismSpecies: MechanismSpecies = {
            id: 0,
            mechanism_id: selectedMechanismId,
            species_id: newSpecies.id,
          };
          await addSpeciesToMechanism(mechanismSpecies);
        }
        for (const speciesId of selectedSpeciesIds) {
          const mechanismSpecies: MechanismSpecies = {
            id: 0,
            mechanism_id: selectedMechanismId,
            species_id: speciesId,
          };
          await addSpeciesToMechanism(mechanismSpecies);
        }
        createSpeciesRef.current = "";
        setSelectedSpeciesIds([]);
        onClose();
        setSpeciesCreated(true);
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <Modal open={open} onClose={onClose}>
      <Box sx={style}>
        <Typography variant="h6">Enter Name for New Species</Typography>
        <TextField
          id="species-name"
          label="Name"
          onChange={(e) => (createSpeciesRef.current = e.target.value)}
          fullWidth
          margin="normal"
        />
        {speciesList.length > 0 && (
          <>
            <Typography variant="subtitle1" style={{ marginTop: "1rem" }}>
              Or Pick Existing Species in Family (Multiple Selection)
            </Typography>
            <Select
              label="Pick Existing Species"
              multiple
              value={selectedSpeciesIds}
              onChange={(e) =>
                setSelectedSpeciesIds(e.target.value as number[])
              }
              fullWidth
              style={{ marginTop: "1rem" }}
            >
              {speciesList.map((species) => (
                <MenuItem key={species.id} value={species.id}>
                  {species.name}
                </MenuItem>
              ))}
            </Select>
          </>
        )}
        {speciesList.length === 0 && (
          <Typography variant="subtitle1" style={{ marginTop: "1rem" }}>
            All family's species are already in this mechanism
          </Typography>
        )}
        <Button
          variant="contained"
          onClick={handleCreateSpeciesClick}
          style={{ marginTop: "1rem" }}
        >
          Submit
        </Button>
      </Box>
    </Modal>
  );
};

export const CreateReactionModal: React.FC<CreateReactionModalProps> = ({
  open,
  onClose,
  selectedFamilyId,
  selectedMechanismId,
  setReactionCreated,
}) => {
  const [selectedReactionType, setSelectedReactionType] = useState<string>("");
  const [reactionList, setReactionList] = useState<Reaction[]>([]);
  const [selectedReactionIds, setSelectedReactionIds] = useState<number[]>([]);

  useEffect(() => {
    const fetchReactions = async () => {
      try {
        if (selectedFamilyId && selectedMechanismId) {
          const reactionsFamily = await getReactionsByFamilyId(
            selectedFamilyId
          );
          console.log("Reactions Family: ", reactionsFamily);
          const reactionsMechanism = await getReactionsByMechanismId(
            selectedMechanismId
          );
          console.log("Reactions mechanism: ", reactionsMechanism);

          const uniqueReactions = reactionsFamily.filter(
            (reaction: Reaction) =>
              !reactionsMechanism.some(
                (mechReaction) => mechReaction.id === reaction.id
              )
          );
          setReactionList(uniqueReactions);
        }
      } catch (error) {
        console.error(error);
      }
    };
    fetchReactions();
  }, [open, selectedFamilyId, selectedMechanismId]);

  const handleCreateReactionClick = async () => {
    try {
      if (selectedFamilyId && selectedMechanismId) {
        if (selectedReactionType !== "") {
          const reactionData: Reaction = {
            id: 0,
            equation: "",
            description: "",
            createdBy: "current_user",
            createdDate: "",
          };
          const newReaction = await createReaction(reactionData);

          const mechanismReaction: MechanismReaction = {
            id: 0,
            mechanism_id: selectedMechanismId,
            reaction_id: newReaction.id,
          };
          await addReactionToMechanism(mechanismReaction);

          for (const reactionId of selectedReactionIds) {
            const mechanismReaction: MechanismReaction = {
              id: 0,
              mechanism_id: selectedMechanismId,
              reaction_id: reactionId,
            };
            await addReactionToMechanism(mechanismReaction);
          }
          setSelectedReactionType("");
          setSelectedReactionIds([]);
          setReactionCreated(true);
          onClose();
        }
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <Modal open={open} onClose={onClose}>
      <Box sx={style}>
        <Typography variant="h6">
          Pick a Reaction Type for New Reaction
        </Typography>
        <Select
          labelId="reaction-type-select-label"
          id="reaction-type-select"
          value={selectedReactionType}
          onChange={(e) => setSelectedReactionType(e.target.value as string)}
          fullWidth
          style={{ marginTop: "1rem" }}
        >
          <MenuItem value="">N/A</MenuItem>
          <MenuItem value="Arrhenius">Arrhenius</MenuItem>
          <MenuItem value="Ternary Chemical Activation">
            Ternary Chemical Activation
          </MenuItem>
          <MenuItem value="Troe (Fall-Off)">Troe (Fall-Off)</MenuItem>
          <MenuItem value="Tunneling">Tunneling</MenuItem>
        </Select>
        {reactionList.length > 0 && (
          <>
            <Typography variant="subtitle1" style={{ marginTop: "1rem" }}>
              Or Pick Existing Reactions in Family (Multiple Selection)
            </Typography>
            <Select
              multiple
              value={selectedReactionIds}
              onChange={(e) =>
                setSelectedReactionIds(e.target.value as number[])
              }
              fullWidth
              style={{ marginTop: "1rem" }}
            >
              {reactionList.map((reaction) => (
                <MenuItem key={reaction.id} value={reaction.id}>
                  {reaction.equation}
                </MenuItem>
              ))}
            </Select>
          </>
        )}
        {reactionList.length === 0 && (
          <Typography variant="subtitle1" style={{ marginTop: "1rem" }}>
            All family's reactions are already in this mechanism
          </Typography>
        )}
        <Button
          variant="contained"
          onClick={handleCreateReactionClick}
          style={{ marginTop: "1rem" }}
        >
          Submit
        </Button>
      </Box>
    </Modal>
  );
};

const CreateReactantModal: React.FC<CreateReactantModalProps> = ({
  open,
  onClose,
  selectedMechanismId,
  selectedReaction,
  setCreatedReactantBool,
  setReactionUpdated,
}) => {
  const [speciesList, setSpeciesList] = useState<Species[]>([]);
  const [selectedSpeciesId, setSelectedSpeciesId] = useState<number | null>(
    null
  );
  const createReactantQuantityRef = useRef("");

  useEffect(() => {
    const fetchSpecies = async () => {
      try {
        if (selectedMechanismId) {
          const species = await getSpeciesByMechanismId(selectedMechanismId);
          setSpeciesList(species);
        }
      } catch (error) {
        console.error(error);
      }
    };

    fetchSpecies();
  }, [open, selectedMechanismId]);

  useEffect(() => {
    setSelectedSpeciesId(null);
  }, [onClose]);

  const handleCreateReactantClick = async () => {
    try {
      const reactionSpecies: ReactionSpecies = {
        id: 0,
        reaction_id: selectedReaction?.id as number,
        species_id: selectedSpeciesId as number,
        quantity: parseInt(createReactantQuantityRef.current),
        role: "reactant",
      };

      await addSpeciesToReaction(reactionSpecies);

      createReactantQuantityRef.current = "";
      setSelectedSpeciesId(null);
      onClose();
      setCreatedReactantBool(true);
      setReactionUpdated(true);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <Modal open={open} onClose={onClose}>
      <Box sx={style}>
        <Typography variant="h6">Select a Species </Typography>
        <Select
          label="Species"
          value={selectedSpeciesId || ""}
          onChange={(e) => setSelectedSpeciesId(e.target.value as number)}
          fullWidth
          style={{ marginTop: "1rem" }}
        >
          {speciesList.map((species) => (
            <MenuItem key={species.id} value={species.id}>
              {species.name}
            </MenuItem>
          ))}
        </Select>
        <Typography variant="h6" style={{ marginTop: "1rem" }}>
          Input Quantity
        </Typography>
        <TextField
          id="quantity"
          label="Quantity"
          type="number"
          onChange={(e) => (createReactantQuantityRef.current = e.target.value)}
          fullWidth
          margin="normal"
        />
        <Button
          variant="contained"
          onClick={handleCreateReactantClick}
          style={{ marginTop: "1rem" }}
        >
          \ Submit
        </Button>
      </Box>
    </Modal>
  );
};

const CreateProductModal: React.FC<CreateProductModalProps> = ({
  open,
  onClose,
  selectedMechanismId,
  selectedReaction,
  setCreatedProductBool,
  setReactionUpdated,
}) => {
  const [speciesList, setSpeciesList] = useState<Species[]>([]);
  const [selectedSpeciesId, setSelectedSpeciesId] = useState<number | null>(
    null
  );
  const createProductQuantityRef = useRef("");

  useEffect(() => {
    const fetchSpecies = async () => {
      try {
        if (selectedMechanismId) {
          const species = await getSpeciesByMechanismId(selectedMechanismId);
          setSpeciesList(species);
        }
      } catch (error) {
        console.error(error);
      }
    };

    fetchSpecies();
  }, [open, selectedMechanismId]);

  useEffect(() => {
    setSelectedSpeciesId(null);
  }, [onClose]);

  const handleCreateProductClick = async () => {
    try {
      const reactionSpecies: ReactionSpecies = {
        id: 0,
        reaction_id: selectedReaction?.id as number,
        species_id: selectedSpeciesId as number,
        quantity: parseInt(createProductQuantityRef.current),
        role: "product",
      };

      await addSpeciesToReaction(reactionSpecies);

      createProductQuantityRef.current = "";
      setSelectedSpeciesId(null);
      onClose();
      setCreatedProductBool(true);
      setReactionUpdated(true);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <Modal open={open} onClose={onClose}>
      <Box sx={style}>
        <Typography variant="h6"> Select a species</Typography>
        <Select
          label="Species"
          value={selectedSpeciesId || ""}
          onChange={(e) => setSelectedSpeciesId(e.target.value as number)}
          fullWidth
          style={{ marginTop: "1rem" }}
        >
          {speciesList.map((species) => (
            <MenuItem key={species.id} value={species.id}>
              {species.name}
            </MenuItem>
          ))}
        </Select>
        <Typography variant="h6" style={{ marginTop: "1rem" }}>
          Input Quantity
        </Typography>
        <TextField
          id="quantity"
          label="Quantity"
          onChange={(e) => (createProductQuantityRef.current = e.target.value)}
          fullWidth
          margin="normal"
        />
        <Button
          variant="contained"
          onClick={handleCreateProductClick}
          style={{ marginTop: "1rem" }}
        >
          Submit
        </Button>
      </Box>
    </Modal>
  );
};
