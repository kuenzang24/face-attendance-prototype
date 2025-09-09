import { NextRequest, NextResponse } from 'next/server'
import connectToDatabase from '@/lib/mongodb'
import Employee from '@/models/Employee'
import FacePPService from '@/lib/facepp'

export async function POST(req: NextRequest) {
  try {
    // Connect to database
    await connectToDatabase()

    // Parse request body
    const { employee_id, name, image } = await req.json()

    if (!employee_id || !name || !image) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Check if employee already exists
    const existingEmployee = await Employee.findOne({ employee_id })
    if (existingEmployee) {
      return NextResponse.json(
        { error: 'Employee ID already exists' },
        { status: 409 }
      )
    }

    // Step 1: Detect face using Face++
    const faceDetection = await FacePPService.detectFace(image)
    
    if (!faceDetection.faces || faceDetection.faces.length === 0) {
      return NextResponse.json(
        { error: 'No face detected in image. Please ensure your face is clearly visible and try again.' },
        { status: 400 }
      )
    }

    if (faceDetection.faces.length > 1) {
      return NextResponse.json(
        { error: 'Multiple faces detected. Please ensure only one face is visible.' },
        { status: 400 }
      )
    }

    const face = faceDetection.faces[0]
    
    // Step 2: Check face quality
    const faceQuality = face.attributes?.facequality?.value || 0
    const blurLevel = face.attributes?.blur?.blurness?.value || 0
    
    if (faceQuality < 50) {
      return NextResponse.json(
        { error: 'Face quality too low. Please ensure good lighting and clear image.' },
        { status: 400 }
      )
    }

    if (blurLevel > 80) {
      return NextResponse.json(
        { error: 'Image is too blurry. Please take a clearer photo.' },
        { status: 400 }
      )
    }

    // Step 3: Extract face token and embedding
    const faceToken = face.face_token
    const faceEmbedding = JSON.stringify(face)

    // Step 4: Add face to FaceSet (for future recognition)
    const DEFAULT_FACESET_TOKEN = 'employee_faceset' // Use consistent FaceSet for all employees
    let facesetToken = DEFAULT_FACESET_TOKEN
    
    try {
      const faceSetResult = await FacePPService.addToFaceSet(faceToken, DEFAULT_FACESET_TOKEN)
      facesetToken = faceSetResult.faceset_token || DEFAULT_FACESET_TOKEN
    } catch (faceSetError: any) {
      // If adding to existing FaceSet fails, try creating a new one
      console.log('Adding to existing FaceSet failed, creating new one:', faceSetError.message)
      try {
        const newFaceSetResult = await FacePPService.addToFaceSet(faceToken)
        facesetToken = newFaceSetResult.faceset_token || DEFAULT_FACESET_TOKEN
      } catch (createError: any) {
        console.error('Failed to create FaceSet:', createError.message)
        // Continue with registration even if FaceSet fails
        facesetToken = DEFAULT_FACESET_TOKEN
      }
    }

    // Step 5: Create employee record
    const newEmployee = new Employee({
      employee_id,
      name,
      face_token: faceToken,
      face_embedding: faceEmbedding,
      faceset_token: facesetToken,
      face_quality: {
        value: faceQuality,
        blur_level: blurLevel
      }
    })

    await newEmployee.save()

    return NextResponse.json({
      success: true,
      message: 'Employee registered successfully',
      employee_id,
      name,
      face_quality: faceQuality,
      faceset_token: facesetToken
    })

  } catch (error: any) {
    console.error('Registration error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
