import { NextRequest, NextResponse } from 'next/server'
import connectToDatabase from '@/lib/mongodb'
import Employee from '@/models/Employee'
import ClockLog from '@/models/ClockLog'
import FacePPService from '@/lib/facepp'

export async function POST(req: NextRequest) {
  try {
    // Connect to database
    await connectToDatabase()

    // Parse request body
    const { image } = await req.json()

    if (!image) {
      return NextResponse.json(
        { error: 'Image is required' },
        { status: 400 }
      )
    }

    // Step 1: Detect face in the image
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

    const detectedFace = faceDetection.faces[0]
    const detectedFaceToken = detectedFace.face_token
    
    // Check face quality
    const faceQuality = detectedFace.attributes?.facequality?.value || 0
    
    if (faceQuality < 40) {
      return NextResponse.json(
        { error: 'Face quality too low for recognition. Please ensure good lighting and clear image.' },
        { status: 400 }
      )
    }

    // Step 2: Search for face in FaceSet (use default FaceSet for all employees)
    const DEFAULT_FACESET_TOKEN = 'employee_faceset' // We'll use a consistent FaceSet for all employees
    
    let employee = null
    let matchConfidence = 0
    
    try {
      const searchResult = await FacePPService.searchFaceInFaceSet(detectedFaceToken, DEFAULT_FACESET_TOKEN)
      
      if (!searchResult.results || searchResult.results.length === 0) {
        // Log failed recognition attempt
        const failedLog = new ClockLog({
          employee_id: null,
          timestamp: new Date(),
          recognition: { 
            confidence: 0,
            similarity_score: 0,
            face_token: detectedFaceToken
          },
          status: 'failed_recognition'
        })
        await failedLog.save()

        return NextResponse.json(
          { error: 'Employee not recognized. Please ensure you are registered and try again.' },
          { status: 404 }
        )
      }

      // Step 3: Get best match from FaceSet search
      const bestMatch = searchResult.results[0]
      matchConfidence = bestMatch.confidence || 0
      const RECOGNITION_THRESHOLD = 80 // Face++ uses 0-100 scale
      
      if (matchConfidence < RECOGNITION_THRESHOLD) {
        // Log failed recognition attempt
        const failedLog = new ClockLog({
          employee_id: null,
          timestamp: new Date(),
          recognition: { 
            confidence: matchConfidence,
            similarity_score: matchConfidence,
            face_token: detectedFaceToken
          },
          status: 'failed_recognition'
        })
        await failedLog.save()

        return NextResponse.json(
          { error: 'Face recognition confidence too low. Please try again.' },
          { status: 404 }
        )
      }

      // Step 4: Find employee by face token
      employee = await Employee.findOne({ face_token: bestMatch.face_token })
      
      if (!employee) {
        return NextResponse.json(
          { error: 'Employee data not found. Please contact administrator.' },
          { status: 404 }
        )
      }
    } catch (searchError: any) {
      // If FaceSet search fails, fall back to individual face comparison
      console.log('FaceSet search failed, falling back to individual comparison:', searchError.message)
      
      // Fallback: Compare against all registered employees individually
      const employees = await Employee.find({})
      let bestMatch = null
      let bestSimilarity = 0

      for (const emp of employees) {
        try {
          const comparison = await FacePPService.compareFaces(
            detectedFaceToken,
            emp.face_token
          )

          if (comparison.confidence && comparison.confidence > bestSimilarity) {
            bestSimilarity = comparison.confidence
            bestMatch = emp
          }
        } catch (error) {
          console.error(`Error comparing with employee ${emp.employee_id}:`, error)
        }
      }

      const RECOGNITION_THRESHOLD = 80
      
      if (!bestMatch || bestSimilarity < RECOGNITION_THRESHOLD) {
        // Log failed recognition attempt
        const failedLog = new ClockLog({
          employee_id: null,
          timestamp: new Date(),
          recognition: { 
            confidence: bestSimilarity,
            similarity_score: bestSimilarity,
            face_token: detectedFaceToken
          },
          status: 'failed_recognition'
        })
        await failedLog.save()

        return NextResponse.json(
          { error: 'Employee not recognized. Please ensure you are registered and try again.' },
          { status: 404 }
        )
      }

      // Use fallback match
      employee = bestMatch
      matchConfidence = bestSimilarity
    }

    // Step 5: Log successful clock-in
    const successLog = new ClockLog({
      employee_id: employee._id,
      timestamp: new Date(),
      recognition: {
        confidence: matchConfidence,
        similarity_score: matchConfidence,
        face_token: detectedFaceToken
      },
      status: 'success'
    })
    await successLog.save()

    return NextResponse.json({
      success: true,
      message: 'Clock-in successful',
      employee_id: employee.employee_id,
      employee_name: employee.name,
      recognition_confidence: matchConfidence,
      face_quality: faceQuality,
      timestamp: new Date().toISOString()
    })

  } catch (error: any) {
    console.error('Clock-in error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
