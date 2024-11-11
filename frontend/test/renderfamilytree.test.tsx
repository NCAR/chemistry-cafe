import { render, screen } from "@testing-library/react";
import { describe, it, vi, expect } from "vitest";
import React from "react";
import RenderFamilyTree from "../src/components/RenderFamilyTree";

// Mock functions for the component props
const setSelectedFamilyIdMock = vi.fn();
const setSelectedMechanismIdMock = vi.fn();
const handleCreateFamilyOpenMock = vi.fn();
const handleCreateMechanismOpenMock = vi.fn();
const setCreatedFamilyBoolMock = vi.fn();
const setCreatedMechanismBoolMock = vi.fn();

describe("RenderFamilyTree Component", () => {
  // Mocked props to pass into the component
  const props = {
    setSelectedFamilyId: setSelectedFamilyIdMock,
    setSelectedMechanismId: setSelectedMechanismIdMock,
    handleCreateFamilyOpen: handleCreateFamilyOpenMock,
    handleCreateMechanismOpen: handleCreateMechanismOpenMock,
    selectedFamilyId: null,
    createdFamilyBool: false,
    setCreatedFamilyBool: setCreatedFamilyBoolMock,
    createdMechanismBool: false,
    setCreatedMechanismBool: setCreatedMechanismBoolMock,
  };

  it("renders without errors", () => {
    render(<RenderFamilyTree {...props} />);
  });

  it("displays a loading spinner", () => {
    render(<RenderFamilyTree {...props} />);
    expect(screen.getByRole("progressbar")).toBeInTheDocument();
  });

  it("renders some content", () => {
    const { container } = render(<RenderFamilyTree {...props} />);
    // Checks that the component rendered any HTML content
    expect(container.firstChild).not.toBeNull();
  });
});
