export interface IUser {
  user_id: string;
  full_name: string;
  email: string;
  password: string | null;
  type: string;
  location: string | null;
  imageKey: string | null;
  imageUrl: string | null;
  is_verified: boolean;
}
