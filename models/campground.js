const mongoose = require("mongoose");
const comments = require("./comment");

const campgroundSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: "Campground name cannot be blank",
    },
    slug: {
      type: String,
      lowercase: true,
      trim: true,
      unique: true,
    },
    image: {
      secure_url: {
        type: String,
        default: "/images/campDefault.jpg",
      },
      public_id: String,
    },
    description: {
      type: String,
      trim: true,
      required: "Description cannot be blank",
    },
    author: {
      id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
      username: String,
    },
    comments: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Comment",
      },
    ],
  },
  { timestamps: true }
);

// add a slug before the campground gets saved to the database
campgroundSchema.pre("save", async function (next) {
  try {
    // check if a new campground is being saved, or if the campground name is being modified
    if (this.isNew || this.isModified("name")) {
      this.slug = await generateUniqueSlug(this._id, this.name);
    }
    next();
  } catch (err) {
    next(err);
  }
});

campgroundSchema.pre("findOne", function (next) {
  this.populate({
    path: "comments",
    options: {
      sort: "-_id",
    },
  });
  next();
});

campgroundSchema.index({
  name: "text",
});

async function generateUniqueSlug(id, campgroundName, slug) {
  try {
    // generate the initial slug
    if (!slug) {
      slug = slugify(campgroundName);
    }
    // check if a campground with the slug already exists
    const campground = await Campground.findOne({ slug: slug });
    // check if a campground was found or if the found campground is the current campground
    if (!campground || campground._id.equals(id)) {
      return slug;
    }
    // if not unique, generate a new slug
    const newSlug = slugify(campgroundName);
    // check again by calling the function recursively
    return await generateUniqueSlug(id, campgroundName, newSlug);
  } catch (err) {
    throw new Error(err);
  }
}

function slugify(text) {
  const slug = text
    .toString()
    .toLowerCase()
    .replace(/\s+/g, "-") // Replace spaces with -
    .replace(/[^\w\-]+/g, "") // Remove all non-word chars
    .replace(/\-\-+/g, "-") // Replace multiple - with single -
    .replace(/^-+/, "") // Trim - from start of text
    .replace(/-+$/, "") // Trim - from end of text
    .substring(0, 75); // Trim at 75 characters
  return slug + "-" + Math.floor(1000 + Math.random() * 9000); // Add 4 random digits to improve uniqueness
}

const Campground = mongoose.model("Campground", campgroundSchema);

module.exports = Campground;
