import { useState } from "react";
import {
  Box,
  Button,
  Checkbox,
  FormControlLabel,
  Modal,
  TextField,
  Typography,
} from "@mui/material";
import { modalStyle } from "./modalStyle";

/** Species, reactions, and phases all have an ID and a name. */
export type SearchItem = { id: string; name: string };

export type MechanismSearchProps<T extends SearchItem> = {
  open: boolean;
  /**
   * What the items are, in the plural and with a capital letter: "Species",
   * "Reactions", or "Phases". The title, the search field, and the messages
   * use it.
   */
  noun: string;
  /** The items that the person can choose from, in the order of the list. */
  items: Array<T>;
  /**
   * The text of an item in the list. Without it, the list shows the name, and
   * "<No Name>" for an item without a name. A reaction usually has no name, so
   * give it its equation.
   */
  getLabel?: (item: T) => string;
  /** The minimum width of an item in the list. A long label needs more. */
  minItemWidth?: string;
  onClose: () => void;
  /** Gives the IDs of the chosen items, in the order of the list. */
  onSubmit: (ids: Array<T["id"]>) => void;
};

const defaultLabel = (item: SearchItem) => item.name || "<No Name>";

// The content of the dialog. The modal mounts it only while the dialog is
// open, so each opening starts with an empty search and no chosen items. The
// dialog keeps its choices when the parent renders again with a new array of
// items, because nothing resets the state while the dialog is open.
const MechanismSearchForm = <T extends SearchItem>({
  noun,
  items,
  getLabel = defaultLabel,
  minItemWidth = "180px",
  onClose,
  onSubmit,
}: Omit<MechanismSearchProps<T>, "open">) => {
  const [search, setSearch] = useState("");
  const [selectedIds, setSelectedIds] = useState<Array<T["id"]>>([]);
  const lowerNoun = noun.toLowerCase();

  // The search ignores case and the spaces around it. It looks at the text of
  // the list and at the name, so a reaction is found by its equation or name.
  const query = search.trim().toLowerCase();
  const filteredItems = items.filter((item) =>
    [getLabel(item), item.name].some((text) =>
      text.toLowerCase().includes(query),
    ),
  );
  const allFilteredSelected =
    filteredItems.length > 0 &&
    filteredItems.every((item) => selectedIds.includes(item.id));
  // A search does not drop a choice, so this is not the filtered list.
  const chosenIds = items
    .filter((item) => selectedIds.includes(item.id))
    .map((item) => item.id);

  return (
    <>
      <Typography color="textPrimary" variant="h5">
        {`Add ${noun}`}
      </Typography>
      <TextField
        autoFocus
        color="primary"
        id="mechanism-search"
        label={`Search ${noun}...`}
        value={search}
        onChange={(event) => setSearch(event.target.value)}
      />
      <Button
        disabled={filteredItems.length === 0}
        onClick={() => {
          const filteredIds = filteredItems.map((item) => item.id);
          setSelectedIds((current) =>
            allFilteredSelected
              ? current.filter((id) => !filteredIds.includes(id))
              : [
                  ...current,
                  ...filteredIds.filter((id) => !current.includes(id)),
                ],
          );
        }}
      >
        {allFilteredSelected ? "Deselect All" : "Select All"}
      </Button>
      <Box
        role="group"
        aria-label={`Select ${lowerNoun} to add`}
        sx={{
          display: "grid",
          gridTemplateColumns: `repeat(auto-fill, minmax(${minItemWidth}, 1fr))`,
          gap: "0.5em",
          maxHeight: "16em",
          overflowY: "auto",
        }}
      >
        {filteredItems.length > 0 ? (
          filteredItems.map((item) => {
            const label = getLabel(item);

            return (
              <FormControlLabel
                key={item.id}
                control={
                  <Checkbox
                    checked={selectedIds.includes(item.id)}
                    onChange={(event) => {
                      setSelectedIds((current) =>
                        event.target.checked
                          ? [...current, item.id]
                          : current.filter((id) => id !== item.id),
                      );
                    }}
                  />
                }
                label={
                  <Typography noWrap title={label}>
                    {label}
                  </Typography>
                }
                sx={{
                  m: 0,
                  px: 1,
                  border: 1,
                  borderColor: "divider",
                  borderRadius: 1,
                }}
              />
            );
          })
        ) : (
          <Typography color="text.secondary" sx={{ gridColumn: "1 / -1" }}>
            {items.length > 0
              ? `No matching ${lowerNoun}.`
              : `No ${lowerNoun} available.`}
          </Typography>
        )}
      </Box>
      <Box
        sx={{
          display: "flex",
          flexDirection: "row",
          columnGap: "1em",
        }}
      >
        <Button
          sx={{ flex: 1 }}
          data-testid="add-selected-button"
          color="primary"
          variant="contained"
          disabled={chosenIds.length === 0}
          onClick={() => onSubmit(chosenIds)}
        >
          {`Add Selected (${chosenIds.length})`}
        </Button>
        <Button sx={{ flex: 1 }} variant="outlined" onClick={onClose}>
          Cancel
        </Button>
      </Box>
    </>
  );
};

/**
 * A dialog to choose several species, reactions, or phases from a list. The
 * search narrows the list, and Select All chooses only the items that the
 * search leaves. The dialog does not close itself: the parent closes it in
 * onSubmit.
 */
export const MechanismSearchModal = <T extends SearchItem>({
  open,
  ...formProps
}: MechanismSearchProps<T>) => (
  <Modal open={open} onClose={formProps.onClose}>
    <Box sx={modalStyle} role="dialog" aria-label={`Add ${formProps.noun}`}>
      <MechanismSearchForm {...formProps} />
    </Box>
  </Modal>
);
