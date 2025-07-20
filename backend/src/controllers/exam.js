const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const Exam = require('../models/Exam');

// @desc    Create new exam
// @route   POST /api/exams
// @access  Private/Teacher
exports.createExam = async (req, res) => {
  try {
    // Add teacher ID to exam
    req.body.teacher = req.user.id;
    
    console.log('Creating exam with data:', req.body);
    console.log('Teacher ID:', req.user.id);
    
    const exam = await Exam.create(req.body);
    
    console.log('Created exam:', exam);
    
    res.status(201).json({
      success: true,
      data: exam
    });
  } catch (error) {
    console.error('Create exam error:', error);

    // Handle validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        error: messages.join(', ')
      });
    }

    // Handle other errors
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

// @desc    Get all exams
// @route   GET /api/exams
// @access  Private
exports.getExams = async (req, res) => {
  try {
    let query;
    
    console.log('Getting exams for user:', req.user.id, 'with role:', req.user.role);
    console.log('User object:', req.user);
    
    // If user is a student, get all exams (both attempted and not attempted)
    if (req.user.role === 'student') {
      query = Exam.find()
        .select('title subject description duration questions submissions createdAt')
        .populate('teacher', 'name')
        .populate('submissions.student', 'name email');
    } else {
      // If user is a teacher, get only their exams
      query = Exam.find({ teacher: req.user.id })
        .populate('submissions.student', 'name email');
    }

    const exams = await query;
    console.log('Raw exams from database:', exams);
    console.log(`Found ${exams.length} exams for ${req.user.role}`);

    // If student, process submissions and include answer details for verified submissions
    if (req.user.role === 'student') {
      const processedExams = exams.map(exam => {
        const examObj = exam.toObject();
        console.log('Processing exam:', exam._id);
        const userSubmission = examObj.submissions.find(
          sub => sub.student && sub.student._id && sub.student._id.toString() === req.user.id
        );
        
        // Keep only the user's submission
        examObj.submissions = userSubmission ? [userSubmission] : [];
        
        // If submission exists and is verified, include only the score
        if (userSubmission && userSubmission.verified) {
          examObj.questions = examObj.questions.map((q, index) => {
            const answer = userSubmission.answers.find(a => a.questionIndex === index);
            return {
              text: q.text,
              options: q.options,
              selectedOption: answer ? answer.selectedOption : null
            };
          });
        } else {
          // If not verified or no submission, only show question text and options
          examObj.questions = examObj.questions.map(q => ({
            text: q.text,
            options: q.options
          }));
        }
        
        return examObj;
      });

      console.log('Sending processed exams to student:', processedExams);
      res.status(200).json({
        success: true,
        count: processedExams.length,
        data: processedExams
      });
    } else {
      // For teachers, show submissions with selected options but without correct/incorrect indicators
      const processedExams = exams.map(exam => {
        const examObj = exam.toObject();
        examObj.submissions = examObj.submissions.map(sub => ({
          ...sub,
          answers: sub.answers.map(ans => ({
            questionIndex: ans.questionIndex,
            selectedOption: ans.selectedOption
          }))
        }));
        return examObj;
      });

      console.log('Sending processed exams to teacher:', processedExams);
      res.status(200).json({
        success: true,
        count: processedExams.length,
        data: processedExams
      });
    }
  } catch (error) {
    console.error('Get exams error:', error);
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

// @desc    Get single exam
// @route   GET /api/exams/:id
// @access  Private
exports.getExam = async (req, res) => {
  try {
    const exam = await Exam.findById(req.params.id)
      .populate('teacher', 'name email')
      .populate('submissions.student', 'name email');

    if (!exam) {
      return res.status(404).json({
        success: false,
        error: 'Exam not found'
      });
    }

    // Convert to plain object
    const examObj = exam.toObject();

    // If user is a student, only include their own submission
    if (req.user.role === 'student') {
      examObj.submissions = examObj.submissions.filter(
        sub => sub.student && sub.student._id && sub.student._id.toString() === req.user.id
      );
    }

    res.status(200).json({
      success: true,
      data: examObj
    });
  } catch (error) {
    console.error('Get exam error:', error);
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

// @desc    Update exam
// @route   PUT /api/exams/:id
// @access  Private/Teacher
exports.updateExam = async (req, res) => {
  try {
    const exam = await Exam.findById(req.params.id);

    if (!exam) {
      return res.status(404).json({
        success: false,
        error: 'Exam not found'
      });
    }

    // Make sure user is exam owner
    if (exam.teacher.toString() !== req.user.id) {
      return res.status(401).json({
        success: false,
        error: 'Not authorized to update this exam'
      });
    }

    // Check if exam has submissions
    if (exam.submissions && exam.submissions.length > 0) {
      return res.status(400).json({
        success: false,
        error: 'Cannot update exam with existing submissions'
      });
    }

    const updatedExam = await Exam.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      data: updatedExam
    });
  } catch (error) {
    console.error('Update exam error:', error);
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

// @desc    Delete exam
// @route   DELETE /api/exams/:id
// @access  Private/Teacher
exports.deleteExam = async (req, res) => {
  try {
    const exam = await Exam.findById(req.params.id);

    if (!exam) {
      return res.status(404).json({
        success: false,
        error: 'Exam not found'
      });
    }

    // Make sure user is exam owner
    if (exam.teacher.toString() !== req.user.id) {
      return res.status(401).json({
        success: false,
        error: 'Not authorized to delete this exam'
      });
    }

    await Exam.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    console.error('Delete exam error:', error);
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

// @desc    Submit exam
// @route   POST /api/exams/:id/submit
// @access  Private/Student
exports.submitExam = async (req, res) => {
  try {
    const exam = await Exam.findById(req.params.id);

    if (!exam) {
      return res.status(404).json({
        success: false,
        error: 'Exam not found'
      });
    }

    // Check if student has already submitted
    const existingSubmission = exam.submissions.find(
      sub => sub.student.toString() === req.user.id
    );

    if (existingSubmission) {
      return res.status(400).json({
        success: false,
        error: 'You have already submitted this exam'
      });
    }

    // Process answers and mark correct/incorrect
    const processedAnswers = req.body.answers.map(answer => {
      const question = exam.questions[answer.questionIndex];
      const isCorrect = answer.selectedOption === question.correctOption;
      return {
        questionIndex: answer.questionIndex,
        selectedOption: answer.selectedOption,
        isCorrect: isCorrect
      };
    });

    // Calculate score
    const score = processedAnswers.reduce((total, answer) => {
      return total + (answer.isCorrect ? 1 : 0);
    }, 0);

    const finalScore = Math.round((score / exam.questions.length) * 100);

    // Create submission with processed answers
    exam.submissions.push({
      student: req.user.id,
      answers: processedAnswers,
      score: finalScore,
      submittedAt: Date.now()
    });

    await exam.save();

    res.status(200).json({
      success: true,
      data: {
        score: finalScore,
        answers: processedAnswers
      }
    });
  } catch (error) {
    console.error('Submit exam error:', error);
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

// @desc    Verify submission
// @route   PUT /api/exams/:id/verify/:submissionId
// @access  Private/Teacher
exports.verifySubmission = async (req, res) => {
  try {
    const exam = await Exam.findById(req.params.id);

    if (!exam) {
      return res.status(404).json({
        success: false,
        error: 'Exam not found'
      });
    }

    // Make sure user is exam owner
    if (exam.teacher.toString() !== req.user.id) {
      return res.status(401).json({
        success: false,
        error: 'Not authorized to verify submissions for this exam'
      });
    }

    // Find submission
    const submission = exam.submissions.id(req.params.submissionId);

    if (!submission) {
      return res.status(404).json({
        success: false,
        error: 'Submission not found'
      });
    }

    // Update submission
    submission.verified = true;
    submission.verifiedAt = Date.now();
    submission.verifiedBy = req.user.id;

    await exam.save();

    res.status(200).json({
      success: true,
      data: submission
    });
  } catch (error) {
    console.error('Verify submission error:', error);
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
}; 