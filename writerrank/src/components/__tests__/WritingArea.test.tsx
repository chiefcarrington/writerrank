import { render, screen, fireEvent, act } from '@testing-library/react'
import WritingArea from '../WritingArea'

jest.useFakeTimers()

afterEach(() => {
  jest.clearAllTimers()
})

test('timer continues decrementing while typing', () => {
  const onStartWriting = jest.fn()
  const onTimeUp = jest.fn()
  const onTextChange = jest.fn()

  render(
    <WritingArea
      isWritingActive={true}
      onStartWriting={onStartWriting}
      onTimeUp={onTimeUp}
      onTextChange={onTextChange}
      locked={false}
    />
  )

  // Initial time should be full duration 3:00
  expect(screen.getByText(/Time Left:/)).toHaveTextContent('Time Left: 3:00')

  act(() => {
    jest.advanceTimersByTime(1000)
  })

  // After 1 second
  expect(screen.getByText(/Time Left:/)).toHaveTextContent('Time Left: 2:59')

  const textarea = screen.getByLabelText('Writing input') as HTMLTextAreaElement
  fireEvent.change(textarea, { target: { value: 'Hello' } })

  act(() => {
    jest.advanceTimersByTime(1000)
  })

  // Timer should continue decrementing, not reset to 3:00
  expect(screen.getByText(/Time Left:/)).toHaveTextContent('Time Left: 2:58')
})
