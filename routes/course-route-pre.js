const router = require("express").Router();
const Course = require("../models/course-model");
const courseValidation = require("../validation").courseValidation;


router.use((req, res, next) => {
  console.log("A request is coming into course-route...");
  console.log(req.body);
  next();
});
// router.get("/test", (req, res) => {
//   const msgObj = {
//       message: "Course test API is working.",
//   };
//   return res.json(msgObj);
//   });

router.get("/", (req, res) => {
  Course.find({}).populate("instructor")
  .then((course) => {
    res.send(course);
  }).catch(() => {
    res.status(500).send("Cannot get course!!")
  })
})

router.get("/:_id", (req, res) => {
  let { _id } = req.params;
  Course.findOne({ _id }).populate("instructor", ["email"])
  .then((course) => {
    res.send(course);
  }).catch((e) => {
    res.send(e);
  })
})

router.patch("/:_id", async (req, res) => {
  // validate the inputs before making a new course
  
  const { error } = courseValidation(req.body);
  if (error) {
    return res.status(400).send(error.details[0].message);
  }
  let { _id } = req.params;
  console.log({_id});
  let course = await Course.findOne( {_id });
  console.log("course: " + course);
  if(!course){
    res.status(400);
    return res.json({
      success: false,
      message: "Course not found."
    })
  }

  if(course.instructor.equals(req.user._id) || req.user.isAdmin()) {
    Course.findOneAndUpdate({ _id }, req.body, { 
      new: true,
      runValidators: true,
    }).then(() => {
      res.send("Course has been updated.");
    }).catch((e) => {
      res.status(400).send(e);
    })
  }else{
    res.status(403);
    return res.json({
      success: false,
      message: "You are not authorized to update this course."
    })
  }
});

router.post("/", async (req, res) => {
  // validate the inputs before making a new course
  const { error } = courseValidation(req.body);
  if (error) {
    return res.status(400).send(error.details[0].message);
  }
  let { title, description, price } = req.body;
  if (req.user.isStudent()) {
    return res.status(400).send("Only instructor can post a new course.");
  }

  let newCourse = new Course({
    //_id: req.user._id,
    title,
    description,
    price,
    instructor: req.user._id,
   
  });

  try {
    await newCourse.save();
    res.status(200).send("New course has been saved.");
  } catch (err) {
    console.log(err)
    res.status(400).send("Cannot save course.");
  }
});




module.exports = router;
