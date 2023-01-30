import * as React from 'react'
// import FullCalendar from '@fullcalendar/react'
import './styles.scss'

const { useState, useEffect } = React

const Counter: React.FC<{
  count: number
  className: string
}> = ({ count, className }) => (
  <>
    {/* <FullCalendar /> */}
    <div className={`counter ${className}`}>
      <p className={`red`}>This is some sample text</p>
      <p
        key={count}
        className={`counter__count ${className ? className + '__count' : ''}`}
      >
        {count}
      </p>
    </div>
  </>
)

export type ICounterProps = {
  className?: string
}

const App: React.FC<ICounterProps> = ({ className = '' }) => {
  const [count, setCount] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      if (count > 99) return setCount(0)

      setCount(count + 1)
    }, 1000)

    return () => clearInterval(interval)
  }, [count, setCount])

  return <Counter className={className} count={count} />
}

export default App
