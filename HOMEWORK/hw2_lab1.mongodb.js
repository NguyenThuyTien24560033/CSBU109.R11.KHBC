use ('blog_db');


if (db.posts.countDocuments() === 0){
  db.posts.insertMany([
  {
    title: "Getting Started with Node.js and Express",
    category: "Tech",
    views: 150,
    author: {
      name: "Alice Johnson",
      email: "alice@example.com"
    },
    tags: ["nodejs", "express", "backend"],
    comments: [
      {
        user: "Bob",
        content: "Great article!",
        created_at: new Date("2026-10-01T10:00:00Z")
      },
      {
        user: "Charlie",
        content: "Very helpful, thanks!",
        created_at: new Date("2026-10-02T11:30:00Z")
      }
    ]
  },
  {
    title: "MongoDB Schema Design Best Practices",
    category: "Tech",
    views: 85,
    author: {
      name: "Bob Smith",
      email: "bob@example.com"
    },
    tags: ["mongodb", "nosql", "database"],
    comments: [
      {
        user: "Alice",
        content: "NoSQL is awesome!",
        created_at: new Date("2026-10-03T09:15:00Z")
      }
    ]
  },
  {
    title: "10 Tips for Healthy Remote Work",
    category: "Life",
    views: 200,
    author: {
      name: "Carol White",
      email: "carol@example.com"
    },
    tags: ["lifestyle", "productivity", "health"],
    comments: [
      {
        user: "Dave",
        content: "Tip #3 changed my daily routine.",
        created_at: new Date("2026-10-04T14:20:00Z")
      }
    ]
  },
  {
    title: "Building REST APIs with Node.js and MongoDB",
    category: "Tech",
    views: 320,
    author: {
      name: "Alice Johnson",
      email: "alice@example.com"
    },
    tags: ["nodejs", "mongodb", "api"],
    comments: []
  }
]);
};


db.posts.find({
  category: "Tech",
  views: { $gte: 100 }
});

db.posts.find({
  tags: "nodejs"
});

db.posts.updateOne(
  {title: "Building REST APIs with Node.js and MongoDB"},

  {
    $push: {
        comments: {
        user: "David",
        content: "Awesome guide, thanks for sharing!",
        created_at: new Date()
      }
    },

    $inc: {views: 1}
  }
);

db.posts.find({ title: "Building REST APIs with Node.js and MongoDB" });


db.posts.aggregate([
  {
    $group: {
      _id: "$category",
      totalViews: {$sum: "$views"},
      totalPosts: {$sum: 1}
    }
  }

]);