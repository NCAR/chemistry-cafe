import { useState } from "react";
import { Button } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import { UUID } from "crypto";
import { Family } from "../../types/chemistryModels";
import { ConfirmActionModal } from "../modals/ConfirmActionModal";

/** Deletes reactions from a family and from each mechanism that has them. */
export function removeReactions(
  family: Family,
  reactionIds: Array<UUID>,
): Family {
  const ids = new Set<string>(reactionIds);
  return {
    ...family,
    reactions: family.reactions.filter((reaction) => !ids.has(reaction.id)),
    mechanisms: family.mechanisms.map((mechanism) => ({
      ...mechanism,
      reactionIds: mechanism.reactionIds.filter((id) => !ids.has(id)),
    })),
    isModified: true,
  };
}

type DeleteReactionsButtonProps = {
  reactionIds: Array<UUID>;
  /** Deletes the reactions. The user confirms first. */
  onDelete: () => void;
};

/** Deletes many reactions after the user confirms. */
export const DeleteReactionsButton = ({
  reactionIds,
  onDelete,
}: DeleteReactionsButtonProps) => {
  const [confirmOpen, setConfirmOpen] = useState<boolean>(false);
  const count = reactionIds.length;

  return (
    <>
      <Button
        size="small"
        variant="outlined"
        color="error"
        startIcon={<DeleteIcon />}
        data-testid="delete-reactions-button"
        onClick={() => setConfirmOpen(true)}
      >
        Delete
      </Button>
      <ConfirmActionModal
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onAction={() => {
          setConfirmOpen(false);
          onDelete();
        }}
        message={`This deletes ${count} ${count === 1 ? "reaction" : "reactions"} from the family and from all its mechanisms.`}
        subtitle="Are you sure you want to continue?"
        confirmColor="error"
        confirmLabel="Delete"
      />
    </>
  );
};
