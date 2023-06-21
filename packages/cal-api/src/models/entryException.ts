import mongoose from "mongoose";
import { withIdVirtualField } from "../plugins/withIdVirtualField";

const entryExceptionSchema = new mongoose.Schema(
  {
    deleted: {
      type: Boolean,
      required: true,
    },
    modified: {
      type: Boolean,
      required: true,
    },
    entryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CalendarEntry",
      required: true,
    },
    title: {
      type: String,
      required: false,
    },
    description: {
      type: String,
      required: false,
    },
    allDay: {
      type: Boolean,
      required: false,
    },
    startTimeUtc: {
      type: Date,
      required: true,
    },
    endTimeUtc: {
      type: Date,
      required: false,
    },
  },
  {
    timestamps: true,
  }
);

entryExceptionSchema.plugin(withIdVirtualField);

const EntryException = mongoose.model(
  "EntryException",
  entryExceptionSchema,
  "entryExceptions"
);

export { EntryException };
