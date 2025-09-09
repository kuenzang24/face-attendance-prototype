import axios from 'axios'

const FACEPP_API_KEY = process.env.FACEPP_API_KEY!
const FACEPP_API_SECRET = process.env.FACEPP_API_SECRET!
const FACEPP_BASE_URL = 'https://api-us.faceplusplus.com'

if (!FACEPP_API_KEY || !FACEPP_API_SECRET) {
  throw new Error('Please define Face++ API credentials in .env.local')
}

interface FacePPResponse {
  request_id?: string
  image_id?: string
  time_used?: number
  faces?: Array<{
    face_token: string
    face_rectangle: {
      top: number
      left: number
      width: number
      height: number
    }
    landmark?: any
    attributes?: {
      gender?: { value: string }
      age?: { value: number }
      emotion?: any
      facequality?: { value: number; threshold: number }
      blur?: { blurness: { value: number; threshold: number } }
    }
  }>
  face_token?: string
  confidence?: number
  thresholds?: object
  error_message?: string
  faceset_token?: string
  // For FaceSet search results
  results?: Array<{
    face_token: string
    confidence: number
  }>
}

class FacePPService {
  private apiKey: string
  private apiSecret: string
  private baseUrl: string

  constructor() {
    this.apiKey = FACEPP_API_KEY
    this.apiSecret = FACEPP_API_SECRET
    this.baseUrl = FACEPP_BASE_URL
  }

  async detectFace(imageBase64: string): Promise<FacePPResponse> {
    try {
      const formData = new FormData()
      formData.append('api_key', this.apiKey)
      formData.append('api_secret', this.apiSecret)
      formData.append('image_base64', imageBase64)
      formData.append('return_attributes', 'facequality,blur,emotion,age,gender')
      formData.append('return_landmark', '1') // Return 83-point landmarks

      const response = await axios.post(`${this.baseUrl}/facepp/v3/detect`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 30000 // 30 second timeout
      })

      // Check for API errors in response
      if (response.data.error_message) {
        throw new Error(response.data.error_message)
      }

      // Check if faces were detected
      if (!response.data.faces || response.data.faces.length === 0) {
        throw new Error('No faces detected in the image. Please ensure your face is clearly visible.')
      }

      return response.data
    } catch (error: any) {
      if (error.response?.data?.error_message) {
        throw new Error(`Face detection failed: ${error.response.data.error_message}`)
      } else if (error.code === 'ECONNABORTED') {
        throw new Error('Face detection failed: Request timeout. Please try again.')
      } else {
        throw new Error(`Face detection failed: ${error.message}`)
      }
    }
  }

  async addToFaceSet(faceToken: string, facesetToken?: string): Promise<FacePPResponse> {
    try {
      const formData = new FormData()
      formData.append('api_key', this.apiKey)
      formData.append('api_secret', this.apiSecret)
      formData.append('face_tokens', faceToken)
      
      // If no faceset_token provided, create a new FaceSet
      if (facesetToken) {
        formData.append('faceset_token', facesetToken)
      } else {
        formData.append('display_name', 'Employee_FaceSet')
      }

      const endpoint = facesetToken ? 'addface' : 'create'
      const response = await axios.post(`${this.baseUrl}/facepp/v3/faceset/${endpoint}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 30000
      })

      if (response.data.error_message) {
        throw new Error(response.data.error_message)
      }

      return response.data
    } catch (error: any) {
      if (error.response?.data?.error_message) {
        throw new Error(`FaceSet operation failed: ${error.response.data.error_message}`)
      } else {
        throw new Error(`FaceSet operation failed: ${error.message}`)
      }
    }
  }

  async compareFaces(faceToken1: string, faceToken2: string): Promise<FacePPResponse> {
    try {
      const formData = new FormData()
      formData.append('api_key', this.apiKey)
      formData.append('api_secret', this.apiSecret)
      formData.append('face_token1', faceToken1)
      formData.append('face_token2', faceToken2)

      const response = await axios.post(`${this.baseUrl}/facepp/v3/compare`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 30000
      })

      if (response.data.error_message) {
        throw new Error(response.data.error_message)
      }

      return response.data
    } catch (error: any) {
      if (error.response?.data?.error_message) {
        throw new Error(`Face comparison failed: ${error.response.data.error_message}`)
      } else {
        throw new Error(`Face comparison failed: ${error.message}`)
      }
    }
  }

  async searchFaceInFaceSet(faceToken: string, facesetToken: string): Promise<FacePPResponse> {
    try {
      const formData = new FormData()
      formData.append('api_key', this.apiKey)
      formData.append('api_secret', this.apiSecret)
      formData.append('face_token', faceToken)
      formData.append('faceset_token', facesetToken)

      const response = await axios.post(`${this.baseUrl}/facepp/v3/search`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 30000
      })

      if (response.data.error_message) {
        throw new Error(response.data.error_message)
      }

      return response.data
    } catch (error: any) {
      if (error.response?.data?.error_message) {
        throw new Error(`Face search failed: ${error.response.data.error_message}`)
      } else {
        throw new Error(`Face search failed: ${error.message}`)
      }
    }
  }
}

export default new FacePPService()
