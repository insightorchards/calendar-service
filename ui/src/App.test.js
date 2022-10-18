const MockDate = require('mockdate')
import { render, screen } from '@testing-library/react';
import App from './App';

describe('App', () => {
  it('renders correctly', () => {
    const NOW = '2022-05-25T00:25:55.444Z'
    Date.now = jest.spyOn(Date, 'now').mockImplementation(() => 1530518207007)
    const app = render(<App />)
    expect(app.asFragment()).toMatchSnapshot()
  })

  it('shows calander with event input fields', async () => {
    render(<App />)
    expect(await screen.findByText("Month")).toBeVisible()
  })
  
  describe("events", () => {
    xit('displays correct default values for event inputs on page load', () => {})
    xit('displays event in ui when all inputs are provided valid values', () => {})
    xit('errors when end date is before start date', () => {})
    xit('errors when end time is before start time on the same day', () => {})
  })
})
