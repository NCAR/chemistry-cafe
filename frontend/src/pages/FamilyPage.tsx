import { memo, useEffect, useState } from "react";
import { Header, Footer } from "../components/HeaderFooter";
import "../styles/FamilyPage.css";
import { alpha, CircularProgress, IconButton, Paper, styled, Typography } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { SimpleTreeView } from "@mui/x-tree-view/SimpleTreeView";
import { TreeItem, treeItemClasses } from "@mui/x-tree-view/TreeItem";
import { ArrheniusReaction, Family, Mechanism, Species } from "../types/chemistryModels";

const carbon: Species = {
  id: "11111111-11111111-11111111-11111111-11111111",
  name: "C",
  description: "Good 'ol carbon",
  properties: {
    "molecular weight": {
      units: "kg mol-1",
      value: 0.045
    }
  },
}

const oxygen: Species = {
  id: "22222222-22222222-22222222-22222222-22222222",
  name: "O2",
  description: null,
  properties: {},
}

const carbonDioxide: Species = {
  id: "33333333-33333333-33333333-33333333-33333333",
  name: "CO2",
  description: "This is a really long description that will hopefully break the ui because I really want to break the ui beacus that would be cool 11111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111",
  properties: {},
}

const testReaction: ArrheniusReaction = {
  id: "11111111-11111111-11111111-11111111-11111111",
  type: "ARRHENIUS",
  gasPhase: "gas",
  reactants: [
    {
      species: carbon,
      coefficient: 1,
    },
    {
      species: oxygen,
      coefficient: 1,
    },
  ],
  products: [
    {
      species: carbonDioxide,
      coefficient: 1,
    }
  ],
  name: "Test Reaction",
  description: null,
  A: 1,
  B: 1,
  C: 1,
  D: 1,
  E: 1,
}

const testMechanism: Mechanism = {
  id: "11111111-11111111-11111111-11111111-11111111",
  name: "Test Mechanism",
  description: "This is just a test. Nothing else.",
  phases: [{
    name: "gas",
    description: "Gas Phase",
    species: [carbon, oxygen],
  }],
  species: [carbon, oxygen],
  reactions: [testReaction],
}

const dummyFamilyData: Array<Family> = [
  {
    id: "11111111-11111111-11111111-11111111-11111111",
    name: "Test Family",
    description: "Test Family",
    mechanisms: [testMechanism, { ...testMechanism, name: "Another Test Subject" }],
    species: [carbon, oxygen],
    reactions: [testReaction],
    saved: true,
  },
  {
    id: "22222222-22222222-22222222-22222222-22222222",
    name: "Another test family with a really long name that will surely not break the ui :D aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa 11111111111111111111111111111111111111111111111111111111111111",
    description: "Test Family",
    mechanisms: [],
    species: [{ ...carbon }, { ...oxygen }],
    reactions: [],
    saved: true,
  },

]

