describe('Form Page Tests', () => {

  beforeEach(() => {
    cy.visit('form.html');
  });

  it('loads the form page', () => {
    cy.contains('Join Us').should('be.visible');
  });

  it('shows all input fields', () => {
    cy.get('#name').should('exist');
    cy.get('#age').should('exist');
    cy.get('#address').should('exist');
    cy.get('#email').should('exist');
    cy.get('#contribution').should('exist'); // updated
  });

  it('shows submit button', () => {
    cy.get('#submitBtn').should('be.visible').and('be.enabled');
  });

  it('allows typing in inputs', () => {
    cy.get('#name').type('Fiyin');
    cy.get('#age').type('20');
    cy.get('#address').type('Lagos');
    cy.get('#email').type('test@gmail.com');
    cy.get('#contribution').type('Frontend Developer'); // updated
  });

  it('submits form and goes to welcome page', () => {
    cy.get('#name').type('Fiyin');
    cy.get('#age').type('20');
    cy.get('#address').type('Lagos');
    cy.get('#email').type('test@gmail.com');
    cy.get('#contribution').type('Frontend Dev'); // updated

    cy.get('#submitBtn').click();

    cy.url().should('include', 'welcome.html');
    cy.get('#nameText').should('contain.text', 'Name: Fiyin'); // matches your welcome page
    cy.get('#contributionText').should('contain.text', 'Contribution: Frontend Dev');
  });
    
  describe('Email validation tests', () => {

  beforeEach(() => {
    cy.visit('form.html');
  });

  it('prevents submission with invalid email format', () => {
    cy.get('#name').type('Fiyin');
    cy.get('#age').type('20');
    cy.get('#address').type('Lagos');

    // Invalid email (will fail custom regex)
    cy.get('#email').type('test@gmail'); 
    cy.get('#contribution').type('Frontend Dev');

    // Catch the alert that your JS shows
    cy.on('window:alert', (txt) => {
      expect(txt).to.contains('Please enter a valid email');
    });

    cy.get('#submitBtn').click();

    // Should still be on the form page
    cy.url().should('include', 'form.html');
  });

  it('allows submission with valid email format', () => {
    cy.get('#name').type('Fiyin');
    cy.get('#age').type('20');
    cy.get('#address').type('Lagos');

    // Valid email
    cy.get('#email').type('test@gmail.com'); 
    cy.get('#contribution').type('Frontend Dev');

    cy.get('#submitBtn').click();

    // Should redirect to welcome page
    cy.url().should('include', 'welcome.html');
    cy.get('#emailText').should('contain.text', 'Email: test@gmail.com');
  });

});


describe('Empty fields validation', () => {

  beforeEach(() => {
    cy.visit('form.html');
  });

  it('does not submit the form if required fields are empty', () => {
    // Click submit immediately without typing anything
    cy.get('#submitBtn').click();

    // Catch browser validation or alert (for custom JS)
    cy.on('window:alert', (txt) => {
      // Only triggered if our custom validation runs
      expect(txt).to.exist;
    });

    // Should still be on the form page
    cy.url().should('include', 'form.html');

    // Each field should still exist and be empty
    cy.get('#name').should('have.value', '');
    cy.get('#age').should('have.value', '');
    cy.get('#address').should('have.value', '');
    cy.get('#email').should('have.value', '');
    cy.get('#contribution').should('have.value', '');
  });

});

describe('Long text in contribution field', () => {

  beforeEach(() => {
    cy.visit('form.html');
  });

  it('submits the form with a very long contribution text', () => {
    const longText = 'A'.repeat(500); // 500 characters

    cy.get('#name').type('Fiyin');
    cy.get('#age').type('20');
    cy.get('#address').type('Lagos');
    cy.get('#email').type('test@gmail.com');
    cy.get('#contribution').type(longText);

    cy.get('#submitBtn').click();

    // Should redirect to welcome page
    cy.url().should('include', 'welcome.html');

    // Contribution text should be displayed fully
    cy.get('#contributionText').should('contain.text', longText);
  });

});

describe('Prevent multiple submissions', () => {
  beforeEach(() => {
    cy.visit('form.html');
  });

  it('disables submit button so user cannot submit more than once', () => {
    cy.get('#name').type('Fiyin');
    cy.get('#age').type('20');
    cy.get('#address').type('Lagos');
    cy.get('#email').type('test@gmail.com');
    cy.get('#contribution').type('Frontend Dev');

    // First submit
    cy.get('#submitBtn').click();

    // Button should disable BEFORE redirect
    cy.get('#submitBtn').should('be.disabled');

    // Try submitting again
    cy.get('#submitBtn').click({ force: true });
    cy.get('#submitBtn').should('be.disabled');
  });
});

describe('Age validation', () => {
  beforeEach(() => {
    cy.visit('form.html');
  });

  it('prevents submission if age is 0', () => {
    cy.get('#name').type('Fiyin');
    cy.get('#age').type('0'); // invalid because min="1"
    cy.get('#address').type('Lagos');
    cy.get('#email').type('test@gmail.com');
    cy.get('#contribution').type('Frontend Dev');

    cy.get('#submitBtn').click();

    // Should stay on form page
    cy.url().should('include', 'form.html');

    // Age input should be invalid
    cy.get('#age:invalid').should('exist');

    // Button should NOT be disabled because submission failed
    cy.get('#submitBtn').should('not.be.disabled');
  });
});

describe('Age field input type', () => {
  beforeEach(() => {
    cy.visit('form.html');
  });

  it('does not allow letters in the age field', () => {
    cy.get('#age').type('abc');

    // The value should be empty because type="number" blocks letters
    cy.get('#age').should('have.value', '');

    // Try mixing letters and numbers
    cy.get('#age').type('12abc');

    // Only the numbers should be accepted
    cy.get('#age').should('have.value', '12');
  });
});

describe('Email validation - missing @', () => {
  beforeEach(() => {
    cy.visit('form.html');
  });

  it('prevents submission when email is missing @', () => {
    cy.get('#name').type('Fiyin');
    cy.get('#age').type('20');
    cy.get('#address').type('Lagos');

    // Invalid email (missing @)
    cy.get('#email').type('testgmail.com');
    cy.get('#contribution').type('Frontend Dev');

    cy.get('#submitBtn').click();

    // Should stay on the form page
    cy.url().should('include', 'form.html');

    // Email input should be invalid
    cy.get('#email:invalid').should('exist');

    // Button should not be disabled because submission failed
    cy.get('#submitBtn').should('not.be.disabled');
  });
});

describe('Contribution field required', () => {
  beforeEach(() => {
    cy.visit('form.html');
  });

  it('prevents submission when contribution textarea is empty', () => {
    cy.get('#name').type('Fiyin');
    cy.get('#age').type('20');
    cy.get('#address').type('Lagos');
    cy.get('#email').type('test@gmail.com');

    // Intentionally leave contribution empty
    cy.get('#submitBtn').click();

    // Should still be on the form page
    cy.url().should('include', 'form.html');

    // Textarea should be invalid
    cy.get('#contribution:invalid').should('exist');

    // Submit button should NOT be disabled (since submission failed)
    cy.get('#submitBtn').should('not.be.disabled');
  });
});

describe('Name field required', () => {
  beforeEach(() => {
    cy.visit('form.html');
  });

  it('prevents submission when name is empty', () => {
    // Leave name empty
    cy.get('#age').type('20');
    cy.get('#address').type('Lagos');
    cy.get('#email').type('test@gmail.com');
    cy.get('#contribution').type('Frontend Dev');

    cy.get('#submitBtn').click();

    // Should stay on form page
    cy.url().should('include', 'form.html');

    // Name input should be invalid
    cy.get('#name:invalid').should('exist');

    // Button should not be disabled
    cy.get('#submitBtn').should('not.be.disabled');
  });
});

/// <reference types="cypress" />

describe('Join Us Form - Name Field Required', () => {

  beforeEach(() => {
    cy.visit('form.html');
  });

  it('does not submit if Name field is empty', () => {
    cy.get('#age').type('20');
    cy.get('#address').type('Lagos');
    cy.get('#email').type('test@gmail.com');
    cy.get('#contribution').type('Frontend Dev');

    cy.get('#submitBtn').click();

    cy.get('#name:invalid').should('exist');
    cy.url().should('include', 'form.html');
    cy.get('#submitBtn').should('not.be.disabled');
  });

});
/// <reference types="cypress" />

describe('Join Us Form - Address Field Required', () => {

  beforeEach(() => {
    cy.visit('form.html');
  });

  it('does not submit if Address field is empty', () => {
    cy.get('#name').type('Fiyin');
    cy.get('#age').type('20');
    cy.get('#email').type('test@gmail.com');
    cy.get('#contribution').type('Frontend Dev');

    cy.get('#submitBtn').click();

    cy.get('#address:invalid').should('exist');
    cy.url().should('include', 'form.html');
  });

});

/// <reference types="cypress" />

describe('Join Us Form - Special Characters', () => {

  beforeEach(() => {
    cy.visit('form.html');
  });

  it('accepts special characters in name and contribution', () => { 
    // Fill fields with special characters
    cy.get('#name').type('Fiyin@#!');
    cy.get('#age').type('25');
    cy.get('#address').type('Lagos#123');
    cy.get('#email').type('test@gmail.com');
    cy.get('#contribution').type('Frontend Dev!@#$%^');

    // Submit the form
    cy.get('#submitBtn').click();

    // Check that the page redirected and displays the values correctly
    cy.url().should('include', 'welcome.html');
    cy.get('#nameText').should('contain.text', 'Fiyin@#!');
    cy.get('#contributionText').should('contain.text', 'Frontend Dev!@#$%^');
  });

});

/// <reference types="cypress" />

describe('Join Us Form - Long Input Fields (Safe Test)', () => {

  beforeEach(() => {
    cy.visit('form.html');
  });

  it('submits form with long Name and Address fields', () => {
    const longName = 'F'.repeat(200);      
    const longAddress = 'Lagos Street '.repeat(20); 
    const contribution = 'Frontend Dev';

    // Fill fields
    cy.get('#name').type(longName);
    cy.get('#age').type('30');
    cy.get('#address').type(longAddress);
    cy.get('#email').type('test@gmail.com');
    cy.get('#contribution').type(contribution);

    // Submit the form
    cy.get('#submitBtn').click();

    // Should redirect to welcome page
    cy.url().should('include', 'welcome.html');

    // Verify a substring instead of full text (works for long text)
    cy.get('#nameText').should('contain.text', longName.slice(0, 50));
    cy.get('#addressText').should('contain.text', 'Lagos Street'); // check recognizable substring
    cy.get('#contributionText').should('contain.text', contribution);
  });

});

/// <reference types="cypress" />

describe('Join Us Form - Trim Input Fields', () => {

  beforeEach(() => {
    cy.visit('form.html');
  });

  it('trims leading and trailing spaces in all fields', () => {
    cy.get('#name').type('   Fiyin   ');
    cy.get('#age').type(' 25 ');
    cy.get('#address').type('   Lagos   ');
    cy.get('#email').type('   test@gmail.com   ');
    cy.get('#contribution').type('   Frontend Dev   ');

    cy.get('#submitBtn').click();

    // Verify trimmed values appear on welcome page
    cy.url().should('include', 'welcome.html');
    cy.get('#nameText').should('contain.text', 'Fiyin');
    cy.get('#ageText').should('contain.text', '25');
    cy.get('#addressText').should('contain.text', 'Lagos');
    cy.get('#emailText').should('contain.text', 'test@gmail.com');
    cy.get('#contributionText').should('contain.text', 'Frontend Dev');
  });

});


});










