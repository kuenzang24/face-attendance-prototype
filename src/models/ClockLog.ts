import mongoose, { Schema, Document } from 'mongoose'

export interface IClockLog extends Document {
  employee_id: mongoose.Types.ObjectId | null
  timestamp: Date
  recognition: {
    confidence: number
    similarity_score: number
    face_token: string
  }
  status: string
  created_at: Date
}

const ClockLogSchema: Schema = new Schema({
  employee_id: { type: Schema.Types.ObjectId, ref: 'Employee', required: false },
  timestamp: { type: Date, required: true },
  recognition: {
    confidence: { type: Number, required: true },
    similarity_score: { type: Number, required: true },
    face_token: { type: String, required: true }
  },
  status: { type: String, required: true },
  created_at: { type: Date, default: Date.now }
}, {
  // Force new schema without any old validation
  strict: true,
  collection: 'clocklogs'
})

// Clear any existing model to force recreation
if (mongoose.models.ClockLog) {
  delete mongoose.models.ClockLog
}

export default mongoose.model<IClockLog>('ClockLog', ClockLogSchema)
