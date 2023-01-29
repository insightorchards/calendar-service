import * as React from "react";
import s from "./counter.module.css";

export function Counter() {
  const [count, setCount] = React.useState(0);
  return (
    <>
      <p className={s.red}>You clicked {count} times</p>
      <button onClick={() => setCount(count + 1)}>Click me</button>
    </>
  );
}
