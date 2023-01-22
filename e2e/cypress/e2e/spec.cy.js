import "@4tw/cypress-drag-drop";

describe("journey test", () => {
  beforeEach(() => {
    // For an unknown reason this sets the current
    // day to Dec 26, 3:12am not Nov 26. Leaving since this
    // is our only way of mocking out time in these tests
    cy.clock(new Date(2022, 11, 26, 3, 12), ["Date"]);
  });

  // TODO: A note to fix this test that is currently breaking on main
  it.skip("can create and update an event", () => {
    cy.visit("http://localhost:3000");

    cy.get(`[aria-label="add event"]`).click();
    cy.contains("label", "Title").click().type("Hello");
    cy.contains("label", "Description").click().type("It's a beautiful day");
    cy.contains("label", "Start Date").click().type("2022-11-26");
    cy.get("#endDate").should("have.value", "2022-11-26");
    cy.contains("label", "End Date").click().type("2022-11-27");
    cy.contains("label", "Start Time").click().type("04:35");
    cy.contains("label", "End Time").click().type("06:45");
    cy.contains("button", "Create Event").click();

    cy.contains("Hello").click();
    cy.contains("Hello").should("be.visible");
    cy.contains("It's a beautiful day").should("be.visible");
    cy.contains("Sat, Nov 26, 04:35 AM - Sun, Nov 27, 06:45 AM").should(
      "be.visible",
    );
    cy.contains("button", "Edit").click();
    cy.get(".chakra-modal__body").within(() => {
      cy.contains("label", "Title").click().type(" Everyone");
      cy.contains("label", "Start Date").click().type("2022-11-27");
      cy.contains("label", "End Date").click().type("2022-11-29");
      cy.contains("label", "Start Time").click().type("07:35");
      cy.contains("label", "End Time").click().type("08:45");
      cy.contains("button", "Save").click();
    });
    cy.contains("Hello Everyone").should("be.visible");
    cy.contains("It's a beautiful day").should("be.visible");
    cy.contains("Sun, Nov 27, 07:35 AM - Tue, Nov 29, 08:45 AM").should(
      "be.visible",
    );
    cy.contains("button", "Delete").click();
    cy.contains("Hello Everyone").should("not.exist");
  });

  it("shows no time when event is `allDay`", () => {
    cy.visit("http://localhost:3000");
    cy.get(`[aria-label="add event"]`).click();
    cy.contains("label", "Title").click().type("Bye");
    cy.contains("label", "Description").click().type("It's a beautiful night");
    cy.contains("label", "Start Date").click().type("2022-12-14");
    cy.contains("label", "End Date").click().type("2022-12-14");
    cy.contains("label", "All Day").click();
    cy.contains("button", "Create Event").click();

    cy.contains("Bye").click();
    cy.contains("Bye").should("be.visible");
    cy.contains("It's a beautiful night").should("be.visible");
    cy.findByText("Wed, Dec 14").should("exist");
    cy.findByText("All Day").should("exist");

    cy.contains("Delete").click();
    cy.findByText("Bye").should("not.exist");
  });

  it.only("shows correct default time when uncreated event is changed to not be `allDay`", () => {
    cy.visit("http://localhost:3000");

    // Creating new event from "+"
    cy.get(`[aria-label="add event"]`).click();
    cy.contains("label", "Title").click().type("Bye");
    cy.contains("label", "Description").click().type("It's a beautiful night");
    cy.contains("label", "Start Date").click().type("2022-12-14");
    cy.contains("label", "End Date").click().type("2022-12-14");
    cy.contains("label", "All Day").click();

    cy.contains("label", "Start Time").should("not.exist");
    cy.contains("label", "End Time").should("not.exist");

    cy.contains("label", "All Day").click();

    // Create event modal has correct time defaults
    cy.get(`[id="startTime"]`).should("have.value", "04:00");
    cy.get(`[id="endTime"]`).should("have.value", "05:00");
    cy.contains("button", "Create Event").click();

    cy.contains("Bye").click();
    cy.contains("Delete").click();
    cy.findByText("Bye").should("not.exist");
  });

  it("shows correct default time when new and existing allDay event is changed to not be `allDay`", () => {
    cy.visit("http://localhost:3000");
    // Creating new event from clicking on a date
    cy.get(`[data-date="2022-12-14"]`).click();
    cy.contains("label", "Title").click().type("Night");
    cy.contains("label", "Description").click().type("It's a beautiful night");
    cy.contains("label", "Start Date").click().type("2022-12-14");
    cy.contains("label", "End Date").click().type("2022-12-14");

    // Assert All Day is default true
    cy.contains("label", "All Day").within(() => {
      cy.get('[type="checkbox"]').should("be.checked");
    });

    // Uncheck All Day
    // Assert time defaults are correct
    cy.contains("label", "All Day").click();
    cy.get(`[id="startTime"]`).should("have.value", "04:00");
    cy.get(`[id="endTime"]`).should("have.value", "05:00");

    // Recheck All Day to create event
    cy.contains("label", "All Day").click();
    cy.contains("button", "Create Event").click();

    // Open event
    cy.contains("Night").click();
    cy.contains("Edit").click();

    // Uncheck All Day
    // Assert time defaults are correct
    cy.contains("label", "All Day").click();
    cy.get(`[id="startTime"]`).should("have.value", "04:00");
    cy.get(`[id="endTime"]`).should("have.value", "05:00");
    cy.contains("button", "Save").click();

    cy.contains("Night").click();
    cy.contains("Delete").click();
    cy.findByText("Night").should("not.exist");
  });

  it("shows an error if recurrence end is before the event start", () => {
    cy.visit("http://localhost:3000");

    cy.get(`[aria-label="add event"]`).click();
    cy.contains("label", "Title").click().type("Hello");
    cy.contains("label", "Description").click().type("It's a beautiful day");
    cy.contains("label", "Start Date").click().type("2022-11-26");
    cy.get("#endDate").should("have.value", "2022-11-26");
    cy.contains("label", "End Date").click().type("2022-11-27");
    cy.contains("label", "Start Time").click().type("04:35");
    cy.contains("label", "End Time").click().type("06:45");

    cy.contains("label", "Recurring").click();
    cy.contains("label", "Recurrence End").click().type("2021-04-26");

    cy.contains("button", "Create Event").click();

    cy.contains("Error: recurrence end must be after start.").should(
      "be.visible",
    );
  });
  describe("month view", () => {
    it("has correct start/end date in modal when date clicked", () => {
      cy.visit("http://localhost:3000");
      cy.get(`[data-date="2022-12-14"]`).click();
      cy.get(".chakra-modal__body").within(() => {
        cy.get(`[id="startDate"]`).should("have.value", "2022-12-14");
        cy.get(`[id="endDate"]`).should("have.value", "2022-12-14");
      });
      cy.get(`[aria-label="Close"]`).click();
    });

    it("opens a modal when drag selecting multiple days", () => {});
  });

  describe("week view", () => {
    it("has correct start/end date and allDay is checked in modal when date clicked", () => {
      cy.findByText("week").click();
      cy.get(`[data-date="2022-12-26"]`).eq(1).click();
      cy.get(".chakra-modal__body").within(() => {
        cy.get(`[id="startDate"]`).should("have.value", "2022-12-26");
        cy.get(`[id="endDate"]`).should("have.value", "2022-12-26");
        cy.contains("label", "All Day").within(() => {
          cy.get('[type="checkbox"]').should("be.checked");
        });
      });
      cy.get(`[aria-label="Close"]`).click();
    });

    it("has correct start/end time in modal when specific time clicked", () => {
      cy.get(`[data-time="06:30:00"]`).eq(1).click();
      cy.get(".chakra-modal__body").within(() => {
        cy.get(`[id="startTime"]`).should("have.value", "06:30");
        cy.get(`[id="endTime"]`).should("have.value", "07:00");
      });
    });
  });

  describe("select draggable multiday event", () => {
    it("opens and populates the modal with selected dates", () => {
      cy.visit("http://localhost:3000");
      cy.get(`[data-date="2022-12-26"]`).drag(`[data-date="2022-12-28"]`, {
        force: true,
      });
      cy.get(`[data-date="2022-12-28"]`).click({ force: true });
      cy.get(".chakra-modal__body").within(() => {
        cy.get(`[id="startDate"]`).should("have.value", "2022-12-26");
        cy.get(`[id="endDate"]`).should("have.value", "2022-12-28");
      });
    });
  });

  // Testing Recurring events
  describe("recurring events", () => {
    it("displays monthly recurring events", () => {
      cy.visit("http://localhost:3000");
      cy.intercept({
        method: "POST",
        url: "/entries",
        hostname: "localhost",
      }).as("createEntry");

      cy.contains("Morning run").should("not.exist");
      cy.get(`[data-date="2022-12-22"]`).click();
      cy.contains("label", "Title").click().type("Morning run");
      cy.contains("label", "Description").click().type("Under the big blue");
      cy.contains("label", "Start Date").click().type("2022-12-22");
      cy.contains("label", "End Date").click().type("2022-12-22");

      cy.contains("label", "Recurring").click();
      cy.contains("label", "Recurrence End").click().type("2023-01-25");

      cy.contains("label", "Monthly").within(() => {
        cy.get(":radio").should("be.checked");
      });

      cy.contains("button", "Create Event").click();

      // Assert monthly recurring events is created
      cy.findByText("December 2022").should("be.visible");
      cy.contains("Morning run").should("be.visible");

      // Assert an event was also created in the next month
      cy.get(`[title="Next month"]`).click();
      cy.findByText("January 2023").should("be.visible");
      cy.findByText("December 2022").should("not.exist");
      cy.contains("Morning run").should("be.visible");

      // Deletes recurrence series
      cy.contains("Morning run").click();
      cy.contains("Delete").click();
      cy.contains("Delete series").click();
      cy.findByText("Morning run").should("not.exist");
    });
  });

  it("displays weekly recurring events", () => {
    cy.visit("http://localhost:3000");
    cy.intercept({
      method: "POST",
      url: "/entries",
      hostname: "localhost",
    }).as("createEntry");

    // Assert weekly recurring events are created
    cy.contains("Sunset hike").should("not.exist");
    cy.get(`[data-date="2022-12-01"]`).click();
    cy.contains("label", "Title").click().type("Sunset hike");
    cy.contains("label", "Description").click().type("On Mt Tam");
    cy.contains("label", "Start Date").click().type("2022-12-01");
    cy.contains("label", "End Date").click().type("2022-12-01");

    cy.contains("label", "Recurring").click();
    cy.contains("label", "Weekly").click();
    cy.contains("label", "Recurrence End").click().type("2022-12-31");

    cy.contains("button", "Create Event").click();

    // Assert that 5 instances of an event are created, one for each week in December
    cy.get(".fc-dayGridMonth-view")
      .find(".fc-event-title")
      .should("have.length", 5);

    // Deletes recurrence series
    cy.contains("Sunset hike").click();
    cy.contains("Delete").click();
    cy.contains("Delete series").click();
    cy.findByText("Sunset hike").should("not.exist");
  });

  it("displays daily recurring events", () => {
    cy.visit("http://localhost:3000");
    cy.intercept({
      method: "POST",
      url: "/entries",
      hostname: "localhost",
    }).as("createEntry");

    // Asserts daily recurring events are created
    cy.contains("Gardening").should("not.exist");
    cy.get(`[data-date="2022-12-01"]`).click();
    cy.contains("label", "Title").click().type("Gardening");
    cy.contains("label", "Description").click().type("In the backyard");
    cy.contains("label", "Start Date").click().type("2022-12-01");
    cy.contains("label", "End Date").click().type("2022-12-01");

    cy.contains("label", "Recurring").click();
    cy.contains("label", "Daily").click();
    cy.contains("label", "Recurrence End").click().type("2022-12-31");

    cy.contains("button", "Create Event").click();

    cy.get(".fc-dayGridMonth-view")
      .find(".fc-event-title")
      .should("have.length", 31);

    // Deletes recurrence series
    cy.contains("Gardening").click();
    cy.contains("Delete").click();
    cy.contains("Delete series").click();
    cy.findByText("Gardening").should("not.exist");
  });
});
