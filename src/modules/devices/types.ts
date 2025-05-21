export interface DeviceDTO {
  id: string;
  is_revoked: boolean;
  public_key: string;
  last_active: Date;
}