const FamilyPage = () => {
  const [loadingFamilies, setLoadingFamilies] = useState<boolean>(true);
  const [families, setFamilies] = useState<Array<Family>>();
  const [dataView, setDataView] = useState<React.JSX.Element>(<DefaultView />);

  enum DataViewSelection {
    Species,
    Reactions,
    Mechanisms,
    Default,
  }

  const getDataViewComponent = (menuName: DataViewSelection, family: Family, updateFamily: (family: Family) => void) => {
    switch (menuName) {
      case DataViewSelection.Species:
        return <SpeciesView family={family} updateFamily={updateFamily} />
      case DataViewSelection.Reactions:
        return <ReactionsView family={family} updateFamily={updateFamily} />
      case DataViewSelection.Mechanisms:
        return <MechanismsView family={family} updateFamily={updateFamily} />
      default:
      case DataViewSelection.Default:
        return <DefaultView />
    }
  }


  useEffect(() => {
    const abortController = new AbortController();
    const fetchFamilyData = async () => {
      try {
        // Mock network request
        setTimeout(() => {
          setFamilies(dummyFamilyData);
          setLoadingFamilies(false);
        }, 500);
      } catch (err) {
        if (!abortController.signal.aborted) {
          alert(err);
        }
      }
    }

    fetchFamilyData();

    return () => {
      abortController.abort();
    };
  }, []);

  const downloadMechanism = async (mechanismId: string, format: "JSON" | "YAML" | "Musicbox") => {
    console.log(mechanismId, format);
  }

  return (
    <div className="layout-family-editor">
      <header>
        <Header />
      </header>
      <Paper square component="section" className="content-family-editor">
        <div className="family-selector">
          <Paper
            component="div"
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              // boxShadow: "unset",
              padding: "10px",
            }}
            elevation={4}
          >
            <Typography variant="h4" style={{ textAlign: "center", margin: 0 }}>Families</Typography>
            <IconButton>
              <AddIcon sx={{ fontSize: 32, fontWeight: "bold" }} />
            </IconButton>
          </Paper>
          {
            loadingFamilies ? (
              <CircularProgress />
            ) : (
              <SimpleTreeView>
                {families && families.map((family, index) => (
                  <FamilyTreeItem
                    key={`${family.id}-${index}`}
                    itemId={`${family.id}-${index}`}
                    label={
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                        }}
                      >
                        <Typography
                          noWrap
                          sx={{
                          }}
                        >
                          {family.name}
                        </Typography>
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            width: 80,
                          }}
                        >
                          <IconButton
                            onClick={() => {
                            }}
                            aria-label="edit"
                            edge="start"
                          >
                            <EditIcon />
                          </IconButton>
                          <IconButton
                            onClick={() => {
                            }}
                            aria-label="delete"
                            style={{ color: "red" }}
                            edge="start"
                          >
                            <DeleteIcon />
                          </IconButton>
                        </div>
                      </div>
                    }
                  >
                    <TreeItem
                      itemId={`${family.id}-${index}-species`}
                      label="Species"
                      onClick={() => {
                        setDataView(getDataViewComponent(DataViewSelection.Species, family, (family) => { console.log(family.name) }));
                      }}
                    />
                    <TreeItem
                      itemId={`${family.id}-${index}-reactions`}
                      label="Reactions"
                      onClick={() => {
                        setDataView(getDataViewComponent(DataViewSelection.Reactions, family, (family) => { console.log(family.name) }));
                      }}
                    />
                    <TreeItem
                      itemId={`${family.id}-${index}-mechanisms`}
                      label="Mechanisms"
                      onClick={() => {
                        setDataView(getDataViewComponent(DataViewSelection.Mechanisms, family, (family) => { console.log(family.name) }));
                      }}
                    />
                  </FamilyTreeItem>
                ))}
              </SimpleTreeView>
            )
          }

        </div>
        <div className="family-selector">
          {dataView}
        </div>
      </Paper>
      <footer>
        <Footer />
      </footer>
    </div>
  );
};

const FamilyTreeItem = styled(TreeItem)(({ theme }) => ({
  [`& .${treeItemClasses.content}`]: {
    padding: theme.spacing(1.0, 1),
    margin: theme.spacing(0.2, 0),
  },
  [`& .${treeItemClasses.iconContainer}`]: {
    '& .close': {
      opacity: 0.3,
    },
  },
  [`& .${treeItemClasses.groupTransition}`]: {
    marginLeft: 15,
    paddingLeft: 18,
    borderLeft: `2px solid ${alpha(theme.palette.primary.main, 0.4)}`,
  },
}));

type ViewProps = {
  family: Family;
  updateFamily: (family: Family) => void;
}

const DefaultView = memo(function DefaultView() {
  return (
    <Typography>Select a Family to get started</Typography>
  );
});


const SpeciesView = ({ family, updateFamily }: ViewProps) => {
  return (
    <Typography>{family.name} Species</Typography>
  );
}

const ReactionsView = ({ family, updateFamily }: ViewProps) => {
  return (
    <Typography>{family.name} Reactions</Typography>
  );
}

const MechanismsView = ({ family, updateFamily }: ViewProps) => {
  return (
    <Typography>{family.name} Mechanisms</Typography>
  );
}


export default FamilyPage;
