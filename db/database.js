const connectDB = require("./DBConnect");

let client = connectDB()
const categories = [
  "Brands",
  "C",
  "C++",
  "Countries",
  "Entertainment",
  "Flutter",
  "Government",
  "Movies",
  "Law",
  "Locations",
  "Lifestyle",
  "Medicine",
  "Memes",
  "Music",
  "Politics",
  "Social services",
  "Sports",
  "Technology",
  "Travel",
  "World News",
];

const getUserDetail = async (email_id) => {
  try {
    const result = await client.query(
      "SELECT * FROM users WHERE email_id = $1",
      [email_id]
    );
    var row = result.rows[0];
    return row;
  } catch (e) {
    console.log("catch ", e.stack);
    return null;
  }
};

const getBlogComments = async (blog_id) => {
  let result;
  try {
    result = await client.query(
      "SELECT email_id, comment, date FROM comments WHERE blog_id = $1",
      [blog_id]
    );
  } catch (err) {
    console.log(err.stack);
  }
  return result.rows;
};

const putCommentOnBlog = async (blog_id, email_id, comment) => {
  let result;
  try {
    result = await client.query(
      "INSERT INTO comments(email_id, blog_id, comment, date) VALUES($1,$2,$3,$4)",
      [email_id, blog_id, comment, new Date()]
    );
  } catch (err) {
    console.log(err.stack);
  }
};

const checkUser = async (email_id, password) => {
  let result
  try {
    let query_res = await client.query(
      "SELECT email_id,username,password,interests FROM users WHERE email_id = $1",
      [email_id]
    )
    if(query_res.rows.length === 0){
      result = null
    }else if (query_res.rows[0]["password"].toString() === password.toString()){
      result = query_res.rows[0]
      delete result['password']
    }else{
      result = null;
    }
  } catch (e) {
    console.log(e.stack);
  }
  return result;
};

const getBlogById = async (blog_id) => {
  try {
    var result = await client.query("SELECT * FROM blogs WHERE blog_id = $1", [
      blog_id,
    ]);
    if (result.rows[0]["visibility"] === 0) return result.rows[0];
    return null;
  } catch (e) {
    console.log(e.stack);
    return null;
  }
};

const getBlogByTitle = async (title) => {
  try {
    var result = await client.query("SELECT * FROM blogs WHERE title LIKE $1", [
      "%" + title + "%",
    ]);
    const visibleBlogs = result.rows.filter((blog) => blog["visibility"] == 0);
    return visibleBlogs;
  } catch (e) {
    console.log(e.stack);
    return null;
  }
};

const getBlogByEmail = async (email_id) => {
  try {
    var result = await client.query("SELECT * FROM blogs WHERE email_id = $1", [
      email_id,
    ]);
    const visibleBlogs = result.rows.filter((blog) => blog["visibility"] == 0);
    return visibleBlogs;
  } catch (e) {
    console.log(e.stack);
    return null;
  }
};

const signUp = async (
  email_id,
  username,
  name,
  dob,
  gender,
  country,
  interests,
  password
) => {
  var resultMsg = { error: "", credentialError: [], success: false };
  try {
    client.connect();
    var errorHappened = false;
    // check email
    const emailCheck = await client.query(
      "SELECT count(*) as count FROM users WHERE email_id = $1",
      [email_id]
    );
    if (Number(emailCheck.rows[0]["count"]) > 0) {
      resultMsg["credentialError"].push("Email id already exists");
      errorHappened = true;
    }

    // check username
    const usernameCheck = await client.query(
      "SELECT count(*) as count FROM users WHERE username = $1",
      [username]
    );
    if (Number(usernameCheck.rows[0]["count"]) > 0) {
      resultMsg["credentialError"].push("Username already exists");
      errorHappened = true;
    }

    // inserting into table if no error happened
    if (!errorHappened) {
      await client.query("INSERT INTO users VALUES($1,$2,$3,$4,$5,$6,$7,$8)", [
        email_id,
        username,
        name,
        dob,
        gender,
        country,
        interests,
        password,
      ]);
      resultMsg["success"] = true;
    }
  } catch (e) {
    console.log(e.stack);
    resultMsg["error"] = "error signin up. Try after some time."; // says about error or email_id exists
  }

  return resultMsg;
};

const createBlog = async (
  title,
  visibility,
  content,
  categories,
  email_id,
  subject
) => {
  try {
    await client.query(
      "INSERT INTO blogs(title, date, visibility, context, categories, email_id, subject) VALUES ($1, $2, $3, $4, $5, $6, $7)",
      [title, new Date(), visibility, content, categories, email_id, subject]
    );

    return true;
  } catch (e) {
    console.log(e.stack);
    return false; // failure
  }
};

const followUser = async (follower, following) => {
  try {
    await client.query("INSERT INTO followers VALUES ($1, $2)", [
      follower,
      following,
    ]);

    return true;
  } catch (e) {
    console.log(e.stack);
    return false;
  }
};

