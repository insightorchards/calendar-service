describe("journey test", () => {
  let postOneId;
  let postTwoId;

  beforeEach(() => {
    // For an unknown reason this sets the current
    // day to Dec 26, not Nov 26. Leaving since this
    // is our only way of mocking out time in these tests
    cy.clock(new Date(2022, 11, 26), ["Date"]);
  });

  after(() => {
    cy.log({ postOneId, postTwoId });
    cy.request("DELETE", `http://localhost:4000/entries/${postOneId}`);
    cy.request("DELETE", `http://localhost:4000/entries/${postTwoId}`);
  });

  it("can create and update an event", () => {
    cy.visit("http://localhost:3000");
    cy.intercept({
      method: "POST",
      url: "/entries",
      hostname: "localhost",
    }).as("createEntry");

    cy.get(`[aria-label="add event"]`).click();
    cy.contains("label", "Title").click().type("Hello");
    cy.contains("label", "Description").click().type("It's a beautiful day");
    cy.contains("label", "Start Date").click().type("2022-11-26");
    cy.get("#endDate").should("have.value", "2022-11-26");
    cy.contains("label", "End Date").click().type("2022-11-27");
    cy.contains("label", "Start Time").click().type("04:35");
    cy.contains("label", "End Time").click().type("06:45");
    cy.contains("button", "Create Event").click();

    cy.wait("@createEntry").then((interception) => {
      postOneId = interception.response.body._id;
    });

    cy.contains("Hello").click();
    cy.contains("Hello").should("be.visible");
    cy.contains("It's a beautiful day").should("be.visible");
    cy.contains("Sat, Nov 26, 04:35 AM - Sun, Nov 27, 06:45 AM").should(
      "be.visible"
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
      "be.visible"
    );
    cy.contains("button", "Delete").click();
    cy.contains("Hello Everyone").should("not.exist");
  });

  it("shows no time when event is `allDay`", () => {
    cy.visit("http://localhost:3000");
    cy.intercept({
      method: "POST",
      url: "/entries",
      hostname: "localhost",
    }).as("createEntry");
    cy.get(`[aria-label="add event"]`).click();
    cy.contains("label", "Title").click().type("Bye");
    cy.contains("label", "Description").click().type("It's a beautiful night");
    cy.contains("label", "Start Date").click().type("2022-12-14");
    cy.contains("label", "End Date").click().type("2022-12-14");
    cy.contains("label", "All Day").click();
    cy.contains("button", "Create Event").click();

    cy.wait("@createEntry").then((interception) => {
      postTwoId = interception.response.body._id;
    });

    cy.contains("Bye").click();
    cy.contains("Bye").should("be.visible");
    cy.contains("It's a beautiful night").should("be.visible");
    cy.findByText("Wed, Dec 14").should("exist");
    cy.findByText("all day").should("exist");
  });

  it("opens create event modal with date, time, and all day pre-selected when field is clicked", () => {
    cy.visit("http://localhost:3000");
    cy.get(`[data-date="2022-12-14"]`).click();
    cy.get(".chakra-modal__body").within(() => {
      cy.get(`[id="startDate"]`).should("have.value", "2022-12-14");
      cy.get(`[id="endDate"]`).should("have.value", "2022-12-14");
    });
    cy.get(`[aria-label="Close"]`).click();
    cy.findByText("week").click();
    cy.get(`[data-date="2022-12-26"]`).eq(1).click();
    cy.get(".chakra-modal__body").within(() => {
      cy.get(`[id="startDate"]`).should("have.value", "2022-12-26");
      cy.get(`[id="endDate"]`).should("have.value", "2022-12-26");
      cy.get('[type="checkbox"]').should("be.checked");
    });
    cy.get(`[aria-label="Close"]`).click();
    cy.get(`[data-time="06:30:00"]`).eq(1).click();
    cy.get(".chakra-modal__body").within(() => {
      cy.get(`[id="startTime"]`).should("have.value", "06:30");
      cy.get(`[id="endTime"]`).should("have.value", "07:30");
    });
  });
});
