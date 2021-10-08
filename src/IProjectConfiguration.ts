import IAPICredentials from './api/IAPICredentails'

export interface IProjectConfiguration {
  project_id: string
  name: string
  created_at: string
  updated_at: string
  credentials: IAPICredentials[]
}
