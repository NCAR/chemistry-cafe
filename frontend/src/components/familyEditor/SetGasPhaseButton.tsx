import { useState } from "react";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Menu,
  MenuItem,
  Typography,
} from "@mui/material";
import { UUID } from "crypto";
import { Family, Phase, Reaction } from "../../types/chemistryModels";

/** The species of a reaction, which must all be in its gas phase. */
export const reactionSpeciesIds = (reaction: Reaction): Array<UUID> => [
  ...reaction.reactants.map((entry) => entry.speciesId),
  ...reaction.products.map((entry) => entry.speciesId),
  ...(reaction.gasPhaseSpeciesId ? [reaction.gasPhaseSpeciesId] : []),
];

/**
 * Sets the gas phase of reactions. With `addMissingSpecies`, the phase also
 * gets the species of the reactions that it does not have.
 */
export function setGasPhase(
  family: Family,
  reactionIds: Array<UUID>,
  phaseId: UUID,
  addMissingSpecies: boolean,
): Family {
  const ids = new Set(reactionIds);
  const reactions = family.reactions.filter((reaction) => ids.has(reaction.id));
  const added = addMissingSpecies ? reactions.flatMap(reactionSpeciesIds) : [];
  return {
    ...family,
    reactions: family.reactions.map((reaction) =>
      ids.has(reaction.id) ? { ...reaction, gasPhaseId: phaseId } : reaction,
    ),
    phases: family.phases.map((phase) =>
      phase.id === phaseId && added.length > 0
        ? {
            ...phase,
            speciesIds: [...new Set([...phase.speciesIds, ...added])],
          }
        : phase,
    ),
  };
}

type SetGasPhaseButtonProps = {
  family: Family;
  /** The reactions that get the gas phase. */
  reactionIds: Array<UUID>;
  /** Saves the change. See setGasPhase. */
  onSet: (phaseId: UUID, addMissingSpecies: boolean) => void;
};

/**
 * Sets one gas phase on many reactions. If the phase does not have all the
 * species of the reactions, the user selects to add them or not.
 */
export const SetGasPhaseButton = ({
  family,
  reactionIds,
  onSet,
}: SetGasPhaseButtonProps) => {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  // The phase that the user selected, and the species that it does not have.
  const [pending, setPending] = useState<{
    phase: Phase;
    missingNames: Array<string>;
  } | null>(null);

  const selectPhase = (phase: Phase) => {
    setAnchorEl(null);
    const ids = new Set(reactionIds);
    const missing = new Set(
      family.reactions
        .filter((reaction) => ids.has(reaction.id))
        .flatMap(reactionSpeciesIds)
        .filter((speciesId) => !phase.speciesIds.includes(speciesId)),
    );
    if (missing.size === 0) {
      onSet(phase.id, false);
      return;
    }
    setPending({
      phase,
      missingNames: [...missing].map(
        (id) => family.species.find((s) => s.id === id)?.name ?? "<Unknown>",
      ),
    });
  };

  const finish = (addMissingSpecies: boolean) => {
    if (pending) onSet(pending.phase.id, addMissingSpecies);
    setPending(null);
  };

  return (
    <>
      <Button
        size="small"
        variant="outlined"
        data-testid="set-gas-phase-button"
        disabled={family.phases.length === 0}
        title={
          family.phases.length === 0
            ? "This family has no phases. Add a phase in the Phases section first."
            : undefined
        }
        onClick={(event) => setAnchorEl(event.currentTarget)}
      >
        Set phase
      </Button>
      <Menu
        open={anchorEl !== null}
        anchorEl={anchorEl}
        onClose={() => setAnchorEl(null)}
      >
        {family.phases.map((phase) => (
          <MenuItem key={phase.id} onClick={() => selectPhase(phase)}>
            {phase.name || "<No Name>"}
          </MenuItem>
        ))}
      </Menu>
      <Dialog open={pending !== null} onClose={() => setPending(null)}>
        <DialogTitle>Add the missing species?</DialogTitle>
        <DialogContent>
          <Typography>
            The phase &ldquo;{pending?.phase.name}&rdquo; does not contain{" "}
            {pending?.missingNames.join(", ")}. The reactants and products of a
            reaction must be in its gas phase.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPending(null)}>Cancel</Button>
          <Button
            data-testid="set-gas-phase-only"
            onClick={() => finish(false)}
          >
            Set the phase only
          </Button>
          <Button
            variant="contained"
            data-testid="set-gas-phase-add-species"
            onClick={() => finish(true)}
          >
            Add the species and set the phase
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};
