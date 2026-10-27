require('dotenv').config();
const mongoose = require('mongoose');
const { Schema } = mongoose;

const MONGO_URI = process.env.MONGO_URI;

mongoose.connect(MONGO_URI)
  .then(() => console.log('Connected to MongoDB successfully!'))
  .catch(err => console.error('Connection error:', err));

const studentSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  courses: [{ type: Schema.Types.ObjectId, ref: 'Course' }]
});

const courseSchema = new Schema({
  title: { type: String, required: true },
  maxStudents: { type: Number, required: true },
  availableSlots: { type: Number, required: true, min: [0, 'availableSlots cannot be negative'] },
  students: [{ type: Schema.Types.ObjectId, ref: 'Student' }]
});

const Course = mongoose.model('Course', courseSchema);
const Student = mongoose.model('Student', studentSchema);

async function enrollCourse(studentId, courseId) {
  let slotReserved = false;
  try {
    const student = await Student.findById(studentId);
    const course = await Course.findById(courseId);

    if (!student || !course) {
      console.log('Error: Student or Course not found!');
      return;
    }

    const isEnrolled = student.courses.some(id => id.equals(courseId));
    if (isEnrolled) {
      console.log(`[CHECK 1 FAILED] Student "${student.name}" is ALREADY enrolled in "${course.title}"!`);
      return;
    }

    if (course.availableSlots <= 0) {
      console.log(`[CHECK 2 FAILED] Course "${course.title}" is FULL! (availableSlots = 0)`);
      return;
    }

    const updatedCourse = await Course.findOneAndUpdate(
      { _id: courseId, availableSlots: { $gt: 0 }, students: { $ne: studentId } },
      { $addToSet: { students: studentId }, $inc: { availableSlots: -1 } },
      { returnDocument: 'after' }
    );

    if (!updatedCourse) {
      console.log(`[CHECK FAILED] Course "${course.title}" just became FULL or the student was just enrolled!`);
      return;
    }
    slotReserved = true;

    await Student.updateOne({ _id: studentId }, { $addToSet: { courses: courseId } });

    console.log(`[ENROLL SUCCESS] "${student.name}" enrolled in "${course.title}". Slots left: ${updatedCourse.availableSlots}`);
  } catch (error) {
    if (slotReserved) {
      // Undo the course update if the student update failed
      await Course.updateOne({ _id: courseId }, { $pull: { students: studentId }, $inc: { availableSlots: 1 } });
    }
    console.error('Error in enrollCourse:', error.message);
  }
}

async function dropCourse(studentId, courseId) {
  let courseUpdated = false;
  try {
    const student = await Student.findById(studentId);
    const course = await Course.findById(courseId);

    if (!student || !course) {
      console.log('Error: Student or Course not found!');
      return;
    }

    const isEnrolled = student.courses.some(id => id.equals(courseId));
    if (!isEnrolled) {
      console.log(`Warning: Student "${student.name}" is NOT enrolled in "${course.title}"!`);
      return;
    }

    const updatedCourse = await Course.findOneAndUpdate(
      { _id: courseId, students: studentId },
      { $pull: { students: studentId }, $inc: { availableSlots: 1 } },
      { returnDocument: 'after' }
    );

    if (!updatedCourse) {
      console.log(`Warning: Student "${student.name}" is NOT enrolled in "${course.title}"!`);
      return;
    }
    courseUpdated = true;

    await Student.updateOne({ _id: studentId }, { $pull: { courses: courseId } });

    console.log(`[DROP SUCCESS] "${student.name}" dropped "${course.title}". Slots left: ${updatedCourse.availableSlots}`);
  } catch (error) {
    if (courseUpdated) {
      await Course.updateOne({ _id: courseId }, { $addToSet: { students: studentId }, $inc: { availableSlots: -1 } });
    }
    console.error('Error in dropCourse:', error.message);
  }
}

async function seedCourse(title, maxStudents) {
  return Course.findOneAndUpdate(
    { title },
    { $set: { maxStudents, availableSlots: maxStudents, students: [] } },
    { upsert: true, returnDocument: 'after' }
  );
}

async function seedStudent(name, email) {
  return Student.findOneAndUpdate(
    { email },
    { $set: { name, courses: [] } },
    { upsert: true, returnDocument: 'after' }
  );
}

async function main() {
  const courseNode = await seedCourse('Node.js & MongoDB', 2);
  const courseReact = await seedCourse('React & Frontend', 1);
  const courseJava = await seedCourse('Java Data Structures & Algorithms', 3);

  const studentAn = await seedStudent('Nguyen Van An', 'an.nguyen@example.com');
  const studentBinh = await seedStudent('Tran Thi Binh', 'binh.tran@example.com');
  const studentCuong = await seedStudent('Le Van Cuong', 'cuong.le@example.com');

  console.log('--- TEST 1: VALID ENROLL---');
  await enrollCourse(studentAn._id, courseNode._id);
  await enrollCourse(studentAn._id, courseReact._id);

  console.log('\n--- TEST 2: DUPLICATE ENROLLMENT CHECK ---');
  await enrollCourse(studentAn._id, courseNode._id);

  console.log('\n--- TEST 3: UNAVAILABLE SLOT ---');
  await enrollCourse(studentBinh._id, courseReact._id);

  console.log('\n--- TEST 4: DROP UNENROLLED COURSE CHECK (Binh tries to drop React without enrolling) ---');
  await dropCourse(studentBinh._id, courseReact._id);

  console.log('\n--- TEST 5: VALID DROP COURSE (An drops React -> Return 1 slot) ---');
  await dropCourse(studentAn._id, courseReact._id);

  await mongoose.connection.close();
}

main();