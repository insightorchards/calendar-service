describe("journey test", () => {
  it("can create and update an event", () => {
    cy.visit("http://localhost:3000");
    cy.contains("label", "Title").click().type("Hello");
    cy.contains("label", "Start Date").click().type("2022-11-26");
    cy.contains("label", "End Date").click().type("2022-11-27");
    cy.contains("label", "Start Time").click().type("04:35");
    cy.contains("label", "End Time").click().type("06:45");
    cy.contains("button", "Create Event").click();
    cy.contains("Hello").click();
    cy.contains("Event title: Hello").should("be.visible");
    cy.contains("Description: default entry description").should("be.visible");
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
    cy.contains("Description: default entry description").should("be.visible");
    cy.contains("Start: Sunday, November 27 07:35 AM").should("be.visible");
    cy.contains("End: Tuesday, November 29 08:45 AM").should("be.visible");
    cy.contains("button", "Delete").click();
    cy.contains("Hello Everyone").should("not.exist");
  });
});
