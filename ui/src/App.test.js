import { render } from '@testing-library/react';
import App from './App';

describe('App', () => {
  
  it('renders correctly', () => {
    const app = render(App)
    expect(app.asFragment()).toMatchSnapshot()
  })

  xit('shows calander with event input fields', () => {})
  
  describe("events", () => {
    xit('displays correct default values for event inputs on page load', () => {})
    xit('displays event in ui when all inputs are provided valid values', () => {})
    xit('errors when end date is before start date', () => {})
    xit('errors when end time is before start time on the same day', () => {})
  })
})
