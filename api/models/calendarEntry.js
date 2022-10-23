const mongoose = require("mongoose");

const calendarEntrySchema = new mongoose.Schema({
  eventId: {
    type: String,
    required: true
  },
  creatorId: {
    type: String,
    required: true
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  isAllDay: {
    type: Boolean,
    required: false
  },
  startTimeUtc: {
    type: Date,
    required: false,
  },
  endTimeUtc: {
    type: Date,
    required: false,
  },
},
{
  timestamps: true,
})

const CalendarEntry = mongoose.model("CalendarEntry", calendarEntrySchema, 'calendarEntries')

module.exports = { CalendarEntry }
