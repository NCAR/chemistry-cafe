import { useState } from "react";
import { Button } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import { ConfirmActionModal } from "../modals/ConfirmActionModal";

/** Opens the editor of the one selected row. */
export const EditSelectedButton = ({
  onClick,
  testId,
}: {
  onClick: () => void;
  testId: string;
}) => (
  <Button
    size="small"
    variant="outlined"
    startIcon={<EditIcon />}
    data-testid={testId}
    onClick={onClick}
  >
    Edit
  </Button>
);

/** Deletes the selected rows after the user confirms. */
export const DeleteSelectedButton = ({
  message,
  onDelete,
  testId,
}: {
  /** Tells the user what the deletion removes. */
  message: string;
  onDelete: () => void;
  testId: string;
}) => {
  const [confirmOpen, setConfirmOpen] = useState<boolean>(false);

  return (
    <>
      <Button
        size="small"
        variant="outlined"
        color="error"
        startIcon={<DeleteIcon />}
        data-testid={testId}
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
        message={message}
        subtitle="Are you sure you want to continue?"
        confirmColor="error"
        confirmLabel="Delete"
      />
    </>
  );
};

/** Gives "1 reaction" or "3 reactions", for example. */
export const countOf = (count: number, singular: string, plural: string) =>
  `${count} ${count === 1 ? singular : plural}`;
