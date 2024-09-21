import mongoose, { Document, Schema } from "mongoose";

interface IEmailTemplateDocument extends Document {
  name: string;
  subject: string;
  body: string;
  variables: string[];
}
  
const emailTemplateSchema = new Schema<IEmailTemplateDocument>({
  name: { type: String, required: true, unique: true },
  subject: { type: String, required: true },
  body: { type: String, required: true },
  variables: [{ type: String }],
});

export default mongoose.model<IEmailTemplateDocument>('EmailTemplate', emailTemplateSchema);