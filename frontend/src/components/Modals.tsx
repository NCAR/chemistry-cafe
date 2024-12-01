// modals.tsx
import React, { useEffect, useRef, useState } from "react";

import {
  getSpeciesByMechanismId,
  getReactionsByMechanismId,
  getSpeciesByFamilyId,
  getReactionsByFamilyId,
  getReactantsByReactionIdAsync,
  getProductsByReactionIdAsync,
} from "../API/API_GetMethods";
import {
  Family,
  Mechanism,
  MechanismReaction,
  MechanismSpecies,
  Reaction,
  ReactionSpecies,
  Species,
  ReactionSpeciesDto,
  Property,
} from "../API/API_Interfaces";
import {
  createSpecies,
  createReaction,
  addSpeciesToMechanism,
  addReactionToMechanism,
  addSpeciesToReaction,
  createFamily,
  createMechanism,
  createProperty,
} from "../API/API_CreateMethods";

import {
  Modal,
  Box,
  TextField,
  Button,
  Typography,
  Select,
  MenuItem,
  Alert,
} from "@mui/material";
import {
  updateFamily,
  updateMechanism,
  updateProperty,
  updateReaction,
  updateSpecies,
} from "../API/API_UpdateMethods";

import Snackbar from '@mui/material/Snackbar';


const style = {
  position: "absolute" as const,
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

interface UpdateFamilyModalProps {
  open: boolean;
  onClose: () => void;
  selectedFamily: Family | null;
  onFamilyUpdated: (updatedFamily: Family) => void;
}

interface CreateMechanismModalProps {
  open: boolean;
  onClose: () => void;
  selectedFamilyId: string | null;
  setCreatedMechanismBool: React.Dispatch<React.SetStateAction<boolean>>;
}

interface UpdateMechanismModalProps {
  open: boolean;
  onClose: () => void;
  selectedMechanism: Mechanism | null;
  onMechanismUpdated: (updatedMechanism: Mechanism) => void;
}

interface CreateSpeciesModalProps {
  open: boolean;
  onClose: () => void;
  selectedFamilyId: string | null;
  selectedMechanismId: string | null;
  setSpeciesCreated: React.Dispatch<React.SetStateAction<boolean>>;
}

interface UpdateSpeciesModalProps {
  open: boolean;
  onClose: () => void;
  selectedFamilyId: string | null;
  selectedMechanismId: string | null;
  selectedSpecies: Species | null;
  selectedSpeciesProperties: Property | null;
  setSpeciesUpdated: React.Dispatch<React.SetStateAction<boolean>>;
}

interface CreateReactionModalProps {
  open: boolean;
  onClose: () => void;
  selectedFamilyId: string | null;
  selectedMechanismId: string | null;
  selectedMechanismName: string | null;
  reactionsCount: number;
  setReactionCreated: React.Dispatch<React.SetStateAction<boolean>>;
}

interface UpdateReactionModalProps {
  open: boolean;
  onClose: () => void;
  selectedFamilyId: string | null;
  selectedMechanismId: string | null;
  selectedMechanismName: string | null;
  reactionsCount: number;
  setReactionUpdated: React.Dispatch<React.SetStateAction<boolean>>;
  selectedReaction: Reaction | null;
}

interface CreateReactantModalProps {
  open: boolean;
  onClose: () => void;
  selectedMechanismId: string | null;
  selectedReaction: Reaction | null;
  setCreatedReactantBool: React.Dispatch<React.SetStateAction<boolean>>;
  setReactionUpdated: React.Dispatch<React.SetStateAction<boolean>>;
}

interface CreateProductModalProps {
  open: boolean;
  onClose: () => void;
  selectedMechanismId: string | null;
  selectedReaction: Reaction | null;
  setCreatedProductBool: React.Dispatch<React.SetStateAction<boolean>>;
  setReactionUpdated: React.Dispatch<React.SetStateAction<boolean>>;
}

interface HandleActionWithDialogOptions<T extends string | number> {
  deleteType: string;
  action: (id: T) => Promise<void>;
  id: T;
  onClose: () => void;
  // only include if deleting species
  setSpeciesRowData?: React.Dispatch<React.SetStateAction<Species[]>>;
  speciesRowData?: Species[];
  // only include if deleting a reaction
  setReactionsRowData?: React.Dispatch<React.SetStateAction<Reaction[]>>;
  reactionsRowData?: Reaction[];
  // only include if deleting a mechanism
  setSelectedMechanism?: React.Dispatch<React.SetStateAction<Mechanism | null>>;
  setSelectedMechanismId?: React.Dispatch<React.SetStateAction<string | null>>;
  setSelectedMechanismName?: React.Dispatch<React.SetStateAction<string | null>>;

  // only include if deleting a family
  setSelectedFamily?: React.Dispatch<React.SetStateAction<Family | null>>;
  setSelectedFamilyId?: React.Dispatch<React.SetStateAction<string | null>>;
  // only include if deleting family or mechanism
  setBool?: React.Dispatch<React.SetStateAction<boolean>>;
}

export const handleActionWithDialog = async <T extends string | number>(
  options: HandleActionWithDialogOptions<T>
): Promise<void> => {
  const {
    deleteType,
    action,
    id,
    onClose,
    setSpeciesRowData,
    speciesRowData,
    setReactionsRowData,
    reactionsRowData,
    setBool,

    setSelectedMechanism,
    setSelectedMechanismId,
    setSelectedMechanismName,

    setSelectedFamily,
    setSelectedFamilyId,
  } = options;

  await action(id);

  if (deleteType === "Species" && setSpeciesRowData && speciesRowData) {
    setSpeciesRowData(speciesRowData.filter((speciesRow) => speciesRow.id !== id));
  } 
  else if (deleteType === "Reaction" && setReactionsRowData && reactionsRowData) {
    setReactionsRowData(reactionsRowData.filter((reactionRow) => reactionRow.id !== id));
  }
  else if (deleteType === "Mechanism" && setSelectedMechanism && setSelectedMechanismId
          && setSelectedMechanismName){
    setSelectedMechanism(null);
    setSelectedMechanismId(null);
    setSelectedMechanismName(null);
  }

  else if (deleteType === "Species" && setSelectedFamily && setSelectedFamilyId){
    setSelectedFamily(null);
    setSelectedFamilyId(null);
  }

  if (setBool) {
    setBool(true);
  }

  onClose();
};

  

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
  const [showCreateFamilyAlert, setShowCreateFamilyAlert] = useState(false);

  const handleCreateFamilyClick = async () => {
    // dont allow for a family with no name
    if (createFamilyRef.current === ""){
      setShowCreateFamilyAlert(true);
    }
    else{

      try {
        const newFamily: Family = {
          name: createFamilyRef.current,
          description: "",
          createdBy: "",
        };
        await createFamily(newFamily);
        createFamilyRef.current = "";
        onClose();
        setCreatedFamilyBool(true);
      } catch (error) {
        console.error(error);
      }
    }
  };

  const handleAlertClose = () => {
    setShowCreateFamilyAlert(false)
  }

  return (
    <div>
    <Modal open={open} onClose={onClose}>
      <Box sx={style}>
        Enter Name for Family below.
        <TextField
          id="family-name"
          label="Name"
          required={true}
          onChange={(e) => (createFamilyRef.current = e.target.value)}
          fullWidth
          margin="normal"
        />
        <Button variant={"contained"} onClick={handleCreateFamilyClick}>Submit</Button>
        
      </Box>
    </Modal>

    <Snackbar open={showCreateFamilyAlert}
      autoHideDuration={5000}
      onClose={handleAlertClose}
      anchorOrigin={{vertical: "top", horizontal: "center"}}>

      <Alert onClose={handleAlertClose} severity="warning"
        variant="filled" sx={{ width: '100%' }}>

        Name must not be empty!
      </Alert>
    </Snackbar>
    </div>
  );
};

