import { useEffect, useMemo, useState } from "react";
import { UUID } from "crypto";
import {
  Box,
  Button,
  Checkbox,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  List,
  ListItemButton,
  ListItemText,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import SearchIcon from "@mui/icons-material/Search";
import {
  DataGrid,
  GridActionsCellItem,
  GridColDef,
  GridRenderCellParams,
} from "@mui/x-data-grid";
import { generateID } from "../../helpers/localFamilies";
import { Phase } from "../../types/chemistryModels";
import { useCustomTheme } from "../CustomThemeContext";
import { ViewProps } from "./ViewProps";
import { DataViewToolbar } from "./DataViewToolbar";

const getPhaseDisplayName = (phase: Phase): string =>
  phase.name.trim() || "<Unnamed Phase>";

export const PhaseView = ({ family, updateFamily }: ViewProps) => {
  const { theme } = useCustomTheme();

  const [phaseList, setPhaseList] = useState<Phase[]>(family.phases);
  const [speciesPickerPhaseId, setSpeciesPickerPhaseId] =
    useState<UUID | null>(null);

  // Species currently selected in the picker.
  const [selectedSpeciesIds, setSelectedSpeciesIds] = useState<UUID[]>([]);

  // Search/filter text for the species picker.
  const [speciesSearch, setSpeciesSearch] = useState("");

  useEffect(() => {
    setPhaseList(family.phases);
  }, [family.phases]);

  const applyPhaseChanges = (nextPhases: Phase[]) => {
    const nextFamily = {
      ...family,
      phases: nextPhases,
    };

    setPhaseList(nextPhases);
    updateFamily(nextFamily);
  };

  const addPhase = () => {
    const newPhase: Phase = {
      id: generateID(),
      name: `Phase ${phaseList.length + 1}`,
      description: null,
      speciesIds: [],
    };

    applyPhaseChanges([newPhase, ...phaseList]);
  };

  const updatePhase = (phase: Phase) => {
    applyPhaseChanges(
      phaseList.map((currentPhase) =>
        currentPhase.id === phase.id
          ? {
              ...phase,
              name: getPhaseDisplayName(phase),
            }
          : currentPhase,
      ),
    );
  };

  const removePhase = (phaseId: UUID) => {
    const nextPhases = phaseList.filter((phase) => phase.id !== phaseId);

    const nextFamily = {
      ...family,
      phases: nextPhases,
      mechanisms: family.mechanisms.map((mechanism) => ({
        ...mechanism,
        phaseIds: mechanism.phaseIds.filter((id) => id !== phaseId),
      })),
    };

    setPhaseList(nextPhases);
    updateFamily(nextFamily);
  };

  const addSpeciesToPhase = (phaseId: UUID, speciesId: UUID) => {
    const phase = phaseList.find((element) => element.id === phaseId);

    if (!phase || phase.speciesIds.includes(speciesId)) {
      return;
    }

    applyPhaseChanges(
      phaseList.map((currentPhase) =>
        currentPhase.id === phaseId
          ? {
              ...currentPhase,
              speciesIds: [...currentPhase.speciesIds, speciesId],
            }
          : currentPhase,
      ),
    );
  };

  const addSelectedSpeciesToPhase = () => {
    if (!speciesPickerPhaseId || selectedSpeciesIds.length === 0) {
      return;
    }

    const phase = phaseList.find(
      (currentPhase) => currentPhase.id === speciesPickerPhaseId,
    );

    if (!phase) {
      return;
    }

    const newSpeciesIds = selectedSpeciesIds.filter(
      (speciesId) => !phase.speciesIds.includes(speciesId),
    );

    if (newSpeciesIds.length === 0) {
      return;
    }

    applyPhaseChanges(
      phaseList.map((currentPhase) =>
        currentPhase.id === speciesPickerPhaseId
          ? {
              ...currentPhase,
              speciesIds: [...currentPhase.speciesIds, ...newSpeciesIds],
            }
          : currentPhase,
      ),
    );

    setSelectedSpeciesIds([]);
    setSpeciesSearch("");
    setSpeciesPickerPhaseId(null);
  };

  const removeSpeciesFromPhase = (phaseId: UUID, speciesId: UUID) => {
    applyPhaseChanges(
      phaseList.map((phase) =>
        phase.id === phaseId
          ? {
              ...phase,
              speciesIds: phase.speciesIds.filter((id) => id !== speciesId),
            }
          : phase,
      ),
    );
  };

  const speciesPickerPhase = phaseList.find(
    (phase) => phase.id === speciesPickerPhaseId,
  );

  const availableSpecies = useMemo(() => {
    if (!speciesPickerPhase) {
      return [];
    }

    return family.species
      .filter(
        (species) => !speciesPickerPhase.speciesIds.includes(species.id),
      )
      .sort((a, b) =>
        (a.name || "<No Name>").localeCompare(b.name || "<No Name>"),
      );
  }, [family.species, speciesPickerPhase]);

  const filteredSpecies = useMemo(() => {
    const search = speciesSearch.trim().toLowerCase();

    if (!search) {
      return availableSpecies;
    }

    return availableSpecies.filter((species) => {
      const name = species.name?.toLowerCase() || "";
      const description = species.description?.toLowerCase() || "";

      return name.includes(search) || description.includes(search);
    });
  }, [availableSpecies, speciesSearch]);

  const openSpeciesPicker = (phaseId: UUID) => {
    setSpeciesPickerPhaseId(phaseId);
    setSelectedSpeciesIds([]);
    setSpeciesSearch("");
  };

  const closeSpeciesPicker = () => {
    setSpeciesPickerPhaseId(null);
    setSelectedSpeciesIds([]);
    setSpeciesSearch("");
  };

  const toggleSpeciesSelection = (speciesId: UUID) => {
    setSelectedSpeciesIds((currentSelected) =>
      currentSelected.includes(speciesId)
        ? currentSelected.filter((id) => id !== speciesId)
        : [...currentSelected, speciesId],
    );
  };

  const selectAllVisibleSpecies = () => {
    const visibleIds = filteredSpecies.map((species) => species.id);

    setSelectedSpeciesIds((currentSelected) => {
      const allVisibleSelected = visibleIds.every((id) =>
        currentSelected.includes(id),
      );

      if (allVisibleSelected) {
        return currentSelected.filter((id) => !visibleIds.includes(id));
      }

      return Array.from(new Set([...currentSelected, ...visibleIds]));
    });
  };

  const phaseColumns: GridColDef[] = [
    {
      field: "Row Actions",
      type: "actions",
      headerName: "Actions",
      width: 90,
      getActions: ({ id }) => {
        return [
          <GridActionsCellItem
            key={`${id}-delete`}
            icon={<DeleteIcon />}
            label="Delete phase"
            onClick={() => removePhase(id as UUID)}
          />,
        ];
      },
    },
    {
      field: "name",
      headerName: "Name",
      editable: true,
      flex: 1,
      minWidth: 180,
      valueGetter: (_value, row) => getPhaseDisplayName(row as Phase),
      renderCell: (params: GridRenderCellParams<Phase>) => (
        <Typography variant="body2" sx={{ color: "text.primary" }}>
          {params.value || "<Unnamed Phase>"}
        </Typography>
      ),
    },
    {
      field: "speciesIds",
      headerName: "Species",
      flex: 2,
      minWidth: 320,
      sortable: false,
      filterable: false,
      renderCell: (params: GridRenderCellParams<Phase>) => {
        const phase = params.row;

        const assignedSpecies = phase.speciesIds
          .map((speciesId) =>
            family.species.find((species) => species.id === speciesId),
          )
          .filter((species) => species !== undefined);

        return (
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "minmax(0, 1fr) auto",
              alignItems: "center",
              gap: 1,
              width: "100%",
              py: 0.5,
            }}
          >
            <Box
              aria-label={`${phase.name || "Phase"} species`}
              sx={{
                display: "flex",
                alignItems: "flex-start",
                alignContent: "flex-start",
                gap: 1,
                flexWrap: "wrap",
                overflowY: "auto",
                maxHeight: 104,
                minHeight: 36,
                minWidth: 0,
                py: 0.25,
              }}
            >
              {assignedSpecies.length === 0 ? (
                <Typography variant="body2" color="text.secondary">
                  No species assigned
                </Typography>
              ) : (
                assignedSpecies.map((species) => (
                  <Chip
                    key={`${phase.id}-${species.id}`}
                    label={species.name || "<No Name>"}
                    onDelete={() =>
                      removeSpeciesFromPhase(phase.id, species.id)
                    }
                    deleteIcon={<DeleteIcon fontSize="small" />}
                  />
                ))
              )}
            </Box>

            <Button
              aria-label={`Add species to ${phase.name || "phase"}`}
              startIcon={<AddIcon />}
              onClick={() => openSpeciesPicker(phase.id)}
              size="small"
            >
              Add Species
            </Button>
          </Box>
        );
      },
    },
  ];

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          columnGap: "0.5rem",
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            columnGap: "0.5rem",
          }}
        >
          <Typography color="textPrimary" variant="h6">
            Phases
          </Typography>

          <Tooltip title="Species can be in multiple different phases in a model.">
            <HelpOutlineIcon fontSize="small" />
          </Tooltip>
        </Box>

        <Button
          aria-label="Create a new phase"
          data-testid="create-phase-button"
          onClick={addPhase}
          startIcon={<AddIcon />}
          color="primary"
          variant="contained"
        >
          New Phase
        </Button>
      </Box>

      <Typography>
        Species can be assigned to multiple phases, and each phase can be edited
        independently.
      </Typography>

      <DataGrid
        initialState={{
          density: "compact",
          pagination: { paginationModel: { pageSize: 20 } },
        }}
        rows={phaseList}
        columns={phaseColumns}
        getRowHeight={() => 128}
        pageSizeOptions={[5, 10, 20, 100]}
        disableVirtualization
        processRowUpdate={(updatedRow) => {
          const normalizedRow = {
            ...updatedRow,
            name: String(updatedRow.name ?? "").trim() || "<Unnamed Phase>",
          } as Phase;

          updatePhase(normalizedRow);
          return normalizedRow;
        }}
        onProcessRowUpdateError={(error) => {
          console.error(error);
        }}
        sx={{
          flex: 1,
          "& .MuiDataGrid-cell": {
            display: "flex",
            alignItems: "center",
          },
          ".MuiDataGrid-columnHeaderTitle": {
            fontFamily: theme.typography.fontFamily,
          },
          ".MuiDataGrid-overlay": {
            fontFamily: theme.typography.fontFamily,
          },
        }}
        slots={{
          toolbar: () => <DataViewToolbar />,
        }}
      />

      <Dialog
        open={speciesPickerPhase !== undefined}
        onClose={closeSpeciesPicker}
        fullWidth
        maxWidth="sm"
        aria-labelledby="phase-species-dialog-title"
      >
        <DialogTitle id="phase-species-dialog-title">
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 2,
            }}
          >
            <Box>
              <Typography variant="h6">
                Add Species
                {speciesPickerPhase
                  ? ` to ${getPhaseDisplayName(speciesPickerPhase)}`
                  : ""}
              </Typography>

              {selectedSpeciesIds.length > 0 && (
                <Typography variant="body2" color="text.secondary">
                  {selectedSpeciesIds.length} species selected
                </Typography>
              )}
            </Box>

            {selectedSpeciesIds.length > 0 && (
              <Chip
                color="primary"
                label={`${selectedSpeciesIds.length} selected`}
              />
            )}
          </Box>
        </DialogTitle>

        <DialogContent dividers>
          {availableSpecies.length === 0 ? (
            <Typography color="text.secondary">
              No unassigned species available for this phase.
            </Typography>
          ) : (
            <>
              <TextField
                fullWidth
                size="small"
                placeholder="Search species..."
                value={speciesSearch}
                onChange={(event) => setSpeciesSearch(event.target.value)}
                slotProps={{
                  input: {
                    startAdornment: (
                      <SearchIcon
                        fontSize="small"
                        sx={{ mr: 1, color: "text.secondary" }}
                      />
                    ),
                  },
                }}
                sx={{ mb: 1 }}
              />

              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  px: 1,
                  py: 0.5,
                }}
              >
                <Typography variant="body2" color="text.secondary">
                  {filteredSpecies.length}{" "}
                  {filteredSpecies.length === 1 ? "species" : "species"}{" "}
                  available
                </Typography>

                {filteredSpecies.length > 0 && (
                  <Button
                    size="small"
                    onClick={selectAllVisibleSpecies}
                  >
                    {filteredSpecies.every((species) =>
                      selectedSpeciesIds.includes(species.id),
                    )
                      ? "Deselect All"
                      : "Select All"}
                  </Button>
                )}
              </Box>

              <Divider />

              {filteredSpecies.length === 0 ? (
                <Box sx={{ py: 4, textAlign: "center" }}>
                  <Typography color="text.secondary">
                    No species match your search.
                  </Typography>
                </Box>
              ) : (
                <Box
                  sx={{
                    maxHeight: "50vh",
                    overflowY: "auto",
                    mt: 1,
                    px: 0.5,
                  }}
                >
                  <Box
                    sx={{
                      display: "grid",
                      gridTemplateColumns: {
                        xs: "1fr",
                        sm: "repeat(2, minmax(0, 1fr))",
                        md: "repeat(3, minmax(0, 1fr))",
                      },
                      gap: 1,
                    }}
                  >
                    {filteredSpecies.map((species) => {
                      const isSelected = selectedSpeciesIds.includes(species.id);

                      return (
                        <Box
                          key={species.id}
                          onClick={() => toggleSpeciesSelection(species.id)}
                          role="button"
                          tabIndex={0}
                          onKeyDown={(event) => {
                            if (event.key === "Enter" || event.key === " ") {
                              event.preventDefault();
                              toggleSpeciesSelection(species.id);
                            }
                          }}
                          sx={{
                            display: "flex",
                            alignItems: "flex-start",
                            minWidth: 0,
                            p: 1,
                            border: 1,
                            borderColor: isSelected
                              ? "primary.main"
                              : "divider",
                            borderRadius: 1,
                            backgroundColor: isSelected
                              ? "action.selected"
                              : "background.paper",
                            cursor: "pointer",
                            transition: "all 0.15s ease-in-out",

                            "&:hover": {
                              backgroundColor: isSelected
                                ? "action.selected"
                                : "action.hover",
                              borderColor: isSelected
                                ? "primary.main"
                                : "text.secondary",
                            },

                            "&:focus-visible": {
                              outline: 2,
                              outlineColor: "primary.main",
                              outlineOffset: 1,
                            },
                          }}
                        >
                          <Checkbox
                            checked={isSelected}
                            onChange={() => toggleSpeciesSelection(species.id)}
                            onClick={(event) => event.stopPropagation()}
                            size="small"
                            sx={{
                              p: 0.5,
                              mr: 0.75,
                              mt: -0.25,
                            }}
                          />

                          <Box sx={{ minWidth: 0 }}>
                            <Typography
                              variant="body2"
                              sx={{
                                fontWeight: isSelected ? 600 : 400,
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                              }}
                            >
                              {species.name || "<No Name>"}
                            </Typography>

                            {species.description && (
                              <Typography
                                variant="caption"
                                color="text.secondary"
                                sx={{
                                  display: "-webkit-box",
                                  WebkitLineClamp: 2,
                                  WebkitBoxOrient: "vertical",
                                  overflow: "hidden",
                                  mt: 0.25,
                                }}
                              >
                                {species.description}
                              </Typography>
                            )}
                          </Box>
                        </Box>
                      );
                    })}
                  </Box>
                </Box>
              )}
            </>
          )}
        </DialogContent>

        <DialogActions>
          <Button onClick={closeSpeciesPicker}>Cancel</Button>

          <Button
            onClick={addSelectedSpeciesToPhase}
            variant="contained"
            disabled={selectedSpeciesIds.length === 0}
            startIcon={<AddIcon />}
          >
            Add{" "}
            {selectedSpeciesIds.length > 0
              ? `${selectedSpeciesIds.length} `
              : ""}
            Species
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};