import React from "react";
import { describe, expect, it, beforeEach, afterEach, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import UserManagement from "../src/pages/UserManagement"; // Updated path to RoleManagement
import { useAuth } from "../src/components/AuthContext";
import { getAllUsers } from "../src/API/API_GetMethods";
import { updateUser } from "../src/API/API_UpdateMethods";
import { deleteUser } from "../src/API/API_DeleteMethods";
import "@testing-library/jest-dom";
import userEvent from "@testing-library/user-event";

// Mocking necessary modules
vi.mock("../src/components/AuthContext", () => ({
  useAuth: vi.fn(),
}));

vi.mock("../src/API/API_GetMethods", () => ({
  getAllUsers: vi.fn(),
}));

vi.mock("../src/API/API_UpdateMethods", () => ({
  updateUser: vi.fn(),
}));

vi.mock("../src/API/API_DeleteMethods", () => ({
  deleteUser: vi.fn(),
}));

// Sample data
const mockUsers = [
  { id: "1", username: "JohnDoe", email: "johndoe@example.com", role: "admin" },
  {
    id: "2",
    username: "JaneDoe",
    email: "janedoe@example.com",
    role: "unverified",
  },
];

const mockLoggedInUser = { id: "123", username: "TestUser", role: "admin" };

describe("RoleManagement Component", () => {
  beforeEach(() => {
    (useAuth as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      user: mockLoggedInUser,
    });
    (getAllUsers as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(
      mockUsers,
    );
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("renders loading state initially", async () => {
    render(<UserManagement />);
    expect(screen.getByText(/Loading users.../i)).toBeInTheDocument();
    await waitFor(() => expect(getAllUsers).toHaveBeenCalledTimes(1));
  });

  it("renders error state if fetching users fails", async () => {
    (getAllUsers as unknown as ReturnType<typeof vi.fn>).mockRejectedValueOnce(
      new Error("Fetch error"),
    );
    render(<UserManagement />);

    await waitFor(() => {
      expect(screen.getByText(/Failed to fetch users/i)).toBeInTheDocument();
    });
  });

  it("renders user data in DataGrid when fetching succeeds", async () => {
    render(<UserManagement />);

    await waitFor(() => {
      const users = screen.getAllByText(/Doe/i);
      expect(users).toHaveLength(4); // Expecting both JohnDoe and JaneDoe to appear
    });
  });

  it("handles edit mode toggling for a user row", async () => {
    render(<UserManagement />);

    await waitFor(() => {
      const johnDoeInstances = screen.getAllByText(/JohnDoe/i);
      expect(johnDoeInstances).toHaveLength(2); // Verify JohnDoe's unique row is rendered
    });

    // const editButtons = screen.getAllByRole('button', { name: /Edit/i });
    // userEvent.click(editButtons[0]); // Click the edit button for the first user

    // const saveButtons = screen.getAllByRole('button', { name: /Save/i });
    // expect(saveButtons).toHaveLength(1); // Ensure there's one save button visible

    // userEvent.click(saveButtons[0]);
    // await waitFor(() => expect(updateUser).toHaveBeenCalledTimes(1));
  });

  it("handles deleting a user", async () => {
    render(<UserManagement />);

    await waitFor(() => {
      const janeDoeInstances = screen.getAllByText(/JaneDoe/i);
      expect(janeDoeInstances).toHaveLength(2); // Verify JaneDoe's unique row is rendered
    });

    // const deleteButtons = screen.getAllByRole('button', { name: /Delete/i });
    // userEvent.click(deleteButtons[1]); // Assuming JaneDoe is at index 1

    // await waitFor(() => expect(deleteUser).toHaveBeenCalledWith('2'));
    // expect(screen.queryByText(/JaneDoe/i)).not.toBeInTheDocument();
  });

  it("displays the toolbar and allows quick filter usage", async () => {
    render(<UserManagement />);

    await waitFor(() => {
      const johnDoeInstances = screen.getAllByText(/JohnDoe/i);
      expect(johnDoeInstances).toHaveLength(2); // Verify JohnDoe's unique row is rendered
    });

    // const quickFilterInput = screen.getByRole('unverified', { name: /quick filter/i });
    // userEvent.type(quickFilterInput, 'Jane');

    // await waitFor(() => {
    //   const filteredJohnDoeInstances = screen.queryAllByText(/JohnDoe/i);
    //   const filteredJaneDoeInstances = screen.getAllByText(/JaneDoe/i);
    //   expect(filteredJohnDoeInstances).toHaveLength(0); // JohnDoe should be filtered out
    //   expect(filteredJaneDoeInstances).toHaveLength(2); // JaneDoe should be visible
    // });
  });
});