export const UpdateFamilyModal: React.FC<UpdateFamilyModalProps> = ({
  open,
  onClose,
  selectedFamily,
  onFamilyUpdated
}) => {
  const [familyName, setFamilyName] = useState(selectedFamily?.name || "")
  const [showUpdateFamilyAlert, setShowUpdateFamilyAlert] = useState(false);

  useEffect(() => {
    setFamilyName(selectedFamily?.name || ""); // Update familyName when selectedFamily changes
  }, [selectedFamily, open]);


  const handleUpdateFamilyClick = async () => {
    // dont allow for a family with no name
    if (familyName === ""){
      setShowUpdateFamilyAlert(true);
    }
    else{

      try {
        const newFamily: Family = {
          id: selectedFamily?.id!,
          name: familyName!,
          description: selectedFamily?.description!,
          createdBy: selectedFamily?.createdBy!,
        };
        await updateFamily(newFamily);
        onFamilyUpdated(newFamily);
        onClose();
      } catch (error) {
        console.error(error);
      }
    }
  };

  const handleAlertClose = () => {
    setShowUpdateFamilyAlert(false)
  }

  return (
    <div>
    <Modal open={open} onClose={onClose}>
      <Box sx={style}>
        Enter Name for Family below.
        <TextField
          id="family-name"
          label="Name"
          required={true}
          value={familyName}
          onChange={(e) => (setFamilyName(e.target.value))}
          fullWidth
          margin="normal"
        />
        <Button variant={"contained"} onClick={handleUpdateFamilyClick}>Submit</Button>
        
      </Box>
    </Modal>

    <Snackbar open={showUpdateFamilyAlert}
      autoHideDuration={5000}
      onClose={handleAlertClose}
      anchorOrigin={{vertical: "top", horizontal: "center"}}>

      <Alert onClose={handleAlertClose} severity="warning"
        variant="filled" sx={{ width: '100%' }}>

        Name must not be empty!
      </Alert>
    </Snackbar>
    </div>
  );
};

