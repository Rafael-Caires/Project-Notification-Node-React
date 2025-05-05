// backend/src/models/user.model.ts
import mongoose, { Schema, Document } from 'mongoose';
import jwt from 'jsonwebtoken';

export interface IUser extends Document {
  email: string;
  password: string;
  tokens: { token: string }[];
  generateAuthToken(): Promise<string>;
}

const userSchema = new Schema<IUser>({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  tokens: [{ token: { type: String, required: true } }]
});

userSchema.methods.generateAuthToken = async function() {
  const token = jwt.sign({ userId: this._id }, process.env.JWT_SECRET!, { 
    expiresIn: '7d' 
  });
  
  this.tokens = this.tokens.concat({ token });
  await this.save();
  
  return token;
};

export const User = mongoose.model<IUser>('User', userSchema);