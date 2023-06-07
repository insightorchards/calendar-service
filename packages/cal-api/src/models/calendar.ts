import mongoose from "mongoose";
import { withIdVirtualField } from "../plugins/withIdVirtualField";

const schema = new mongoose.Schema(
  {
    eventId: {
      type: String,
      required: true,
    },
    creatorId: {
      type: String,
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: false,
    },
  },
  {
    timestamps: true,
  }
);

schema.plugin(withIdVirtualField);

const Calendar = mongoose.model("Calendar", schema, "calendars");

export { Calendar };