export const CreateMechanismModal: React.FC<CreateMechanismModalProps> = ({
  open,
  onClose,
  selectedFamilyId,
  setCreatedMechanismBool,
}) => {
  const [speciesList, setSpeciesList] = useState<Species[]>([]);
  const [selectedSpeciesIds, setSelectedSpeciesIds] = useState<string[]>([]);

  const [reactionList, setReactionList] = useState<Reaction[]>([]);
  const [selectedReactionIds, setSelectedReactionIds] = useState<string[]>([]);

  const [reactionEquations, setReactionEquations] = useState<{
    [key: string]: string;
  }>({});

  const createMechanismRef = useRef("");
  console.log("here");
  console.log(Object.entries(reactionEquations));

  useEffect(() => {
    const fetchSpeciesReactions = async () => {
      try {
        if (selectedFamilyId) {
          const species = await getSpeciesByFamilyId(selectedFamilyId);
          setSpeciesList(species);

          const reactions = await getReactionsByFamilyId(selectedFamilyId);
          console.log("reactions by family id");
          console.log(reactions);
          setReactionList(reactions);
        }
      } catch (error) {
        console.error(error);
      }
    };

    fetchSpeciesReactions();
  }, [open, selectedFamilyId]);

  useEffect(() => {
    const fetchReactionEquations = async () => {
      const equations: { [key: string]: string } = {};
      reactionList.map((reactionItem) =>{
        if (reactionItem.description !== null) {
          // make regex expression
          let regex =
          /^(Arrhenius|Branched|Emission|First-Order Loss|Photolysis|Surface \(Heterogeneous\)|Ternary Chemical Activation|Troe \(Fall-Off\)|Tunneling|N\/A)(?: Reaction \d+)?: (.+)$/i;

          let matches = reactionItem.description.match(regex);

          // console.log("heres the matches:");
          // console.log(matches);
          // console.log("heres the description:");
          // console.log(reactionItem.description)

          if (matches) {
            // Extract components from matches
            const reaction = matches[2].trim();
            equations[reactionItem.id!] = reaction;
          } else {
            equations[reactionItem.id!] = "";
            console.error("Error, data in a reaction did not match the specified format!");
          }
        }

        setReactionEquations(equations);
      });
    };

    fetchReactionEquations();


  }, [reactionList]);

  const handleCreateMechanismClick = async () => {
    try {
      const mechanismData: Mechanism = {
        family_id: selectedFamilyId!,
        name: createMechanismRef.current,
        description: "",
        created_by: "current_user",
      };

      const createdMechanism = await createMechanism(mechanismData);

      for (const speciesId of selectedSpeciesIds) {
        const mechanismSpecies: MechanismSpecies = {
          mechanism_id: createdMechanism.id!,
          species_id: speciesId,
        };
        await addSpeciesToMechanism(mechanismSpecies);
      }

      for (const reactionId of selectedReactionIds) {
        const mechanismReaction: MechanismReaction = {
          mechanism_id: createdMechanism.id!,
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
          Select species (Multiple Selection)
        </Typography>
        <Select
          label="Species"
          multiple
          value={selectedSpeciesIds}
          onChange={(e) => setSelectedSpeciesIds(e.target.value as string[])}
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
          onChange={(e) => setSelectedReactionIds(e.target.value as string[])}
          fullWidth
        >
          {reactionList.map((reaction) => (
            <MenuItem key={reaction.id} value={reaction.id}>
              {reactionEquations[reaction.id!] || "Loading..."}
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

export const UpdateMechanismModal: React.FC<UpdateMechanismModalProps> = ({
  open,
  onClose,
  selectedMechanism,
  onMechanismUpdated
}) => {
  const [mechanismName, setMechansimName] = useState(selectedMechanism?.name || "")
  const [showUpdateMechanismAlert, setShowUpdateMechanismAlert] = useState(false);

  useEffect(() => {
    setMechansimName(selectedMechanism?.name || ""); // Update familyName when selectedFamily changes
  }, [selectedMechanism, open]);


  const handleUpdateMechanismClick = async () => {
    // dont allow for a family with no name
    if (mechanismName === ""){
      setShowUpdateMechanismAlert(true);
    }
    else{

      try {
        const newMechanism: Mechanism = {
          id: selectedMechanism?.id!,
          family_id: selectedMechanism?.family_id!,
          name: mechanismName!,
          description: selectedMechanism?.description!,
          created_by: selectedMechanism?.created_by!,
        };
        await updateMechanism(newMechanism);
        onMechanismUpdated(newMechanism);
        onClose();
      } catch (error) {
        console.error(error);
      }
    }
  };

  const handleAlertClose = () => {
    setShowUpdateMechanismAlert(false)
  }

  return (
    <div>
    <Modal open={open} onClose={onClose}>
      <Box sx={style}>
        Enter Name for Mechanism below.
        <TextField
          id="mechanism-name"
          label="Name"
          required={true}
          value={mechanismName}
          onChange={(e) => (setMechansimName(e.target.value))}
          fullWidth
          margin="normal"
        />
        <Button variant={"contained"} onClick={handleUpdateMechanismClick}>Submit</Button>
        
      </Box>
    </Modal>

    <Snackbar open={showUpdateMechanismAlert}
      autoHideDuration={5000}
      onClose={handleAlertClose}
      anchorOrigin={{vertical: "top", horizontal: "center"}}>

      <Alert onClose={handleAlertClose} severity="warning"
        variant="filled" sx={{ width: '100%' }}>

        Name must not be empty!
      </Alert>
    </Snackbar>
    </div>
  );
};

export const CreateSpeciesModal: React.FC<CreateSpeciesModalProps> = ({
  open,
  onClose,
  selectedFamilyId,
  selectedMechanismId,
  setSpeciesCreated,
}) => {
  const [speciesName, setSpeciesName] = useState("");
  const [speciesDescription, setSpeciesDescription] = useState("");

  const [concentration, setConcentration] = useState<number>(0);
  const [tolerance, setTolerance] = useState<number>(0);
  const [weight, setWeight] = useState<number>(0);
  const [diffusion, setDiffusion] = useState<number>(0);

  const handleCreateSpeciesClick = async () => {
    try {
      if (selectedFamilyId && selectedMechanismId) {
        if (speciesName !== "") {
          const speciesData: Species = {
            name: speciesName,
            description: speciesDescription,
            created_by: "current_user",
          };
          const newSpecies = await createSpecies(speciesData);

          if (newSpecies && newSpecies.id) {
            const mechanismSpecies: MechanismSpecies = {
              mechanism_id: selectedMechanismId,
              species_id: newSpecies.id!,
            };
            await addSpeciesToMechanism(mechanismSpecies);

            // make the corresponding property
            const propertyData: Property = {
              speciesId: newSpecies.id!,
              mechanismId: selectedMechanismId,
              tolerance: tolerance,
              weight: weight,
              concentration: concentration,
              diffusion: diffusion,
            };
            const createdProperty = await createProperty(propertyData);
            console.log(createdProperty);
          }
        }

        setSpeciesName("");
        setSpeciesDescription("");

        onClose();
        setSpeciesCreated(true);
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <Modal open={open} onClose={onClose}>
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          bgcolor: "background.paper",
          border: "2px solid #000",
          boxShadow: 24,
          p: 4,
          width: 600,
          maxHeight: "80vh", // Set maximum height to 80% of viewport height
          overflowY: "auto", // Enable vertical scrolling if content overflows
        }}
      >
        <h1>Create New Species</h1>
        <Box sx={{ display: "flex", flexDirection: "column" }}>
          <Box
            sx={{
              display: "flex",
              borderBottom: "1px solid #ccc",
              fontWeight: "bold",
            }}
          >
            <TextField
              id="species-name"
              label="Name"
              onChange={(e) => setSpeciesName(e.target.value)}
              fullWidth
              margin="normal"
            />
          </Box>

          <Box
            sx={{
              display: "flex",
              gap: "1rem",
              borderBottom: "1px solid #ccc",
              pb: "0.5rem",
              fontWeight: "bold",
            }}
          >
            <TextField
              id="species-description"
              label="Description"
              onChange={(e) => setSpeciesDescription(e.target.value)}
              fullWidth
              margin="normal"
            />
          </Box>

          <Box
            sx={{
              display: "flex",
              borderBottom: "1px solid #ccc",
              fontWeight: "bold",
            }}
          >
            <TextField
              id="species-concentration"
              label="Fixed Concentration"
              type="number"
              onChange={(e) => setConcentration(Number(e.target.value))}
              fullWidth
              margin="normal"
            />
          </Box>

          <Box
            sx={{
              display: "flex",
              gap: "1rem",
              borderBottom: "1px solid #ccc",
              pb: "0.5rem",
              fontWeight: "bold",
            }}
          >
            <TextField
              id="species-convergence-tolerance"
              label="Absolute Convergence Tolerance"
              type="number"
              onChange={(e) => setTolerance(Number(e.target.value))}
              fullWidth
              margin="normal"
            />
          </Box>
          <Box
            sx={{
              display: "flex",
              gap: "1rem",
              borderBottom: "1px solid #ccc",
              pb: "0.5rem",
              fontWeight: "bold",
            }}
          >
            <TextField
              id="species-weight"
              label="Molecular Weight"
              type="number"
              onChange={(e) => setWeight(Number(e.target.value))}
              fullWidth
              margin="normal"
            />
          </Box>

          <Box
            sx={{
              display: "flex",
              gap: "1rem",
              borderBottom: "1px solid #ccc",
              pb: "0.5rem",
              fontWeight: "bold",
            }}
          >
            <TextField
              id="species-diffusion-coefficient"
              label="Diffusion Coefficient"
              type="number"
              onChange={(e) => setDiffusion(Number(e.target.value))}
              fullWidth
              margin="normal"
            />
          </Box>
        </Box>
        <Button sx={{ mt: "2rem" }} onClick={handleCreateSpeciesClick}>
          Submit
        </Button>
      </Box>
    </Modal>
  );
};

export const UpdateSpeciesModal: React.FC<UpdateSpeciesModalProps> = ({
  open,
  onClose,
  selectedFamilyId,
  selectedMechanismId,
  selectedSpecies,
  selectedSpeciesProperties,
  setSpeciesUpdated,
}) => {
  // console.log("in update species");
  // console.log(selectedSpecies?.name);
  // set values to the current values of the selected species
  const [speciesName, setSpeciesName] = useState(selectedSpecies?.name || "");
  const [speciesDescription, setSpeciesDescription] = useState(
    selectedSpecies?.description || "",
  );

  useEffect(() => {
    if (selectedSpecies) {
      setSpeciesName(selectedSpecies.name);
      setSpeciesDescription(selectedSpecies.description || "");
    }
  }, [selectedSpecies]);

  // as we are updating an existing species, should never be empty
  const [concentration, setConcentration] = useState<number>(
    selectedSpeciesProperties?.concentration || 0,
  );
  const [tolerance, setTolerance] = useState<number>(
    selectedSpeciesProperties?.tolerance || 0,
  );
  const [weight, setWeight] = useState<number>(
    selectedSpeciesProperties?.weight || 0,
  );
  const [diffusion, setDiffusion] = useState<number>(
    selectedSpeciesProperties?.diffusion || 0,
  );

  const handleUpdateSpeciesClick = async () => {
    try {
      if (selectedFamilyId && selectedMechanismId) {
        if (speciesName !== "") {
          const speciesData: Species = {
            id: selectedSpecies?.id,
            name: speciesName,
            description: speciesDescription,
            created_by: "current_user",
          };
          const updatedSpecies = await updateSpecies(speciesData);
          console.log(updatedSpecies);

          // now update the property (in this case, needs id)
          const propertyData: Property = {
            id: selectedSpeciesProperties?.id,
            speciesId: selectedSpeciesProperties?.speciesId!,
            mechanismId: selectedSpeciesProperties?.mechanismId!,
            tolerance: tolerance,
            weight: weight,
            concentration: concentration,
            diffusion: diffusion,
          };

          const updatedProperties = await updateProperty(propertyData);
          console.log(updatedProperties);
        }

        setSpeciesName("");
        setSpeciesDescription("");

        onClose();
        setSpeciesUpdated(true);
      }
    } catch (error) {
      console.error(error);
    }
  };

  console.log("open status");
  console.log(open);
  return (
    <Modal open={open} onClose={onClose}>
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          bgcolor: "background.paper",
          border: "2px solid #000",
          boxShadow: 24,
          p: 4,
          width: 600,
          maxHeight: "80vh", // Set maximum height to 80% of viewport height
          overflowY: "auto", // Enable vertical scrolling if content overflows
        }}
      >
        <h1>Edit Species</h1>
        <Box sx={{ display: "flex", flexDirection: "column" }}>
          <Box
            sx={{
              display: "flex",
              borderBottom: "1px solid #ccc",
              fontWeight: "bold",
            }}
          >
            <TextField
              id="species-name"
              label="Name"
              value={speciesName}
              onChange={(e) => setSpeciesName(e.target.value)}
              fullWidth
              margin="normal"
            />
          </Box>

          <Box
            sx={{
              display: "flex",
              gap: "1rem",
              borderBottom: "1px solid #ccc",
              pb: "0.5rem",
              fontWeight: "bold",
            }}
          >
            <TextField
              id="species-description"
              label="Description"
              value={speciesDescription}
              onChange={(e) => setSpeciesDescription(e.target.value)}
              fullWidth
              margin="normal"
            />
          </Box>

          <Box
            sx={{
              display: "flex",
              borderBottom: "1px solid #ccc",
              fontWeight: "bold",
            }}
          >
            <TextField
              id="species-concentration"
              label="Fixed Concentration"
              type="number"
              value={concentration}
              onChange={(e) => setConcentration(Number(e.target.value) || 0)}
              fullWidth
              margin="normal"
            />
          </Box>

          <Box
            sx={{
              display: "flex",
              gap: "1rem",
              borderBottom: "1px solid #ccc",
              pb: "0.5rem",
              fontWeight: "bold",
            }}
          >
            <TextField
              id="species-convergence-tolerance"
              label="Absolute Convergence Tolerance"
              type="number"
              value={tolerance}
              onChange={(e) => setTolerance(Number(e.target.value) || 0)}
              fullWidth
              margin="normal"
            />
          </Box>
          <Box
            sx={{
              display: "flex",
              gap: "1rem",
              borderBottom: "1px solid #ccc",
              pb: "0.5rem",
              fontWeight: "bold",
            }}
          >
            <TextField
              id="species-weight"
              label="Molecular Weight"
              type="number"
              value={weight}
              onChange={(e) => setWeight(Number(e.target.value) || 0)}
              fullWidth
              margin="normal"
            />
          </Box>

          <Box
            sx={{
              display: "flex",
              gap: "1rem",
              borderBottom: "1px solid #ccc",
              pb: "0.5rem",
              fontWeight: "bold",
            }}
          >
            <TextField
              id="species-diffusion-coefficient"
              label="Diffusion Coefficient"
              type="number"
              value={diffusion}
              onChange={(e) => setDiffusion(Number(e.target.value) || 0)}
              fullWidth
              margin="normal"
            />
          </Box>
        </Box>
        <Button sx={{ mt: "2rem" }} onClick={handleUpdateSpeciesClick}>
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
  selectedMechanismName,
  setReactionCreated,
  reactionsCount,
}) => {
  const [selectedReactionType, setSelectedReactionType] = useState<string>("");
  const [reactionList, setReactionList] = useState<Reaction[]>([]);
  const [selectedReactionIds, setSelectedReactionIds] = useState<string[]>([]);
  const [reactionEquations, setReactionEquations] = useState<{
    [key: string]: string;
  }>({});
  const createReactionReactantsRef = useRef("");
  const createReactionProductsRef = useRef("");

  useEffect(() => {
    const fetchReactions = async () => {
      try {
        if (selectedFamilyId && selectedMechanismId) {
          const reactionsFamily =
            await getReactionsByFamilyId(selectedFamilyId);
          const reactionsMechanism =
            await getReactionsByMechanismId(selectedMechanismId);

          const uniqueReactions = reactionsFamily.filter(
            (reaction: Reaction) =>
              !reactionsMechanism.some(
                (mechReaction) => mechReaction.id === reaction.id,
              ),
          );
          setReactionList(uniqueReactions);
        }
      } catch (error) {
        console.error(error);
      }
    };
    fetchReactions();
  }, [open, selectedFamilyId, selectedMechanismId]);

  useEffect(() => {
    const fetchReactionEquations = async () => {
      const equations: { [key: string]: string } = {};
      try {
        await Promise.all(
          reactionList.map(async (reaction) => {
            const reactants = await getReactantsByReactionIdAsync(reaction.id!);
            const products = await getProductsByReactionIdAsync(reaction.id!);
            const reactantNames = reactants
              .map((r: ReactionSpeciesDto) => r.species_name)
              .join(" + ");
            const productNames = products
              .map((p: ReactionSpeciesDto) => p.species_name)
              .join(" + ");
            equations[reaction.id!] = `${reactantNames} -> ${productNames}`;
          }),
        );
        setReactionEquations(equations);
      } catch (error) {
        console.error("Error fetching reaction equations:", error);
      }
    };

    if (reactionList.length > 0) {
      fetchReactionEquations();
    } else {
      setReactionEquations({});
    }
  }, [reactionList]);

  const handleCreateReactionClick = async () => {
    try {
      if (selectedFamilyId && selectedMechanismId) {
        if (selectedReactionType !== "") {
          // console.log("testing here");
          // console.log(reactionEquations[selectedReactionType]);
          // console.log(reactionEquations);

          // // Build the reaction that we will store in description
          // console.log(createReactionReactantsRef.current);
          // console.log(createReactionProductsRef.current);
          // console.log(selectedReactionType)

          // console.log(selectedMechanismName);
          // console.log(reactionList);
          // console.log(reactionsCount);

          // Name is mecanism name_reaction number
          // get the number of current reactions
          const reactionData: Reaction = {
            name:
              selectedMechanismName + "_reaction" + String(reactionsCount + 1),
            // Set description to the constructed equation
            description:
              selectedReactionType.toUpperCase() +
              " Reaction " +
              String(reactionsCount + 1) +
              ": " +
              createReactionReactantsRef.current +
              " -> " +
              createReactionProductsRef.current,
            createdBy: "current_user",
          };
          //console.log(reactionData);
          const newReaction = await createReaction(reactionData);

          //console.log(newReaction);

          const mechanismReaction: MechanismReaction = {
            mechanism_id: selectedMechanismId,
            reaction_id: newReaction.id!,
          };
          await addReactionToMechanism(mechanismReaction);
        }

        for (const reactionId of selectedReactionIds) {
          const mechanismReaction: MechanismReaction = {
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
          <MenuItem value="Branched">Branched</MenuItem>
          <MenuItem value="Emission">Emission</MenuItem>
          <MenuItem value="First-Order Loss">First-Order Loss</MenuItem>
          <MenuItem value="Photolysis">Photolysis</MenuItem>
          <MenuItem value="Surface (Heterogeneous)">
            Surface (Heterogeneous)
          </MenuItem>
          <MenuItem value="Ternary Chemical Activation">
            Ternary Chemical Activation
          </MenuItem>
          <MenuItem value="Troe (Fall-Off)">Troe (Fall-Off)</MenuItem>
          <MenuItem value="Tunneling">Tunneling</MenuItem>
        </Select>

        <TextField
          id="reactants"
          label="Reactants"
          type="string"
          onChange={(e) =>
            (createReactionReactantsRef.current = e.target.value)
          }
          fullWidth
          margin="normal"
        />
        <TextField
          id="products"
          label="Products"
          type="string"
          onChange={(e) => (createReactionProductsRef.current = e.target.value)}
          fullWidth
          margin="normal"
        />
        {reactionList.length > 0 && (
          <>
            <Typography variant="subtitle1" style={{ marginTop: "1rem" }}>
              Or Pick Existing Reactions in Family (Multiple Selection)
            </Typography>
            <Select
              multiple
              value={selectedReactionIds}
              onChange={(e) =>
                setSelectedReactionIds(e.target.value as string[])
              }
              fullWidth
              style={{ marginTop: "1rem" }}
            >
              {reactionList.map((reaction) => (
                <MenuItem key={reaction.id} value={reaction.id}>
                  {reactionEquations[reaction.id!] || "Loading..."}
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

export const UpdateReactionModal: React.FC<UpdateReactionModalProps> = ({
  open,
  onClose,
  selectedFamilyId,
  selectedMechanismId,
  setReactionUpdated,
  reactionsCount,
  selectedReaction,
}) => {
  const [selectedReactionType, setSelectedReactionType] = useState<string>("");
  const [reactionList, setReactionList] = useState<Reaction[]>([]);
  const [selectedReactionIds, setSelectedReactionIds] = useState<string[]>([]);
  const [reactionEquations, setReactionEquations] = useState<{
    [key: string]: string;
  }>({});

  const [reactants, setReactants] = useState<string>("");
  const [products, setProducts] = useState<string>("");
  const createReactionReactantsRef = useRef("");
  const createReactionProductsRef = useRef("");

  useEffect(() => {
    const fetchReactions = async () => {
      try {
        if (selectedFamilyId && selectedMechanismId && selectedReaction) {
          // get the current reaction data
          if (
            selectedReaction.name !== null &&
            selectedReaction.description !== null
          ) {
            // make regex expression
            const regex =
              /^(Arrhenius|Branched|Emission|First-Order Loss|Photolysis|Surface \(Heterogeneous\)|Ternary Chemical Activation|Troe \(Fall-Off\)|Tunneling|N\/A)(?: Reaction \d+)?: ([^->]+) -> (.+)$/i;

            const matches = selectedReaction.description.match(regex);

            if (matches) {
              // console.log("matches:");
              // console.log(matches);
              // getting the current data before editing
              setSelectedReactionType(
                matches[1]
                  .toLowerCase()
                  .replace(/^./, (char) => char.toUpperCase()),
              );
              const tempReactants = matches[2].trim();
              const tempProducts = matches[3].trim();
              setReactants(tempReactants);
              setProducts(tempProducts);

              createReactionProductsRef.current = tempProducts;
              createReactionReactantsRef.current = tempReactants;
            }
          }
          const reactionsFamily =
            await getReactionsByFamilyId(selectedFamilyId);
          const reactionsMechanism =
            await getReactionsByMechanismId(selectedMechanismId);

          const uniqueReactions = reactionsFamily.filter(
            (reaction: Reaction) =>
              !reactionsMechanism.some(
                (mechReaction) => mechReaction.id === reaction.id,
              ),
          );
          setReactionList(uniqueReactions);
        }
      } catch (error) {
        console.error(error);
      }
    };
    fetchReactions();
  }, [open, selectedFamilyId, selectedMechanismId, selectedReaction]);

  useEffect(() => {
    const fetchReactionEquations = async () => {
      const equations: { [key: string]: string } = {};
      try {
        await Promise.all(
          reactionList.map(async (reaction) => {
            const reactants = await getReactantsByReactionIdAsync(reaction.id!);
            const products = await getProductsByReactionIdAsync(reaction.id!);
            const reactantNames = reactants
              .map((r: ReactionSpeciesDto) => r.species_name)
              .join(" + ");
            const productNames = products
              .map((p: ReactionSpeciesDto) => p.species_name)
              .join(" + ");
            equations[reaction.id!] = `${reactantNames} -> ${productNames}`;
          }),
        );
        setReactionEquations(equations);
      } catch (error) {
        console.error("Error fetching reaction equations:", error);
      }
    };

    if (reactionList.length > 0) {
      fetchReactionEquations();
    } else {
      setReactionEquations({});
    }
  }, [reactionList]);

  const handleCreateReactionClick = async () => {
    try {
      if (selectedFamilyId && selectedMechanismId) {
        if (selectedReactionType !== "") {
          // Name is mecanism name_reaction number
          // get the number of current reactions
          // console.log("Previous:");
          // console.log(selectedReaction);

          const reactionData: Reaction = {
            id: selectedReaction!.id,
            name: selectedReaction!.name,
            // Set description to the constructed equation
            description:
              selectedReactionType.toUpperCase() +
              " Reaction " +
              String(reactionsCount + 1) +
              ": " +
              createReactionReactantsRef.current +
              " -> " +
              createReactionProductsRef.current,
            createdBy: "current_user",
          };

          // console.log("Modified:");
          // console.log(reactionData);

          const updatedReaction = await updateReaction(reactionData);

          console.log(updatedReaction);
        }

        setSelectedReactionType("");
        setSelectedReactionIds([]);
        setReactionUpdated(true);
        onClose();
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
          <MenuItem value="Branched">Branched</MenuItem>
          <MenuItem value="Emission">Emission</MenuItem>
          <MenuItem value="First-Order Loss">First-Order Loss</MenuItem>
          <MenuItem value="Photolysis">Photolysis</MenuItem>
          <MenuItem value="Surface (Heterogeneous)">
            Surface (Heterogeneous)
          </MenuItem>
          <MenuItem value="Ternary Chemical Activation">
            Ternary Chemical Activation
          </MenuItem>
          <MenuItem value="Troe (Fall-Off)">Troe (Fall-Off)</MenuItem>
          <MenuItem value="Tunneling">Tunneling</MenuItem>
        </Select>

        <TextField
          id="reactants"
          label="Reactants"
          type="string"
          value={reactants}
          onChange={(e) => {
            setReactants(e.target.value);
            createReactionReactantsRef.current = e.target.value;
          }}
          fullWidth
          margin="normal"
        />
        <TextField
          id="products"
          label="Products"
          type="string"
          value={products}
          onChange={(e) => {
            setProducts(e.target.value);
            createReactionProductsRef.current = e.target.value;
          }}
          fullWidth
          margin="normal"
        />
        {reactionList.length > 0 && (
          <>
            <Typography variant="subtitle1" style={{ marginTop: "1rem" }}>
              Or Pick Existing Reactions in Family (Multiple Selection)
            </Typography>
            <Select
              multiple
              value={selectedReactionIds}
              onChange={(e) =>
                setSelectedReactionIds(e.target.value as string[])
              }
              fullWidth
              style={{ marginTop: "1rem" }}
            >
              {reactionList.map((reaction) => (
                <MenuItem key={reaction.id} value={reaction.id}>
                  {reactionEquations[reaction.id!] || "Loading..."}
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

export const CreateReactantModal: React.FC<CreateReactantModalProps> = ({
  open,
  onClose,
  selectedMechanismId,
  selectedReaction,
  setCreatedReactantBool,
  setReactionUpdated,
}) => {
  const [speciesList, setSpeciesList] = useState<Species[]>([]);
  const [selectedSpeciesId, setSelectedSpeciesId] = useState<string | null>(
    null,
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
      if (!selectedReaction) {
        console.error("No reaction selected.");
        return;
      }

      if (!selectedSpeciesId) {
        console.error("No species selected.");
        return;
      }

      // Remove 'quantity' since it's not part of the interface
      const reactionSpecies: ReactionSpecies = {
        id: "",
        reaction_id: selectedReaction.id!,
        species_id: selectedSpeciesId,
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
        <Typography variant="h6">Select a Species</Typography>
        <Select
          label="Species"
          value={selectedSpeciesId || ""}
          onChange={(e) => setSelectedSpeciesId(e.target.value as string)}
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
        <Button
          variant="contained"
          onClick={handleCreateReactantClick}
          style={{ marginTop: "1rem" }}
        >
          Submit
        </Button>
      </Box>
    </Modal>
  );
};

export const CreateProductModal: React.FC<CreateProductModalProps> = ({
  open,
  onClose,
  selectedMechanismId,
  selectedReaction,
  setCreatedProductBool,
  setReactionUpdated,
}) => {
  const [speciesList, setSpeciesList] = useState<Species[]>([]);
  const [selectedSpeciesId, setSelectedSpeciesId] = useState<string | null>(
    null,
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
      if (!selectedReaction) {
        console.error("No reaction selected.");
        return;
      }

      if (!selectedSpeciesId) {
        console.error("No species selected.");
        return;
      }

      const reactionSpecies: ReactionSpecies = {
        id: "",
        reaction_id: selectedReaction.id!,
        species_id: selectedSpeciesId,
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
        <Typography variant="h6">Select a Species</Typography>
        <Select
          label="Species"
          value={selectedSpeciesId || ""}
          onChange={(e) => setSelectedSpeciesId(e.target.value as string)}
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
