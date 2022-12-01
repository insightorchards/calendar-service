import { act, render, screen, waitFor } from "@testing-library/react";
import React from "react";
import userEvent from "@testing-library/user-event";
import App from "./App";
import { createEntry, deleteEntry, getEntries, getEntry } from "./hooks";
jest.mock("./hooks");
import EventForm from "./EventForm";

const mockCreateEntry = createEntry as jest.MockedFunction<typeof createEntry>;
const mockGetEntries = getEntries as jest.MockedFunction<typeof getEntries>;
const mockGetEntry = getEntry as jest.MockedFunction<typeof getEntry>;
const mockDeleteEntry = deleteEntry as jest.MockedFunction<typeof deleteEntry>;

describe("EventForm", () => {
  it("mutes out time sections when all day is selected", () => {});
});
