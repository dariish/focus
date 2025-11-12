import React from "react";
import TimeInput from "../../shared/timer/TimeInput";

export default function TimerSection() {
  //controls the buttons, if its zero it will receive here.
  //Controls the time, if free mode, will change back the time to zero.

  return (
    <section className="w-full h-screen flex justify-center items-center lg:min-w-2/3">
      <div className="flex flex-col items-center justify-center">
        <TimeInput
          format={{ type: "h:min:s", dots: true }}
          initialValue={340}
          range={{ min: 200, max: 641 }}
        />
        <div>section connected to the input</div>
      </div>
    </section>
  );
}
