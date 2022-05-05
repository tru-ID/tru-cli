export interface IProjectConfiguration {
  project_id: string
  name: string
  created_at: string
  credentials: Credential[]
  data_residency?: string
}

export default interface Credential {
  client_id: string
  client_secret: string
  scopes: Array<string>
}
