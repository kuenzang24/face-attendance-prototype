import mongoose, { Schema, Document } from 'mongoose'

export interface IEmployee extends Document {
  employee_id: string
  name: string
  face_token: string
  face_embedding: string
  faceset_token?: string
  face_quality: {
    value: number
    blur_level: number
  }
  created_at: Date
  updated_at: Date
}

const EmployeeSchema: Schema = new Schema({
  employee_id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  face_token: { type: String, required: true },
  face_embedding: { type: String, required: true },
  faceset_token: { type: String },
  face_quality: {
    value: { type: Number, required: true },
    blur_level: { type: Number, required: true }
  },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now }
}, {
  // Force new schema without any old validation
  strict: true,
  collection: 'employees'
})

// Clear any existing model to force recreation
if (mongoose.models.Employee) {
  delete mongoose.models.Employee
}

export default mongoose.model<IEmployee>('Employee', EmployeeSchema)
