import { render } from "@testing-library/react";
import { describe, it, vi } from "vitest";
import React from "react";
import {
  CreatePublishModal,
  CreateShareModal,
  CreateDOIModal,
  CreateFamilyModal,
  CreateMechanismModal,
  CreateSpeciesModal,
  CreateReactionModal,
  CreateReactantModal,
  CreateProductModal,
} from "../src/components/Modals";

describe("Modal components", () => {
  const onCloseMock = vi.fn();

  it("renders CreatePublishModal without errors", () => {
    render(<CreatePublishModal open={true} onClose={onCloseMock} />);
  });

  it("renders CreateShareModal without errors", () => {
    render(<CreateShareModal open={true} onClose={onCloseMock} />);
  });

  it("renders CreateDOIModal without errors", () => {
    render(<CreateDOIModal open={true} onClose={onCloseMock} />);
  });

  it("renders CreateFamilyModal without errors", () => {
    render(
      <CreateFamilyModal
        open={true}
        onClose={onCloseMock}
        setCreatedFamilyBool={vi.fn()}
      />,
    );
  });

  it("renders CreateMechanismModal without errors", () => {
    render(
      <CreateMechanismModal
        open={true}
        onClose={onCloseMock}
        selectedFamilyId={"1"}
        setCreatedMechanismBool={vi.fn()}
      />,
    );
  });

  it("renders CreateSpeciesModal without errors", () => {
    render(
      <CreateSpeciesModal
        open={true}
        onClose={onCloseMock}
        selectedFamilyId={"1"}
        selectedMechanismId={"1"}
        setSpeciesCreated={vi.fn()}
      />,
    );
  });

  it("renders CreateReactionModal without errors", () => {
    render(
      <CreateReactionModal
        open={true}
        onClose={onCloseMock}
        selectedFamilyId={"1"}
        selectedMechanismId={"1"}
        setReactionCreated={vi.fn()}
      />,
    );
  });

  it("renders CreateReactantModal without errors", () => {
    render(
      <CreateReactantModal
        open={true}
        onClose={onCloseMock}
        selectedMechanismId={"1"}
        selectedReaction={null}
        setCreatedReactantBool={vi.fn()}
        setReactionUpdated={vi.fn()}
      />,
    );
  });

  it("renders CreateProductModal without errors", () => {
    render(
      <CreateProductModal
        open={true}
        onClose={onCloseMock}
        selectedMechanismId={"1"}
        selectedReaction={null}
        setCreatedProductBool={vi.fn()}
        setReactionUpdated={vi.fn()}
      />,
    );
  });
});