const getFollowingCount = async (email_id) => {
  try {
    const res = await client.query(
      "SELECT * FROM followers where follower_email = $1",
      [email_id]
    );

    return res.rows.length;
  } catch (e) {
    console.log(e.stack);
    return -1;
  }
};

const getFollowerCount = async (email_id) => {
  try {
    const res = await client.query(
      "SELECT * FROM followers where following_email = $1",
      [email_id]
    );

    return res.rows.length;
  } catch (e) {
    console.log(e.stack);
    return -1;
  }
};

const LikeBlog = async (email_id, blog_id) => {
  try {
    await client.query("INSERT INTO bloglikes VALUES ($1, $2)", [
      email_id,
      blog_id,
    ]);

    return true;
  } catch (e) {
    console.log(e.stack);
    return false;
  }
};

const isLikedBlog = async (email_id, blog_id) => {
  try {
    const res = await client.query(
      "SELECT COUNT(*) as count FROM bloglikes WHERE email_id=$1 AND blog_id=$2",
      [email_id, blog_id]
    );

    return res.rows[0]["count"] > 0;
  } catch (e) {
    console.log(e.stack);
    return false;
  }
};

const removeBlogLike = async (email_id, blog_id) => {
  try {
    const res = await client.query(
      "DELETE FROM bloglikes WHERE email_id=$1 AND blog_id=$2",
      [email_id, blog_id]
    );

    return true;
  } catch (e) {
    console.log(e.stack);
    return false;
  }
};

const getBlogLikeCount = async (blog_id) => {
  try {
    const res = await client.query(
      "SELECT COUNT(*) as count FROM bloglikes WHERE blog_id = $1",
      [blog_id]
    );

    return res.rows[0]["count"];
  } catch (e) {
    console.log(e.stack);
    return 0;
  }
};

const addBlogView = async (email_id, blog_id, date = new Date()) => {
  try {
    await client.query("INSERT INTO blogviews VALUES ($1,$2,$3)", [
      email_id,
      blog_id,
      date,
    ]);

    return true;
  } catch (e) {
    console.log(e.stack);
    return false;
  }
};

const getBlogCategories = async () => {
  try {
    const res = await client.query("SELECT blog_id, categories FROM blogs");

    return res.rows;
  } catch (e) {
    console.log(e.stack);
    return -1;
  }
};

const getUserInterests = async () => {
  try {
    const res = await client.query("SELECT email_id, interests FROM users");

    return res.rows;
  } catch (e) {
    console.log(e.stack);
    return -1;
  }
};

const getBlogCount = async (email_id) => {
  try {
    const res = await client.query(
      "SELECT COUNT(*) as count FROM blogs WHERE email_id = $1",
      [email_id]
    );

    //console.log("count", res.rows);
    return res.rows[0]["count"];
  } catch (e) {
    console.log(e.stack);
    return -1;
  }
};

const isFollowing = async (email_id, following_email) => {
  try {
    const res = await client.query(
      "SELECT COUNT(*) AS count FROM followers WHERE follower_email = $1 AND following_email = $2",
      [email_id, following_email]
    );

    return res.rows[0]["count"];
  } catch (e) {
    console.log(e.stack);
    return -1;
  }
};

// call it during login and logout
const updateTracking = async (email_id) => {
  try {
    // check if the log already present for the day
    const now = new Date();
    const dateCheck = await client.query(
      "SELECT * FROM tracking WHERE email_id = $1 AND date = $2",
      [email_id, now]
    );
    if (dateCheck.rows.length == 1) {
      // log already present
      const milliseconds = now - dateCheck.rows[0].last_time;
      const hours = milliseconds / 36e5 + dateCheck.rows[0].hours_used;
      await client.query(
        "UPDATE tracking SET last_time = $1, hours_used = $2 WHERE email_id = $3 AND date = $4",
        [now, hours, email_id, now]
      );
    } else {
      // create new log
      await client.query("INSERT INTO tracking VALUES ($1,$2,$3,$4)", [
        email_id,
        now,
        0,
        now,
      ]);
    }

    return true;
  } catch (e) {
    console.log(e.stack);
    return false;
  }
};

const getTracking = async (email_id, days) => {
  try {
    const res = await client.query(
      "SELECT date, hours_used FROM tracking WHERE email_id = $1",
      [email_id]
    );

    var result = res.rows;
    if (res.rows.length > days) {
      result = [];
      for (var i = 0; i < days; ++i) result.push(res.rows[i]);
    }
    return result;
  } catch (e) {
    console.log(e.stack);
    return [];
  }
};

module.exports = {
  checkUser,
  getUserDetail,
  getBlogById,
  getBlogByTitle,
  getBlogByEmail,
  signUp,
  getFollowerCount,
  getFollowingCount,
  followUser,
  createBlog,
  LikeBlog,
  isLikedBlog,
  removeBlogLike,
  getBlogLikeCount,
  addBlogView,
  getBlogCategories,
  getUserInterests,
  getBlogCount,
  isFollowing,
  updateTracking,
  getTracking,
  getBlogComments,
  putCommentOnBlog,
  categories,
};