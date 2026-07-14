import mongoose from "mongoose";

const I18nString = {
  mn: { type: String, default: "" },
  en: { type: String, default: "" },
  de: { type: String, default: "" },
};

const ApplicationQuestionSchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    label: I18nString,
    type: {
      type: String,
      enum: ["text", "textarea", "number", "select", "email", "phone"],
      default: "text",
    },
    required: { type: Boolean, default: false },
    options: { type: [String], default: [] },
    placeholder: I18nString,
    order: { type: Number, default: 0 },
  },
  { _id: false }
);

const ProgramSchema = new mongoose.Schema(
  {
    code: { type: String, required: true, unique: true, uppercase: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    emoji: { type: String, default: "🌍" },
    color: { type: String, default: "#C41E3A" },
    gradFrom: { type: String, default: "#C41E3A" },
    gradTo: { type: String, default: "#3b82f6" },
    name: I18nString,
    description: I18nString,
    why: I18nString,
    href: { type: String, required: true },
    duration: { type: String, default: "" },
    location: { type: String, default: "" },
    slots: { type: Number, default: 10 },
    tags: { type: [String], default: [] },
    features: {
      type: [{ mn: String, en: String }],
      default: [],
    },
    order: { type: Number, default: 0, index: true },
    active: { type: Boolean, default: true, index: true },
    applicationQuestions: { type: [ApplicationQuestionSchema], default: [] },
  },
  { timestamps: true }
);

const Program = mongoose.models.Program || mongoose.model("Program", ProgramSchema);
export default Program;
