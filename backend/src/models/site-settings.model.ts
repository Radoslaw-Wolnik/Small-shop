import mongoose, { Schema } from "mongoose";

// SiteSettings model for global SEO settings
export interface ISiteSettingsDocument extends Document {
    siteName: string;
    siteDescription: string;
    siteKeywords: string[];
    socialMediaLinks: {
      facebook?: string;
      twitter?: string;
      instagram?: string;
    };
    logoUrl: string;
  }
  
  const siteSettingsSchema = new Schema<ISiteSettingsDocument>({
    siteName: { type: String, required: true },
    siteDescription: { type: String, required: true },
    siteKeywords: [{ type: String }],
    socialMediaLinks: {
      facebook: String,
      twitter: String,
      instagram: String,
    },
    logoUrl: String,
  });
  
  export default mongoose.model<ISiteSettingsDocument>('SiteSettings', siteSettingsSchema);
  