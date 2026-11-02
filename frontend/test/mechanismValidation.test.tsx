import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { DownloadMechanismButton } from "../src/components/DownloadMechanismButton";
import { GeneralInfoView } from "../src/components/familyEditor/GeneralInfoView";
import { Family, Mechanism } from "../src/types/chemistryModels";

vi.mock("../src/components/AuthContext", () => ({
  useAuth: () => ({
    user: { id: "owner-id", username: "Owner", role: "admin" },
    setUser: vi.fn(),
  }),
}));

const mechanism: Mechanism = {
  id: "mechanism-id",
  name: "Test Mechanism",
  description: null,
  familyId: "family-id",
  speciesIds: ["species-a", "species-b"],
  reactionIds: ["reaction-id"],
  phaseIds: ["phase-gas"],
};

/** A family with one A -> B reaction. B is in the gas phase only if `valid`. */
const makeFamily = (valid: boolean): Family => ({
  id: "family-id",
  name: "Test Family",
  description: "",
  owner: { id: "owner-id", username: "Owner", role: "admin" },
  isInDatabase: true,
  isPublic: false,
  mechanisms: [mechanism],
  species: [
    { id: "species-a", name: "A", description: null, attributes: {} },
    { id: "species-b", name: "B", description: null, attributes: {} },
  ],
  phases: [
    {
      id: "phase-gas",
      name: "gas",
      description: null,
      speciesIds: valid ? ["species-a", "species-b"] : ["species-a"],
    },
  ],
  reactions: [
    {
      id: "reaction-id",
      name: "",
      description: null,
      type: "ARRHENIUS",
      gasPhaseId: "phase-gas",
      attributes: {},
      reactants: [{ speciesId: "species-a", coefficient: 1 }],
      products: [{ speciesId: "species-b", coefficient: 1 }],
    },
  ],
});

const productMessage =
  "Species 'B' used in 'ARRHENIUS' is not defined in the 'gas' phase.";

describe("Validation before a download", () => {
  let anchorClick: ReturnType<typeof vi.spyOn>;
  beforeEach(() => {
    anchorClick = vi
      .spyOn(HTMLAnchorElement.prototype, "click")
      .mockImplementation(() => {});
  });

  afterEach(() => {
    anchorClick.mockRestore();
    cleanup();
  });

  it("blocks the download of an invalid mechanism", async () => {
    render(
      <DownloadMechanismButton
        mechanism={mechanism}
        family={makeFamily(false)}
      />,
    );
    fireEvent.click(screen.getByTestId("download-mechanism"));
    fireEvent.click(screen.getByTestId("download-v1-json"));

    expect(
      await screen.findByTestId("validation-errors-modal"),
    ).toHaveTextContent(productMessage);
    expect(anchorClick).not.toHaveBeenCalled();
  });

  it("downloads a valid mechanism", async () => {
    render(
      <DownloadMechanismButton
        mechanism={mechanism}
        family={makeFamily(true)}
      />,
    );
    fireEvent.click(screen.getByTestId("download-mechanism"));
    fireEvent.click(screen.getByTestId("download-v1-json"));

    await waitFor(() => expect(anchorClick).toHaveBeenCalled());
    expect(screen.queryByTestId("validation-errors-modal")).toBeNull();
  });
});

describe("Validation before a family becomes public", () => {
  afterEach(cleanup);

  const renderView = (family: Family) => {
    const onChangeVisibility = vi.fn();
    render(
      <GeneralInfoView
        family={family}
        updateFamily={vi.fn()}
        onDelete={vi.fn()}
        onPublish={vi.fn()}
        onChangeVisibility={onChangeVisibility}
      />,
    );
    fireEvent.click(screen.getByRole("checkbox"));
    return onChangeVisibility;
  };

  it("blocks the change to public when a mechanism is invalid", async () => {
    const onChangeVisibility = renderView(makeFamily(false));

    expect(
      await screen.findByTestId("validation-errors-modal"),
    ).toHaveTextContent(`Test Mechanism: ${productMessage}`);
    expect(screen.queryByTestId("confirm-action")).toBeNull();
    expect(onChangeVisibility).not.toHaveBeenCalled();
  });

  it("asks for confirmation when all mechanisms are valid", async () => {
    const onChangeVisibility = renderView(makeFamily(true));

    fireEvent.click(await screen.findByTestId("confirm-action"));
    expect(onChangeVisibility).toHaveBeenCalledWith(true);
    expect(screen.queryByTestId("validation-errors-modal")).toBeNull();
  });
});
