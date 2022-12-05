describe("journey test", () => {
  let postOneId;
  let postTwoId;

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

    cy.contains("label", "Title").click().type("Hello");
    cy.contains("label", "Description").click().type("It's a beautiful day");
    cy.contains("label", "Start Date").click().type("2022-11-26");
    cy.contains("label", "End Date").click().type("2022-11-27");
    cy.contains("label", "Start Time").click().type("04:35");
    cy.contains("label", "End Time").click().type("06:45");
    cy.contains("button", "Create Event").click();

    cy.wait("@createEntry").then((interception) => {
      postOneId = interception.response.body._id;
    });

    cy.contains("Hello").click();
    cy.contains("Event title: Hello").should("be.visible");
    cy.contains("Description: It's a beautiful day").should("be.visible");
    cy.contains("Start: Saturday, November 26 04:35 AM").should("be.visible");
    cy.contains("End: Sunday, November 27 06:45 AM").should("be.visible");
    cy.contains("button", "Edit").click();
    cy.get(".chakra-modal__body").within(() => {
      cy.contains("label", "Title").click().type(" Everyone");
      cy.contains("label", "Start Date").click().type("2022-11-27");
      cy.contains("label", "End Date").click().type("2022-11-29");
      cy.contains("label", "Start Time").click().type("07:35");
      cy.contains("label", "End Time").click().type("08:45");
      cy.contains("button", "Save").click();
    });
    cy.contains("Event title: Hello Everyone").should("be.visible");
    cy.contains("Description: It's a beautiful day").should("be.visible");
    cy.contains("Start: Sunday, November 27 07:35 AM").should("be.visible");
    cy.contains("End: Tuesday, November 29 08:45 AM").should("be.visible");
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
    cy.contains("Event title: Bye").should("be.visible");
    cy.contains("Description: It's a beautiful night").should("be.visible");
    cy.findByText("Start: Wednesday, December 14").should("exist");
    cy.findByText("End: Wednesday, December 14").should("exist");
  });
});
