const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const url = require('url');
const bcrypt = require('bcrypt');
const { parse } = require('path');
const { create } = require('domain');
require('dotenv').config();
const axios = require('axios');
const { DateTime } = require('luxon');

const app =  express();
mongoose.connect(process.env.DB_URL);

app.set('view engine', 'ejs');
app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use(express.static("public"));
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: true,
  cookie: {
    maxAge: 3600000
  }
}));
//TIME
const updateTimeInterval = 5000; // Update every 5s
let time;
let date;
let philippineTime;

// Function to fetch and update the current time
async function updateCurrentTime() {
    try {
      // Make a request to a time API (e.g., WorldTimeAPI)
      const response = await axios.get('http://worldtimeapi.org/api/timezone/UTC');
  
      // Extract the current time in UTC
      const utcTime = response.data.utc_datetime;
  
      // Convert UTC time to your desired time zone (e.g., 'Asia/Manila')
      philippineTime = DateTime.fromISO(utcTime, { zone: 'Asia/Manila' });
  
      // Separate time and date
      time = philippineTime.toFormat('HH:mm:ss');
      date = philippineTime.toFormat('MMMM d, yyyy');
  
      // Do something with the updated time and date
    } catch (error) {
      //console.error('Error updating time:', error.message);
    }
  }

// Schedule the time update at intervals
setInterval(updateCurrentTime, updateTimeInterval);

// Initial time update
updateCurrentTime();

// SCHEMAS
//User details schema
const loginsSchema = new mongoose.Schema({
    username: String,
    password: String,
    accessType: String,
    
    studentYearLevel: Number,
    studentCurriculum: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'curriculums'
    },
    studentType: String,
    studentCollege: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'colleges'
    },
    studentDegree: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'degrees'
    },

    facultyPrefix: String,
    facultyCollege: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'colleges'
    },
    facultyDepartment: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'degrees'
    },
    facultyPosition: String,

    suffix: String,
    firstName: String,
    lastName: String,
    middleInitial: String,

    lightMode: Boolean
});
const SpeckerLogins = mongoose.model('logins', loginsSchema);

//Colleges schema
const collegesSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    abbreviation: {
        type: String,
        required: true,
        unique: true
    }
});
const SpeckerColleges = mongoose.model('colleges', collegesSchema);

// Degrees schema
const degreesSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    abbreviation: {
        type: String,
        required: true,
        unique: true
    },
    college: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'colleges',
        required: true
    }
});
const SpeckerDegrees = mongoose.model('degrees', degreesSchema);

//Subjects schema
const subjectsSchema = new mongoose.Schema({
    code: {
        type: String,
        required: true,
        unique: true
    },
    name: {
        type: String,
        required: true,
        unique: true
    },
    units: {
        type: Number,
        required: true
    },
    preRequisite: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'subjects'
    }],
    coRequisite: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'subjects'
    }],
    category: {
        type: String,
        required: true
    },
    college: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'colleges',
    },
    sem1: Boolean,
    sem2: Boolean,
    summer: Boolean,
    includeInGWA: Boolean,
    yearStanding: Number
});
const SpeckerSubjects = mongoose.model('subjects', subjectsSchema);

//Curriculum schema
const curriculumSchema = new mongoose.Schema({
    degree: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'degrees',
        required: true
    },
    year: {
        type: String,
        required: true
    },
    years: [{
        yearLevel: {
            type: Number,
            required: true
        },
        semesters: [{
            subjects: [{
                type: mongoose.Schema.Types.ObjectId,
                ref: 'subjects'
            }],
            units: {
                type: Number,
                required: true
            }
        }]
    }]
  });
const SpeckerCurriculums = mongoose.model('curriculums', curriculumSchema);

const checklistsSchema = new mongoose.Schema({
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'logins',
        required: true
    },
    years: [{
        yearLevel: Number,
        semesters: [{
            subjects: [{
                subject: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'subjects'
                },
                grade: String,
                yearTaken: String,
                semesterTaken: String,
                schoolAttended: String,
                approved: Boolean,
                rejected: Boolean,
                pending: Boolean
            }],
            units: Number,
        }]
    }]
});
const SpeckerChecklists = mongoose.model('checklists', checklistsSchema);

//Study Plan schema
const studyPlanSchema = new mongoose.Schema({
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'logins',
        required: true
    },
    currentYear: Number,
    currentSemester: String,
    years: [{
        yearLevel: Number,
        semesters: [{
            subjects: [{    
                type: mongoose.Schema.Types.ObjectId,
                ref: 'subjects'
            }],
            units: Number,
        }]
    }],
    approvalDate: String,
    approvedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'logins'
    },
    approved: Boolean,
    rejected: Boolean,
    pending: Boolean
});
const SpeckerStudyPlans = mongoose.model('studyplans', studyPlanSchema);

//Calendar schema
const calendarSchema = new mongoose.Schema({
    yearStart: {
        type: Number,
        required: true
    },
    sem1Start: {
        type: Date,
        required: true
    },
    sem1End: {
        type: Date,
        required: true
    },
    sem2Start: {
        type: Date,
        required: true
    },
    sem2End: {
        type: Date,
        required: true
    },
    summerStart: {
        type: Date,
        required: true
    },
    summerEnd: {
        type: Date,
        required: true
    }
});
const SpeckerCalendar = mongoose.model('calendar', calendarSchema);

//GET AND POST REQUESTS

//root
app.get("/", function(req, res){
    if(req.session.user) {
        res.redirect('/dashboard');
    } else {
        res.render('index', {visibility: ""});
    } 
});

//Login
app.get("/login", function(req, res){
    if(req.session.user) {
        res.redirect('/dashboard');
    } else {
        res.render('index', {visibility: ""});
    } 
});

app.post("/login", async function(req, res){
    const userDetails = await SpeckerLogins.findOne({ username: req.body.username }).populate('facultyCollege').populate('facultyDepartment').populate('studentCurriculum').populate('studentDegree').populate('studentCollege');

    if (userDetails && bcrypt.compareSync(req.body.password, userDetails.password)) {
        const { _id, accessType, firstName, middleInitial, lastName, facultyPosition, facultyCollege, facultyDepartment, lightMode, studentDegree, studentType, studentCurriculum, studentCollege, facultyPrefix, suffix } = userDetails;
        
        const sessionUser = {
            _id,
            accessType,
            username: req.body.username,
            firstName,
            middleInitial,
            lastName,
            suffix,
            facultyPrefix,
            facultyPosition,
            facultyCollege,
            facultyDepartment,
            studentType,
            studentDegree,
            studentCurriculum,
            studentCollege,
            lightMode,
            message: null
        };
        
        req.session.user = sessionUser;
        res.redirect('/dashboard');
    } else {
        res.render('index', { visibility: "visible" });
    }
});

//Logout
app.get('/logout', function(req, res){
    req.session.destroy(err => {
        if (err) {
            console.error(err);
        } else {
            res.redirect('/');
        }
    });
});

//Dashboard
app.get("/dashboard", async function(req, res){
    if (!req.session.user) {
        return res.redirect('/');
    }

    try {
        const { accessType } = req.session.user;
        
        if (accessType === 'student') {
            res.render('s-dashboard', { session: req.session });
        } else if (accessType === 'faculty') {
            const checklists = await SpeckerChecklists.find({ 'years.semesters.subjects.pending': true}).populate('student').populate('years.semesters.subjects.subject');
            const studyplans = await SpeckerStudyPlans.find({ 'pending': true}).populate('student').populate('years.semesters.subjects.subject');
            res.render('f-dashboard', { session: req.session, checklists, studyplans });
        } else if (accessType === 'admin') {
            res.render('a-dashboard', { session: req.session });
        } else {
            res.redirect('/');
        }
    } catch (err) {
        console.error(err);
        res.sendStatus(500);
    }
});

//ToggleTheme
app.post('/dashboard/theme', async function(req, res) {
    if (!req.session.user) {
        return res.redirect('/');
    }
    
    try {
        const user = await SpeckerLogins.findOne({ username: req.session.user.username });
        if (!user) return res.sendStatus(404);
    
        user.lightMode = !user.lightMode;
        await user.save();
        req.session.user.lightMode = !req.session.user.lightMode;
    
        return res.sendStatus(200);
    } catch (err) {
        console.error(err);
        return res.sendStatus(500);
    }    
});

//College
//main menu
app.get('/dashboard/college', async function(req, res) {
    if (!req.session.user || req.session.user.accessType !== 'admin') {
        return res.redirect('/');
    }
    
    try {
        const colleges = await SpeckerColleges.find();
        const degrees = await SpeckerDegrees.aggregate([
            {
                $group: {
                  _id: '$college',
                  count: { $count: {} }
                }
              }
            ]);
        const faculty = await SpeckerLogins.aggregate([
            {
                $match: {
                accessType: 'faculty'
                }
            },
            {
                $group: {
                _id: '$facultyCollege',
                count: { $count: {} }
                }
            }
            ]);
            
        res.render('a-college', {session: req.session, colleges: colleges, degrees: degrees, faculties: faculty});
    } catch (err) {
        console.error(err);
        return res.sendStatus(500);
    }
});

//view college
app.get('/dashboard/college/view', async function(req, res) {
    if (!req.session.user || req.session.user.accessType !== 'admin') { 
      return res.redirect('/');
    }
    
    const queryObject = url.parse(req.url, true).query;
    const data = queryObject.data;
    
    try {
        const colleges = await SpeckerColleges.find();
        const degrees = await SpeckerDegrees.aggregate([
            {
                $group: {
                  _id: '$college',
                  count: { $count: {} }
                }
              }
            ]);
        const faculty = await SpeckerLogins.aggregate([
            {
                $match: {
                accessType: 'faculty'
                }
            },
            {
                $group: {
                _id: '$facultyCollege',
                count: { $count: {} }
                }
            }
            ]);

        res.render('a-college-view', {session: req.session, colleges: colleges, data: data, degrees: degrees, faculties: faculty});
    } catch (err) {
        console.error(err);
        return res.sendStatus(500);
    }
});

//add college
app.post('/dashboard/college/add', async function(req, res) {
    if (!req.session.user || req.session.user.accessType !== 'admin') {
        return res.redirect('/');
    }
      
    try {
        const { name, abbreviation } = req.body;
        const existingCollege = await SpeckerColleges.findOne({
            $or: [
                { name: { $regex: new RegExp('^' + name + '$', 'i') } },
                { abbreviation }
            ]
            });

        if (existingCollege) {
            if (existingCollege.name === name) {
                req.session.user.message = "This college is already added.";
            } else {
                req.session.user.message = "This abbreviation is already used for another college.";
            }
            return res.redirect('/dashboard/college');
        }
          
        await SpeckerColleges.create({ name, abbreviation });
      
        return res.redirect('/dashboard/college/');
    } catch (error) {
        console.error(error);
        return res.status(500).send('An error occurred');
    }
});

//edit college
app.post('/dashboard/college/edit', async function(req, res) {
    if (!req.session.user || req.session.user.accessType !== 'admin') {
        return res.redirect('/');
    }

    try {
        const { name, abbreviation, oldAbbreviation } = req.body;
        const existingCollege = await SpeckerColleges.findOne({
            $or: [
                { name: { $regex: new RegExp('^' + name + '$', 'i') } },
                { abbreviation: { $regex: new RegExp('^' + abbreviation + '$', 'i') } }
            ],
            name: { $ne: name },
            abbreviation: { $ne: oldAbbreviation }
        });

        if (existingCollege) {
            if (existingCollege.name === name) {
                req.session.user.message = "This college is already added.";
            } else {
                req.session.user.message = "This abbreviation is already used for another college.";
            }
            return res.redirect('/dashboard/college');
        }

        await SpeckerColleges.updateOne(
            { abbreviation: oldAbbreviation },
            { $set: { name, abbreviation } }
        );

        return res.redirect('/dashboard/college');
    } catch (error) {
        console.error(error);
        return res.status(500).send('An error occurred');
    }
});

//delete college
app.post('/dashboard/college/delete', async function(req, res) {
    if (!req.session.user || req.session.user.accessType !== 'admin') {
        return res.redirect('/');
    }

    try {
        const { abbreviation } = req.body;
        const college = await SpeckerColleges.findOne( { abbreviation } );
        const degreeCount = await SpeckerDegrees.find( { college: college._id } );

        if (degreeCount.length > 0) {
            req.session.user.message = "This college still has an active degree program.";
            return res.redirect('/dashboard/college');
        }

        await college.deleteOne( { abbreviation } );

        return res.redirect('/dashboard/college');
    } catch (error) {
        console.error(error);
        return res.status(500).send('An error occurred');
    }
});

//Degrees
//main menu
app.get('/dashboard/degree', async function(req, res) {
    if (!req.session.user || req.session.user.accessType !== 'admin') {
        return res.redirect('/');
    }

    try {
        const degrees = await SpeckerDegrees.find().populate('college');
        const colleges = await SpeckerColleges.find();
        const faculty = await SpeckerLogins.aggregate([
            {
                $match: {
                accessType: 'faculty'
                }
            },
            {
                $group: {
                _id: '$facultyDepartment',
                count: { $count: {} }
                }
            }
            ]);
        
        res.render('a-degree', {session: req.session, degrees: degrees, colleges: colleges, faculties: faculty} );
    } catch (err) {
        console.error(err);
        return res.sendStatus(500);
    }
});

//view degree
app.get('/dashboard/degree/view', async function(req, res) {
    if (!req.session.user || req.session.user.accessType !== 'admin') {
        return res.redirect('/');
    }

    const queryObject = url.parse(req.url, true).query;
    const data = queryObject.data;
    
    try {
        const degrees = await SpeckerDegrees.find().populate('college');
        const colleges = await SpeckerColleges.find();
        const faculty = await SpeckerLogins.aggregate([
            {
                $match: {
                accessType: 'faculty'
                }
            },
            {
                $group: {
                _id: '$facultyDepartment',
                count: { $count: {} }
                }
            }
            ]);
        
        res.render('a-degree-view', {session: req.session, degrees: degrees, colleges: colleges, data: data, faculties: faculty} );
    } catch (err) {
        console.error(err);
        return res.sendStatus(500);
    }
});

//add degree
app.post('/dashboard/degree/add', async function(req, res) {
    if (!req.session.user || req.session.user.accessType !== 'admin') {
        return res.redirect('/');
    }

    try {
        const degrees = await SpeckerDegrees.find().populate({
            path: 'college',
            select: 'abbreviation'
        });
        const colleges = await SpeckerColleges.find();
        const { name, abbreviation } = req.body;
        const college = req.body.college.split(" ").shift();
        const existingDegree = await SpeckerDegrees.findOne({
            $or: [
                { name: { $regex: new RegExp('^' + name + '$', 'i') } },
                { abbreviation }
            ]
        });

        if (existingDegree) {
            if (existingDegree.name === name) {
                req.session.user.message = "This degree is already added.";
            } else {
                req.session.user.message = "This abbreviation is already used for another degree.";
            }
            return res.render('a-degree', { session: req.session, degrees: degrees, colleges: colleges });
        }

        const selectedCollege = await SpeckerColleges.findOne({ abbreviation: college });
        if (!selectedCollege) {
            req.session.user.message = ('Selected college does not exist');
            return res.render('a-degree', { session: req.session, degrees: degrees, colleges: colleges });
        }

        await SpeckerDegrees.create({ name, abbreviation, college: selectedCollege._id });

        return res.redirect('/dashboard/degree');
    } catch (error) {
        console.error(error);
        return res.status(500).send('An error occurred');
    }
});

//edit degree
app.post('/dashboard/degree/edit', async function(req, res) {
    if (!req.session.user || req.session.user.accessType !== 'admin') {
        return res.redirect('/');
    }

    try {
        const degrees = await SpeckerDegrees.find().populate({
            path: 'college',
            select: 'abbreviation'
        });
        const colleges = await SpeckerColleges.find();
        const { name, abbreviation, oldAbbreviation } = req.body;
        const college = req.body.college.split(" ").shift();
        const existingDegree = await SpeckerDegrees.findOne({
            $or: [
                { name: { $regex: new RegExp('^' + name + '$', 'i') } },
                { abbreviation: { $regex: new RegExp('^' + abbreviation + '$', 'i') } }
            ],
            name: { $ne: name },
            abbreviation: { $ne: oldAbbreviation }
        });

        if (existingDegree) {
            if (existingDegree.name === name) {
                req.session.user.message = "This degree is already added.";
            } else {
                req.session.user.message = "This abbreviation is already used for another degree.";
            }
            return res.render('a-degree', { session: req.session, degrees: degrees, colleges: colleges });
        }

        const selectedCollege = await SpeckerColleges.findOne({ abbreviation: college });
        if (!selectedCollege) {
            req.session.user.message = ('Selected college does not exist');
            return res.render('a-degree', { session: req.session, degrees: degrees, colleges: colleges });
        }

        await SpeckerDegrees.updateOne(
            { abbreviation: oldAbbreviation },
            { $set: { name, abbreviation, college: selectedCollege._id } }
        );

        return res.redirect('/dashboard/degree');
    } catch (error) {
        console.error(error);
        return res.status(500).send('An error occurred');
    }
});

//delete degree
app.post('/dashboard/degree/delete', async function(req, res) {
    if (!req.session.user || req.session.user.accessType !== 'admin') {
        return res.redirect('/');
    }

    try {
        var { abbreviation } = req.body;

        const degree = await SpeckerDegrees.findOne({ abbreviation });

        abbreviation = degree._id;

        const employedFaculty = await SpeckerLogins.find({ facultyDepartment: abbreviation });
        if (employedFaculty.length > 0) {
            req.session.user.message = "This degree still has an employed faculty.";
            return res.redirect('/dashboard/degree');
        }

        await SpeckerDegrees.deleteOne(
            { _id : abbreviation }
        );

        return res.redirect('/dashboard/degree');
    } catch (error) {
        console.error(error);
        return res.status(500).send('An error occurred');
    }
});

//Subjects
//main menu
app.get('/dashboard/subjects', async function(req, res) {
    if (!req.session.user || (req.session.user.accessType !== 'faculty' && req.session.user.accessType !== 'admin')) {
        return res.redirect('/');
    }

    try {
        const subjects = await SpeckerSubjects.find().populate('preRequisite').populate('coRequisite').populate('college');
        const colleges = await SpeckerColleges.find();

        res.render('a-subjects', {session: req.session, subjects: subjects, colleges: colleges});
    } catch (err) {
        console.error(err);
        return res.sendStatus(500);
    }
});

//view subject
app.get('/dashboard/subjects/view', async function(req, res) {
    if (!req.session.user || (req.session.user.accessType !== 'faculty' && req.session.user.accessType !== 'admin')) {
        return res.redirect('/');
    }

    const queryObject = url.parse(req.url, true).query;
    const data = queryObject.data;

    try {
        const subjects = await SpeckerSubjects.find().populate('preRequisite').populate('coRequisite').populate('college');
        const colleges = await SpeckerColleges.find();

        res.render('a-subjects-view', {session: req.session, subjects: subjects, data: data, colleges: colleges});
    } catch (err) {
        console.error(err);
        return res.sendStatus(500);
    }
});

//add subject
app.post('/dashboard/subjects/add', async function(req, res) {
    if (!req.session.user || req.session.user.accessType !== 'admin' && req.session.user.accessType !== 'faculty') {
        return res.redirect('/');
    }
    
    try {
        const subjects = await SpeckerSubjects.find().populate('preRequisite').populate('coRequisite').populate('college');
        const colleges = await SpeckerColleges.find();
        var { code, name, units, preRequisite, coRequisite, category, sem1, sem2, summer, includeInGWA, yearStanding} = req.body;
        if (req.session.user.accessType === 'faculty') {
            var college = req.session.user.facultyCollege.abbreviation;
        } else {
            var college = req.body.college.split(" ").shift();
        }

        const existingSubject = await SpeckerSubjects.findOne({
            $or: [
                { name: { $regex: new RegExp('^' + name + '$', 'i') } },
                { code }
            ]
        });

        if (existingSubject) {
            if (existingSubject.name === name) {
                req.session.user.message = "This subject is already added.";
            } else {
                req.session.user.message = "This code is already used for another subject.";
            }
            return res.render('a-subjects', { session: req.session, subjects: subjects, colleges: colleges });
        }

        const _id = new mongoose.Types.ObjectId();
        code = code.trimEnd();
        name = name.trimEnd();
        includeInGWA = includeInGWA === 'Yes' ? true : false;
        sem1 = sem1 === 'true' ? true : false;
        sem2 = sem2 === 'true' ? true : false;
        summer = summer === 'true' ? true : false;

        preRequisite = preRequisite.split('|').map(item => item.trim()).filter(item => item.length > 0).map(item => item.split('-')[0].trim());

        coRequisite = coRequisite.split('|').map(item => item.trim()).filter(item => item.length > 0).map(item => item.split('-')[0].trim());

        const hasSimilarSubjects = preRequisite.some(subject => coRequisite.includes(subject));

        if (hasSimilarSubjects) {
            req.session.user.message = 'Pre-requisites and co-requisites cannot have similar subjects.';
            return res.redirect('/dashboard/subjects');
        }

        for (let i = 0; i < preRequisite.length; i++) {
            const subject = await SpeckerSubjects.findOne({ code: preRequisite[i] });
            if (!subject) {
                req.session.user.message = `Pre-requisite ${preRequisite[i]} does not exist`;
                return res.render('a-subjects', { session: req.session, subjects: subjects, colleges: colleges });
            } else {
                preRequisite[i] = subject._id;
            }
        }

        for (let i = 0; i < coRequisite.length; i++) {
            const subject = await SpeckerSubjects.findOne({ code: coRequisite[i] });
            if (!subject) {
                req.session.user.message = `Co-requisite ${coRequisite[i]} does not exist`;
                return res.render('a-subjects', { session: req.session, subjects: subjects, colleges: colleges });
            } else {
                coRequisite[i] = subject._id;
                subject.coRequisite.push(_id);
                subject.save();
            }
        }

        if(college) {
            const collegeId = await SpeckerColleges.findOne({ abbreviation: college }).select('_id');
            if (!collegeId) {
                req.session.user.message = ('Selected college does not exist');
                return res.render('a-subjects', { session: req.session, subjects: subjects, colleges: colleges });
            }

            college = collegeId._id;
        } else {
            college = null;
        }

        await SpeckerSubjects.create({_id, code, name, units, preRequisite, coRequisite, category, sem1, sem2, summer, includeInGWA, college, yearStanding });

        res.redirect('/dashboard/subjects');
    } catch (err) {
        console.error(err);
        return res.sendStatus(500);
    }
});

//edit subject
app.post('/dashboard/subjects/edit', async function(req, res) {
    if (!req.session.user || req.session.user.accessType !== 'admin' && req.session.user.accessType !== 'faculty') {
        return res.redirect('/');
    }

    try {
        const subjects = await SpeckerSubjects.find().populate('preRequisite').populate('coRequisite').populate('college');
        const colleges = await SpeckerColleges.find();
        var { oldCode, oldName, code, name, units, preRequisite, coRequisite, category, sem1, sem2, summer, includeInGWA, yearStanding } = req.body;
                if (req.session.user.accessType === 'faculty') {
            var college = req.session.user.facultyCollege.abbreviation;
        } else {
            var college = req.body.college.split(" ").shift();
        }
        const existingSubject = await SpeckerSubjects.findOne({
            $or: [
              { name: { $regex: new RegExp('^' + name + '$', 'i') } },
              { code }
            ],
            name: { $ne: oldName },
            code: { $ne: oldCode }
        });

        if (existingSubject) {
            if (existingSubject.name === name) {
                req.session.user.message = "This subject is already added.";
            } else {
                req.session.user.message = "This code is already used for another subject.";
            }
            return res.render('a-subjects', { session: req.session, subjects: subjects, colleges: colleges });
        }

        code = code.trimEnd();
        name = name.trimEnd();
        includeInGWA = includeInGWA === 'Yes' ? true : false;
        sem1 = sem1 === 'true' ? true : false;
        sem2 = sem2 === 'true' ? true : false;
        summer = summer === 'true' ? true : false;

        preRequisite = preRequisite.split('|').map(item => item.trim()).filter(item => item.length > 0).map(item => item.split('-')[0].trim());
        coRequisite = coRequisite.split('|').map(item => item.trim()).filter(item => item.length > 0).map(item => item.split('-')[0].trim());

        const hasSimilarSubjects = preRequisite.some(subject => coRequisite.includes(subject));

        if (hasSimilarSubjects) {
            req.session.user.message = 'Pre-requisites and co-requisites cannot have similar subjects.';
            return res.redirect('/dashboard/subjects');
        }

        const _id = await SpeckerSubjects.findOne({ code: oldCode }).select('_id');
        if(preRequisite.length > 0) {
            for (let i = 0; i < preRequisite.length; i++) {
                const subject = await SpeckerSubjects.findOne({ code: preRequisite[i] });
                if (!subject) {
                    req.session.user.message = `Pre-requisite ${preRequisite[i]} does not exist`;
                    return res.render('a-subjects', { session: req.session, subjects: subjects, colleges: colleges });
                } else {
                    preRequisite[i] = subject._id;
                }
            }
        } else {
            preRequisite = [];
        }

        const subjectsDelete = await SpeckerSubjects.find({ coRequisite: _id });
        for (let i = 0; i < subjectsDelete.length; i++) {
            const index = subjectsDelete[i].coRequisite.indexOf(_id);
            subjectsDelete[i].coRequisite.splice(index, 1);
            subjectsDelete[i].save();
        }

        if(coRequisite.length > 0) {
            for (let i = 0; i < coRequisite.length; i++) {

                const subject = await SpeckerSubjects.findOne({ code: coRequisite[i] });
                if (!subject) {
                    req.session.user.message = `Co-requisite ${coRequisite[i]} does not exist`;
                    return res.render('a-subjects', { session: req.session, subjects: subjects, colleges: colleges });
                } else {
                    coRequisite[i] = subject._id;
                    subject.coRequisite.push(_id);
                    subject.save();
                }
            }
        } else {
            coRequisite = [];
        }

        
        if(college) {
            const collegeId = await SpeckerColleges.findOne({ abbreviation: college }).select('_id');
            if (!collegeId) {
                req.session.user.message = ('Selected college does not exist');
                return res.render('a-subjects', { session: req.session, subjects: subjects, colleges: colleges });
            }

            college = collegeId._id;
        } else {
            college = null;
        }
        
        await SpeckerSubjects.findOneAndUpdate({ code: oldCode }, { code, name, units, preRequisite, coRequisite, category, sem1, sem2, summer, includeInGWA, college, yearStanding });

        res.redirect('/dashboard/subjects');
    } catch (err) {
        console.error(err);
        return res.sendStatus(500);
    }
});

//delete subject
app.post('/dashboard/subjects/delete', async function(req, res) {
    if (!req.session.user || req.session.user.accessType !== 'admin' && req.session.user.accessType !== 'faculty') {
        return res.redirect('/');
    }

    try {
        const { code } = req.body;

        const _id = await SpeckerSubjects.findOne({ code }).select('_id');

        const hasRequisite = await SpeckerSubjects.findOne({ $or: [{ preRequisite: _id }, { coRequisite: _id }] });
        if (hasRequisite) {
            req.session.user.message = "This subject is a requisite of another subject.";
            return res.redirect('/dashboard/subjects');
        }

        await SpeckerSubjects.findOneAndDelete({ code });

        res.redirect('/dashboard/subjects');
    } catch (err) {
        console.error(err);
        return res.sendStatus(500);
    }
});


//Accounts
//main menu
app.get("/dashboard/accounts", async function(req, res){
    if (!req.session.user || req.session.user.accessType !== "admin" && req.session.user.accessType !== "faculty") {
        return res.redirect('/');
    }

    const queryObject = url.parse(req.url, true).query;
    const data = queryObject.data;

    if(req.session.user.accessType === "admin") {
        try {
            const query = data ? { accessType: 'faculty', facultyCollege: { $in: await SpeckerColleges.find({ abbreviation: data }, '_id') } } : { accessType: 'faculty' };
            const faculty = await SpeckerLogins.find(query).populate('facultyCollege').populate('facultyDepartment').exec();
            const colleges = await SpeckerColleges.find();
            const degrees = await SpeckerDegrees.find().populate('college');
            res.render('a-accounts', {session: req.session, people: faculty, colleges: colleges, degrees: degrees, data: data});
        } catch (err) {
            console.error(err);
            return res.sendStatus(500);
        }
    } else {
        try {
            const students = await SpeckerLogins.find({accessType: "student"}).populate('studentDegree').populate('studentCollege');

            res.render('f-accounts', {session: req.session, data: data, people: students})
        } catch (err) {
            console.error(err);
            return res.sendStatus(500);
        }
    }
});

//view accounts
app.get("/dashboard/accounts/view", async function(req, res){
    if (!req.session.user || req.session.user.accessType !== "admin" && req.session.user.accessType !== "faculty") {
        return res.redirect('/');
    }

    const queryObject = url.parse(req.url, true).query;
    const data = queryObject.data;

    try {
        if(req.session.user.accessType === "admin") {
            const faculty = await SpeckerLogins.find({accessType: "faculty"}).populate('facultyCollege').populate('facultyDepartment');
            const colleges = await SpeckerColleges.find();
            const degrees = await SpeckerDegrees.find().populate('college');
            res.render('a-accounts-view', {session: req.session, people: faculty, colleges: colleges, degrees: degrees, data: data});
        } else if (req.session.user.accessType === "faculty") {
            const students = await SpeckerLogins.find({accessType: "student"}).populate('studentDegree').populate('studentCollege');

            res.render('f-accounts-view', {session: req.session, data: data, people: students})
        }
    } catch (err) {
        console.error(err);
        return res.sendStatus(500);
    }
});

//add accounts
//get
app.get("/dashboard/accounts/add", async function(req, res){
    if (!req.session.user || req.session.user.accessType !== "faculty") {
        return res.redirect('/');
    }

    try {
        const colleges = await SpeckerColleges.find();
        const degrees = await SpeckerDegrees.find().populate('college');
        const subjects = await SpeckerSubjects.find().populate('preRequisite').populate('coRequisite').populate('college');
        const curriculums = await SpeckerCurriculums.find({degree: req.session.user.facultyDepartment._id}).populate('degree').populate('years.semesters.subjects');
        res.render('f-accounts-add', {session: req.session, colleges: colleges, degrees: degrees, subjects: subjects, curriculums: curriculums});
    } catch (err) {
        console.error(err);
        return res.sendStatus(500);
    }
});

//post
app.post("/dashboard/accounts/add", async function(req, res){
    if (!req.session.user || req.session.user.accessType !== "admin" && req.session.user.accessType !== "faculty") {
        return res.redirect('/');
    }

    try {
        if(req.session.user.accessType === "admin") {
            const faculty = await SpeckerLogins.find({access_type: "faculty"});
            const colleges = await SpeckerColleges.find();
            const degrees = await SpeckerDegrees.find().populate('college');

            var { username, password, firstName, middleInitial, lastName, facultyPrefix, suffix, facultyCollege, facultyDepartment, facultyPosition } = req.body;
            
            const accessType = "faculty";
            const lightMode = true;
            middleInitial = middleInitial !== "" ? middleInitial : null;
            facultyPrefix = facultyPrefix !== "" ? facultyPrefix : null;
            facultyCollege = facultyCollege.split(" ").shift();
            facultyDepartment = facultyDepartment.split(" ").shift();

            password = await bcrypt.hash(password, 10);

            const hasUsername = await SpeckerLogins.findOne({ username });
            if (hasUsername) {
                req.session.user.message = "This username is already used for another account.";
                return res.render('a-accounts', { session: req.session, people: faculty, colleges: colleges, degrees: degrees, data: data });
            }

            const college = await SpeckerColleges.findOne({ abbreviation: facultyCollege }).select('_id');
            if (!college) {
                req.session.user.message = ('Selected college does not exist');
                return res.render('a-accounts', { session: req.session, people: faculty, colleges: colleges, degrees: degrees });
            }

            const degree = await SpeckerDegrees.findOne({ abbreviation: facultyDepartment }).select('_id');
            if (!degree) {
                req.session.user.message = ('Selected degree does not exist');
                return res.render('a-accounts', { session: req.session, people: faculty, colleges: colleges, degrees: degrees });
            }

            await SpeckerLogins.create({ username, password, accessType, firstName, middleInitial, lastName, suffix, facultyPrefix, facultyCollege: college._id, facultyDepartment: degree._id, facultyPosition, lightMode });
        } else if (req.session.user.accessType === "faculty") {
            var { username, password, firstName, middleInitial, lastName, suffix, studentCollege, studentDegree, studentType, studentCurriculum, studentYearLevel } = req.body;

            const accessType = "student";
            const lightMode = true;
            middleInitial = middleInitial !== "" ? middleInitial : null;
            suffix = suffix !== "" ? suffix : null;
            studentCollege = studentCollege.split(" ").shift();
            studentDegree = studentDegree.split(" ").shift();
            studentYearLevel = parseInt(studentYearLevel)

            password = await bcrypt.hash(password, 10);

            const hasUsername = await SpeckerLogins.findOne({ username });
            if (hasUsername) {
                req.session.user.message = "This username is already used for another account.";
                return res.redirect('/dashboard/accounts');
            }

            const college = await SpeckerColleges.findOne({ abbreviation: studentCollege }).select('_id');
            if (!college) {
                req.session.user.message = ('Selected college does not exist');
                return res.redirect('/dashboard/accounts');
            }

            const degree = await SpeckerDegrees.findOne({ abbreviation: studentDegree }).select('_id');
            if (!degree) {
                req.session.user.message = ('Selected degree does not exist');
                return res.redirect('/dashboard/accounts');
            }

            const curriculum = await SpeckerCurriculums.findOne({ degree: degree._id, year: studentCurriculum }).select('_id');
            if (!curriculum) {
                req.session.user.message = ('Selected curriculum does not exist');
                return res.redirect('/dashboard/accounts');
            }

            await SpeckerLogins.create({ username, password, accessType, firstName, middleInitial, lastName, suffix, studentCollege: college._id, studentType, studentDegree: degree._id, studentCurriculum: curriculum._id, studentYearLevel, lightMode });
        }

    } catch (err) {
        console.error(err);
        return res.sendStatus(500);
    }
});

//faculty creation


//edit accounts
//post
app.post("/dashboard/accounts/edit", async function(req, res){
    if (!req.session.user || req.session.user.accessType !== "admin" && req.session.user.accessType !== "faculty") {
        return res.redirect('/');
    }

    const queryObject = url.parse(req.url, true).query;
    const data = queryObject.data;

    try {
        if (req.session.user.accessType == "admin") {
            const faculty = await SpeckerLogins.find({access_type: "faculty"});
            const colleges = await SpeckerColleges.find();
            const degrees = await SpeckerDegrees.find().populate('college');

            var { username, firstName, middleInitial, suffix, lastName, facultyPrefix, facultyCollege, facultyDepartment, facultyPosition, oldUsername } = req.body;

            middleInitial = middleInitial !== "" ? middleInitial : null;
            facultyPrefix = facultyPrefix !== "" ? facultyPrefix : null;
            facultyCollege = facultyCollege.split(" ").shift();
            facultyDepartment = facultyDepartment.split(" ").shift();

            const hasUsername = await SpeckerLogins.findOne({ username: { $eq: username, $ne: oldUsername } });
            if (hasUsername) {
                req.session.user.message = "This username is already used for another account.";
                return res.render('a-accounts', { session: req.session, people: faculty, colleges: colleges, degrees: degrees, data: data });
            }

            const college = await SpeckerColleges.findOne({ abbreviation: facultyCollege }).select('_id');
            if (!college) {
                req.session.user.message = ('Selected college does not exist');
                return res.render('a-accounts', { session: req.session, people: faculty, colleges: colleges, degrees: degrees, data: data });
            }

            const degree = await SpeckerDegrees.findOne({ abbreviation: facultyDepartment }).select('_id');
            if (!degree) {
                req.session.user.message = ('Selected degree does not exist');
                return res.render('a-accounts', { session: req.session, people: faculty, colleges: colleges, degrees: degrees, data: data });
            }

            await SpeckerLogins.findOneAndUpdate({ username: oldUsername }, { username, firstName, middleInitial, lastName, facultyPrefix, suffix, facultyCollege: college._id, facultyDepartment: degree._id, facultyPosition });

            res.redirect('/dashboard/accounts');
        } else {
            var { username, firstName, middleInitial, suffix, lastName, studentCollege, studentDegree, studentType, studentCurriculum, studentYearLevel, oldUsername } = req.body;

            middleInitial = middleInitial !== "" ? middleInitial : null;
            suffix = suffix !== "" ? suffix : null;
            studentCollege = studentCollege.split(" ").shift();
            studentDegree = studentDegree.split(" ").shift();
            studentYearLevel = parseInt(studentYearLevel)

            const hasUsername = await SpeckerLogins.findOne({ username: { $eq: username, $ne: oldUsername } });
            if (hasUsername) {
                req.session.user.message = "This username is already used for another account.";
                return res.redirect('/dashboard/accounts');
            }

            const college = await SpeckerColleges.findOne({ abbreviation: studentCollege }).select('_id');
            if (!college) {
                req.session.user.message = ('Selected college does not exist');
                return res.redirect('/dashboard/accounts');
            }

            const degree = await SpeckerDegrees.findOne({ abbreviation: studentDegree }).select('_id');
            if (!degree) {
                req.session.user.message = ('Selected degree does not exist');
                return res.redirect('/dashboard/accounts');
            }

            const curriculum = await SpeckerCurriculums.findOne({ degree: degree._id, year: studentCurriculum }).select('_id');
            if (!curriculum) {
                req.session.user.message = ('Selected curriculum does not exist');
                return res.redirect('/dashboard/accounts');
            }

            await SpeckerLogins.findOneAndUpdate({ username: oldUsername }, { username, firstName, middleInitial, lastName, suffix, studentCollege: college._id, studentType, studentDegree: degree._id, studentCurriculum: curriculum._id, studentYearLevel });

            res.redirect('/dashboard/accounts');
        }
    } catch (err) {
        console.error(err);
        return res.sendStatus(500);
    }
});

//get
app.get("/dashboard/accounts/edit", async function(req, res){
    if (!req.session.user || req.session.user.accessType !== "faculty") {
        return res.redirect('/');
    }

    const queryObject = url.parse(req.url, true).query;
    const data = queryObject.data;

    try {
        
        const student = await SpeckerLogins.findOne({username: data}).select('username firstName middleInitial lastName suffix studentCollege studentDegree studentType studentCurriculum studentYearLevel').populate('studentCollege').populate('studentDegree').populate('studentCurriculum');
        const colleges = await SpeckerColleges.find();
        const degrees = await SpeckerDegrees.find().populate('college');
        const subjects = await SpeckerSubjects.find().populate('preRequisite').populate('coRequisite').populate('college');
        const curriculums = await SpeckerCurriculums.find({degree: student.studentDegree._id}).populate('degree').populate('years.semesters.subjects');


        res.render('f-accounts-edit', {session: req.session, colleges: colleges, degrees: degrees, subjects: subjects, curriculums: curriculums, student: student});
    } catch (err) {
        console.error(err);
        return res.sendStatus(500);
    }
});

//change password
app.post("/dashboard/accounts/changepassword", async function(req, res){
    if (!req.session.user || req.session.user.accessType !== "admin" && req.session.user.accessType !== "faculty") {
        return res.redirect('/');
    }

    try {
        var { username, password } = req.body;
    
        password = await bcrypt.hash(password, 10);

        await SpeckerLogins.findOneAndUpdate({ username }, { password });

        res.redirect(req.headers.referer);
        
    } catch (err) {
        console.error(err);
        return res.sendStatus(500);
    }
});

//delete accounts
app.post("/dashboard/accounts/delete", async function(req, res){
    if (!req.session.user || req.session.user.accessType !== "admin" && req.session.user.accessType !== "faculty") {
        return res.redirect('/');
    }

    try {
        const { username } = req.body;

        //if faculty delete checklist and studyplan of the student to be deleted
        if(req.session.user.accessType == "faculty") {
            const student = await SpeckerLogins.findOne({username: username}).select('_id');
            await SpeckerChecklists.findOneAndDelete({student: student._id});
            await SpeckerStudyPlans.findOneAndDelete({student: student._id});
        }
        
        await SpeckerLogins.findOneAndDelete({ username });

        res.redirect('/dashboard/accounts');
    } catch (err) {
        console.error(err);
        return res.sendStatus(500);
    }
});

//Curriculum
//main menu
app.get("/dashboard/curriculum", async function(req, res){
    if (!req.session.user || req.session.user.accessType !== "admin" && req.session.user.accessType !== "faculty") {
        return res.redirect('/');
    }

    try {
        if(req.session.user.accessType == "admin") {
            const colleges = await SpeckerColleges.find();
            const degrees = await SpeckerDegrees.find().populate('college');
            const subjects = await SpeckerSubjects.find().populate('preRequisite').populate('coRequisite').populate('college');
            const curriculums = await SpeckerCurriculums.find().populate('degree').populate('years.semesters.subjects');
            res.render('a-curriculum', {session: req.session, colleges: colleges, degrees: degrees, subjects: subjects, curriculums: curriculums});
        } else {
            if (req.session.user.facultyPosition == "Dean" || req.session.user.facultyPosition == "Director") {
                const colleges = await SpeckerColleges.find();
                const degrees = await SpeckerDegrees.find().populate('college');
                const subjects = await SpeckerSubjects.find().populate('preRequisite').populate('coRequisite').populate('college');
                const curriculums = await SpeckerCurriculums.find({}).populate('degree').populate('years.semesters.subjects');
                res.render('a-curriculum', {session: req.session, colleges: colleges, degrees: degrees, subjects: subjects, curriculums: curriculums});
            } else {
                const colleges = await SpeckerColleges.find({_id: req.session.user.facultyCollege});
                const degrees = await SpeckerDegrees.find({_id: req.session.user.facultyDepartment}).populate('college');
                const subjects = await SpeckerSubjects.find().populate('preRequisite').populate('coRequisite').populate('college');
                const curriculums = await SpeckerCurriculums.find({degree: req.session.user.facultyDepartment._id}).populate('degree').populate('years.semesters.subjects');
                res.render('a-curriculum', {session: req.session, colleges: colleges, degrees: degrees, subjects: subjects, curriculums: curriculums});
            }
        }
    } catch (err) {
        console.error(err);
        return res.sendStatus(500);
    }
});

//add curriculum
//get
app.get("/dashboard/curriculum/add", async function(req, res){
    if (!req.session.user || req.session.user.accessType !== "admin" && req.session.user.accessType !== "faculty") {
        return res.redirect('/');
    }

    try {
        const colleges = await SpeckerColleges.find();
        const degrees = await SpeckerDegrees.find().populate('college');
        const subjects = await SpeckerSubjects.find().populate('preRequisite').populate('coRequisite').populate('college');
        res.render('a-curriculum-add', {session: req.session, colleges: colleges, degrees: degrees, subjects: subjects});
    } catch (err) {
        console.error(err);
        return res.sendStatus(500);
    }
});

//post
app.post("/dashboard/curriculum/add", async function(req, res){
    if (!req.session.user || req.session.user.accessType !== "admin" && req.session.user.accessType !== "faculty") {
        return res.redirect('/');
    }
    
    try {
        let {degree, year, years} = req.body;

        degree = degree.split(" ").shift();
        degree = await SpeckerDegrees.findOne({ abbreviation:  degree});

        hasCurriculum = await SpeckerCurriculums.findOne({ degree: degree._id, year: year });
        if (hasCurriculum) {
            req.session.user.message = "This curriculum is already added.";
            return res.status(409).json({ message: "This curriculum is already added." });
        }

        for (i = 0; i < years.length; i++) {
            years[i].yearLevel = parseInt(years[i].yearLevel);

            for (j = 0; j < years[i].semesters.length; j++) {
                for (k = 0; k < years[i].semesters[j].subjects.length; k++) {
                    years[i].semesters[j].subjects[k] = await SpeckerSubjects.findOne({ code:  years[i].semesters[j].subjects[k]});
                }
            }
        }

        const curriculum = new SpeckerCurriculums({degree, year, years});
        await curriculum.save();

        return res.status(200).json({ message: "Curriculum added successfully." });
    } catch (err) {
        console.error(err);
        return res.sendStatus(500);
    }
});

//view curriculum
app.get("/dashboard/curriculum/view", async function(req, res){
    if (!req.session.user || req.session.user.accessType !== "admin" && req.session.user.accessType !== "faculty") {
        return res.redirect('/');
    }

    const queryObject = url.parse(req.url, true).query;
    const data = queryObject.data;
    const [abbreviation, year] = data.split('-');

    try {
        var degree = await SpeckerDegrees.findOne({ abbreviation });
        degree = degree._id;
        const curriculum = await SpeckerCurriculums.findOne({ year, degree }).populate('degree').populate('years.semesters.subjects');
        const curriculums = await SpeckerCurriculums.find().populate('degree').populate('years.semesters.subjects');
        const colleges = await SpeckerColleges.find();
        const degrees = await SpeckerDegrees.find().populate('college');
        const subjects = await SpeckerSubjects.find().populate('preRequisite').populate('coRequisite').populate('college');

        res.render('a-curriculum-view', {session: req.session, curriculum: curriculum, colleges: colleges, degrees: degrees, subjects: subjects, curriculums: curriculums});
    } catch (err) {
        console.error(err);
        return res.sendStatus(500);
    }
});

//view full curriculum
app.get("/dashboard/curriculum/view/full", async function(req, res){
    if (!req.session.user || req.session.user.accessType !== "admin" && req.session.user.accessType !== "faculty") {
        return res.redirect('/');
    }

    const queryObject = url.parse(req.url, true).query;
    const data = queryObject.data;
    const [abbreviation, year] = data.split('-');

    try {
        let studyPlan;
        var degree = await SpeckerDegrees.findOne({ abbreviation });
        degree = degree._id;
        let curriculum = await SpeckerCurriculums.findOne({ degree, year }).populate('years.semesters.subjects').populate('degree');
        let subjectsLibrary = await SpeckerSubjects.find().populate('preRequisite').populate('coRequisite').populate('college');
        
          if (!curriculum) {
            // Handle case when curriculum is not found
          }
  
          // Create a new study plan document
          studyPlan = new SpeckerStudyPlans({
            student: 1,
            currentYear: 1, // Set initial year
            years: [],
            curriculum: curriculum._id, // Associate the curriculum with the study plan
          });
  
          // Transfer subjects and units from curriculum to study plan
          curriculum.years.forEach((curriculumYear) => {
            const studyPlanYear = {
              yearLevel: curriculumYear.yearLevel,
              semesters: [],
            };
  
            curriculumYear.semesters.forEach((curriculumSemester) => {
              const studyPlanSemester = {
                subjects: [...curriculumSemester.subjects],
                units: curriculumSemester.units,
              };
  
              studyPlanYear.semesters.push(studyPlanSemester);
            });
  
            studyPlan.years.push(studyPlanYear);
          });

        res.render('a-curriculum-edit', {session: req.session, studyplan: studyPlan, curriculum: curriculum, subjects: subjectsLibrary});
    } catch (err) {
        console.error(err);
        return res.sendStatus(500);
    }
});

//delete curriculum
app.post("/dashboard/curriculum/delete", async function(req, res){
    if (!req.session.user || req.session.user.accessType !== "admin" && req.session.user.accessType !== "faculty") {
        return res.redirect('/');
    }

    const {data} = req.body;
    const [abbreviation, year] = data.split('-');

    try {
        var degree = await SpeckerDegrees.findOne({ abbreviation });
        degree = degree._id;
        const curriculum = await SpeckerCurriculums.findOne({ year, degree }).populate('degree').populate('years.semesters.subjects');
        const students = await SpeckerLogins.find({ studentCurriculum: curriculum._id });

        if (students.length > 0) {
            req.session.user.message = "This curriculum still has an enrolled student.";
            return res.redirect('/dashboard/curriculum');
        }

        await SpeckerCurriculums.findOneAndDelete({ year, degree });

        res.redirect('/dashboard/curriculum');
        
    } catch (err) {
        console.error(err);
        return res.sendStatus(500);
    }
});


//Checklist
//main menu
app.get("/dashboard/checklist", async function(req, res){
    if (!req.session.user || req.session.user.accessType !== "student" && req.session.user.accessType !== "faculty") {
        return res.redirect('/');
    }

    try {
        if (req.session.user.accessType == "student") {
            let checklist = await SpeckerChecklists.findOne({ student: req.session.user._id }).populate('student').populate('years.semesters.subjects.subject');
            const curriculum = await SpeckerCurriculums.findOne({ _id: req.session.user.studentCurriculum }).populate('degree').populate('years.semesters.subjects');
            const subjects = await SpeckerSubjects.find().populate('preRequisite').populate('coRequisite').populate('college');
            if (!checklist) {
                const checklistData = {
                    student: req.session.user._id,
                    years: []
                };
                
                if (curriculum.years && Array.isArray(curriculum.years)) {
                    for (const year of curriculum.years) {
                    if (year.semesters && Array.isArray(year.semesters)) {
                        const yearData = {
                        yearLevel: year.yearLevel,
                        semesters: []
                        };
                
                        for (const semester of year.semesters) {
                        const semesterData = {
                            subjects: [],
                            units: parseInt(semester.units) // Copy the units from the semester
                        };
                
                        for (const subject of semester.subjects) {
                            const subjectData = {
                            subject: subject,
                            grade: null,
                            yearTaken: null,
                            semesterTaken: null,
                            schoolAttended: null,
                            approved: false,
                            rejected: false,
                            pending: false
                            };
                
                            semesterData.subjects.push(subjectData);
                        }
                
                        yearData.semesters.push(semesterData);
                        }
                
                        checklistData.years.push(yearData);
                    }
                    }
                }
                

                const checklist = await SpeckerChecklists.create(checklistData);                         
            }

            res.render('s-checklist', {session: req.session, checklist: checklist, subjects: subjects});
        } else if (req.session.user.accessType == "faculty") {
            const students = await SpeckerLogins.find({accessType: "student"}).populate('studentDegree').populate('studentCollege');
            const departmentId = await SpeckerDegrees.findOne({ abbreviation: req.session.user.facultyDepartment }).select('_id');
            const checklists = await SpeckerChecklists.find({ 'years.semesters.subjects.pending': true}).populate('student').populate('years.semesters.subjects.subject');
            const checklistsAll = await SpeckerChecklists.find({
                'years.semesters.subjects': {
                  $not: {
                    $elemMatch: { pending: true }
                  }
                }
              }).populate('student').populate('years.semesters.subjects.subject');
            
            res.render('f-checklist', {session: req.session, people: students, checklists: checklists, checklistsAll: checklistsAll});
        }

        
    } catch (err) {
        console.error(err);
        return res.sendStatus(500);
    }
});

//update checklist
app.post("/dashboard/checklist/update", async function(req, res){
    if (!req.session.user || req.session.user.accessType !== "student") {
        return res.redirect('/');
    }

    try {
        const { subjectCode, grade, year, semesterTaken, schoolAttended } = req.body;

        const checklist = await SpeckerChecklists.findOne({ student: req.session.user._id });

        const subjectReference = await SpeckerSubjects.findOne({ code: subjectCode }).select('_id');

         const yearTaken = year;

        for (const year of checklist.years) {
            for (const semester of year.semesters) {
                for (const subject of semester.subjects) {
                    if (subject.subject._id.toString() === subjectReference._id.toString()) {
                        subject.grade = grade;
                        subject.yearTaken = yearTaken;
                        subject.semesterTaken = semesterTaken;
                        subject.schoolAttended = schoolAttended;
                        subject.pending = true;
                    }
                }
            }
        }

        await checklist.save();

        res.redirect('/dashboard/checklist');
    } catch (err) {
        console.error(err);
        return res.sendStatus(500);
    }
});

//checklist view
app.get("/dashboard/checklist/view", async function(req, res){
    if (!req.session.user || req.session.user.accessType !== "faculty" && req.session.user.accessType !== "student") {
        return res.redirect('/');
    }

    const queryObject = url.parse(req.url, true).query;
    const data = queryObject.data;

    try {
        const student = await SpeckerLogins.findOne({ username: data }).populate('studentDegree').populate('studentCollege').populate('studentCurriculum');
        const checklist = await SpeckerChecklists.findOne({ 'student': student._id }).populate('student').populate('years.semesters.subjects.subject');
        subjects = await SpeckerSubjects.find().populate('preRequisite').populate('coRequisite').populate('college');
        if (req.session.user.accessType == "student") {
            res.render('s-checklist-view', {session: req.session, checklist: checklist, student: student, subjects: subjects});
        } else {
            res.render('f-checklist-view', {session: req.session, checklist: checklist, student: student, subjects: subjects});
        }
    } catch (err) {
        console.error(err);
        return res.sendStatus(500);
    }
});


//approve/reject checklist
app.post("/dashboard/checklist/view/update", async function(req, res) {
    if (!req.session.user || req.session.user.accessType !== "faculty") {
      return res.redirect("/");
    }
  
    try {
      const { studentId, subjectId, status } = req.body;
  
      if (status === "approved" || status === "rejected" || status === "approve_all" || status === "reject_all") {
        const checklist = await SpeckerChecklists.findOne({ student: studentId });
  
        for (const year of checklist.years) {
          for (const semester of year.semesters) {
            const subject = semester.subjects.find(
              (s) => s.subject.toString() === subjectId
            );
            if (subject) {
              subject.pending = false;
              subject.approved = status === "approved";
            } else if (status === "approve_all") {
                semester.subjects.forEach((s) => {
                    if (s.pending) {
                        s.pending = false;
                        s.approved = true;
                    }
                });
            } else if (status === "reject_all") {
                semester.subjects.forEach((s) => {
                    if (s.pending) {
                        s.pending = false;
                        s.rejected = true;
                    }
                });
            }
          }
        }
  
        await checklist.save();

        const studentUsername = await SpeckerLogins.findOne({ _id: studentId }).select('username');
        res.redirect(`/dashboard/checklist/view?data=${studentUsername.username}`);
      } else {
        // Handle invalid status
        res.sendStatus(400);
      }
    } catch (err) {
      console.error(err);
      return res.sendStatus(500);
    }
  });
  
//Studyplan
//main menu
app.get("/dashboard/studyplan", async function(req, res){
    if (!req.session.user || req.session.user.accessType !== "student" && req.session.user.accessType !== 'faculty') {
        return res.redirect('/');
    }

    try {
        if (req.session.user.accessType === "student") {
            const studentId = req.session.user._id;
            const subjects = await SpeckerSubjects.find().populate('preRequisite').populate('coRequisite').populate('college');
            const subjectLibrary = await SpeckerSubjects.find();
            const checklist = await SpeckerChecklists.findOne({ student: studentId }).populate('student').populate('years.semesters.subjects.subject');

            if (!checklist) {
                // Handle case when checklist is not found
                req.session.user.message = "You have not yet created a checklist.";
                return res.redirect('/dashboard');
            }

            // Check if a study plan exists for the student
            let studyPlan = await SpeckerStudyPlans.findOne({ student: studentId }).populate('years.semesters.subjects').populate('approvedBy');

            let curriculum;

            if (!studyPlan) {
                // Create a new study plan
                curriculum = await SpeckerCurriculums.findOne({ _id: req.session.user.studentCurriculum }).populate('years.semesters.subjects');
        
                if (!curriculum) {
                    // Handle case when curriculum is not found
                }

                // Create a new study plan document
                studyPlan = new SpeckerStudyPlans({
                    student: studentId,
                    currentYear: 1, // Set initial year
                    years: [],
                    curriculum: curriculum._id, // Associate the curriculum with the study plan
                    approved: false,
                    rejected: false,
                    pending: false
                });
                
                //Group all subjects into array based on priority level
                const subjectListPriority = {
                    level1: [],
                    level2: [],
                    level3: [],
                    level4: [],
                }

                for (const year of studyPlan.years) {
                    for (const semester of year.semesters) {
                        for (const subject of semester.subjects) {
                            const subjectData = await SpeckerSubjects.findOne({ _id: subject });
                            if (subjectData.category == "Elective Technical Subjects" || subjectData.category == "Professional Technical") {
                                subjectListPriority.level1.push(subjectData);
                            } else if (subjectData.category == "Common Technical Subjects") {
                                subjectListPriority.level2.push(subjectData);
                            } else if (subjectData.category == "Physical Education Subjects" || subjectData.category == "NSTP Subjects") {
                                subjectListPriority.level3.push(subjectData);
                            } else {
                                subjectListPriority.level4.push(subjectData);
                            }
                        }
                    }
                }

                //Group taken subjects 
                const subjectListTaken = [];

                //Transfer subject from subjects from checklist to studyplan
                for (const year of checklist.years) {
                    for (const semester of year.semesters) {
                        for (const subject of semester.subjects) {
                            const subjectData = await SpeckerSubjects.findOne({ _id: subject.subject._id });

                            var subjectTaken = false;

                            if (subject.approved == true || subject.pending == true && subject.grade != "5.00") {
                                subjectTaken = true;
                            }

                            if (subjectData.category == "Elective Technical Subjects" || subjectData.category == "Professional Technical") {
                                subjectData.subjectTaken = subjectTaken;
                                subjectListPriority.level1.push(subjectData);
                            } else if (subjectData.category == "Common Technical Subjects") {
                                subjectData.subjectTaken = subjectTaken;
                                subjectListPriority.level2.push(subjectData);
                            } else if (subjectData.category == "Physical Education Subjects" || subjectData.category == "NSTP Subjects") {
                                subjectData.subjectTaken = subjectTaken;
                                subjectListPriority.level3.push(subjectData);
                            } else {
                                subjectData.subjectTaken = subjectTaken;
                                subjectListPriority.level4.push(subjectData);
                            }
                        }
                    }
                }


                //calculateYearLevel
                const entryYear = Number(req.session.user.username.substring(0, 4));
                const currentDate = DateTime.now().setZone('Asia/Manila').toFormat('yyyy-MM-dd');
                const currentYear = DateTime.now().setZone('Asia/Manila').toFormat('yyyy');
                var currentCalendar = await SpeckerCalendar.findOne({yearStart: currentYear});
                var sem1Start = DateTime.fromJSDate(currentCalendar.sem1Start, { zone: 'UTC' }).toFormat('yyyy-MM-dd');

                if (currentDate < sem1Start) {
                    currentCalendar = await SpeckerCalendar.findOne({ yearStart :(currentCalendar.yearStart - 1)});
                    sem1Start = DateTime.fromJSDate(currentCalendar.sem1Start, { zone: 'UTC' }).toFormat('yyyy-MM-dd');
                }
                
                var sem1End = DateTime.fromJSDate(currentCalendar.sem1End, { zone: 'UTC' }).toFormat('yyyy-MM-dd');
                var sem2Start = DateTime.fromJSDate(currentCalendar.sem2Start, { zone: 'UTC' }).toFormat('yyyy-MM-dd');
                var sem2End = DateTime.fromJSDate(currentCalendar.sem2End, { zone: 'UTC' }).toFormat('yyyy-MM-dd');
                var summerStart = DateTime.fromJSDate(currentCalendar.summerStart, { zone: 'UTC' }).toFormat('yyyy-MM-dd');
                var summerEnd = DateTime.fromJSDate(currentCalendar.summerEnd, { zone: 'UTC' }).toFormat('yyyy-MM-dd');

                const currentYearStanding = currentCalendar.yearStart - entryYear + 1;
                var currentSemStanding;
                if (currentDate >= sem1Start && currentDate <= sem1End) {
                    currentSemStanding = 1;
                } else if (currentDate >= sem2Start && currentDate <= sem2End) {
                    currentSemStanding = 2;
                } else if (currentDate >= summerStart && currentDate <= summerEnd) {
                    currentSemStanding = 3;
                }
                
                //create new studyplan
                for (i = currentYearStanding; i <= 4; i++) {
                    const studyPlanYear = {
                        yearLevel: i,
                        semesters: [],
                    };

                    for (j = 1; j < 4; j++) {
                        const studyPlanSemester = {
                            subjects: [],
                            units: curriculum.years[i-1].semesters[j-1].units,
                        };

                        studyPlanYear.semesters.push(studyPlanSemester);
                    }

                    studyPlan.years.push(studyPlanYear);
                }

                //add two more years
                for (i = 0; i < 2; i++) {
                    const studyPlanYear = {
                        yearLevel: 5 + i,
                        semesters: [],
                    };

                    for (j = 1; j < 4; j++) {
                        const studyPlanSemester = {
                            subjects: [],
                            units: 30,
                        };

                        studyPlanYear.semesters.push(studyPlanSemester);
                    }

                    studyPlan.years.push(studyPlanYear);
                }

                //remove taken subjects from subjectListPriority
                for (i = 0; i < subjectListPriority.level1.length; i++) {
                    if (subjectListPriority.level1[i].subjectTaken == true) {
                        subjectListTaken.push(subjectListPriority.level1[i]);
                        subjectListPriority.level1.splice(i, 1);
                        i--;
                    }
                }
                for (i = 0; i < subjectListPriority.level2.length; i++) {
                    if (subjectListPriority.level2[i].subjectTaken == true) {
                        subjectListTaken.push(subjectListPriority.level2[i]);
                        subjectListPriority.level2.splice(i, 1);
                        i--;
                    }
                }
                for (i = 0; i < subjectListPriority.level3.length; i++) {
                    if (subjectListPriority.level3[i].subjectTaken == true) {
                        subjectListTaken.push(subjectListPriority.level3[i]);
                        subjectListPriority.level3.splice(i, 1);
                        i--;
                    }
                }
                for (i = 0; i < subjectListPriority.level4.length; i++) {
                    if (subjectListPriority.level4[i].subjectTaken == true) {
                        subjectListTaken.push(subjectListPriority.level4[i]);
                        subjectListPriority.level4.splice(i, 1);
                        i--;
                    }
                }

                //add subjects
                var first = true;
                for (const year of studyPlan.years) {
                    if (first && currentYearStanding < 4) {
                        for (i = currentSemStanding; i < 4; i++) {
                            for (let j = 0; j < subjectListPriority.level1.length; j++) {
                                if (subjectListPriority.level1[j].units + countUnits(year.semesters[i - 1]) + countUnits(findCorequisites(subjectListPriority.level1[j])) <= year.semesters[i-1].units &&
                                isOnSemester(subjectListPriority.level1[j], i - 1) &&
                                isOnYearLevel(subjectListPriority.level1[j], year.yearLevel) &&
                                isPreRequisiteTaken(subjectListPriority.level1[j]) &&
                                !isPrerequisiteOnSameSemester(subjectListPriority.level1[j], year.semesters[i-1])) {
                                    //add subject to studyplan
                                    year.semesters[i-1].subjects.push(subjectListPriority.level1[j]);

                                    //if subject has corequisites in subjectListPriority
                                    if (subjectListPriority.level1[j].coRequisite.length > 0) {
                                        var corequisites = findCorequisites(subjectListPriority.level1[j]);
                                        year.semesters[i-1].subjects.push(...corequisites.subjects);
                                            
                                        //remove subject from subjectListPriority loop
                                        for (const cosubject of corequisites.subjects) {
                                            var index;
                                            for (k = 0; k < subjectListPriority.level1.length; k++) {
                                                if (subjectListPriority.level1[k]._id.toString() === cosubject._id.toString()) {
                                                    index = k;
                                                }
                                            }
                                            if (index > -1) {
                                                subjectListTaken.push(subjectListPriority.level1[index]);
                                                subjectListPriority.level1.splice(index, 1);
                                            }
                                        }
                                    }

                                    //remove subject from subjectListPriority
                                    subjectListTaken.push(subjectListPriority.level1[j]);
                                    subjectListPriority.level1.splice(j, 1);
                                    j--;
                                }
                            }
                            for (let j = 0; j < subjectListPriority.level2.length; j++) {
                                if (subjectListPriority.level2[j].units + countUnits(year.semesters[i - 1]) + countUnits(findCorequisites(subjectListPriority.level2[j])) <= year.semesters[i-1].units &&
                                isOnSemester(subjectListPriority.level2[j], i - 1) &&
                                isOnYearLevel(subjectListPriority.level2[j], year.yearLevel) &&
                                isPreRequisiteTaken(subjectListPriority.level2[j]) &&
                                !isPrerequisiteOnSameSemester(subjectListPriority.level2[j], year.semesters[i-1])) {
                                    //add subject to studyplan
                                    year.semesters[i-1].subjects.push(subjectListPriority.level2[j]);

                                    //if subject has corequisites in subjectListPriority
                                    if (subjectListPriority.level2[j].coRequisite.length > 0) {
                                        var corequisites = findCorequisites(subjectListPriority.level2[j]);
                                        year.semesters[i-1].subjects.push(...corequisites.subjects);
                                            
                                        //remove subject from subjectListPriority loop
                                        for (const cosubject of corequisites.subjects) {
                                            var index;
                                            for (k = 0; k < subjectListPriority.level2.length; k++) {
                                                if (subjectListPriority.level2[k]._id.toString() === cosubject._id.toString()) {
                                                    index = k;
                                                }
                                            }
                                            if (index > -1) {
                                                subjectListTaken.push(subjectListPriority.level2[index]);
                                                subjectListPriority.level2.splice(index, 1);
                                            }
                                        }
                                    }

                                    //remove subject from subjectListPriority
                                    subjectListTaken.push(subjectListPriority.level2[j]);
                                    subjectListPriority.level2.splice(j, 1);
                                    j--;
                                }
                            }
                            for (let j = 0; j < subjectListPriority.level3.length; j++) {
                                if (subjectListPriority.level3[j].units + countUnits(year.semesters[i - 1]) + countUnits(findCorequisites(subjectListPriority.level3[j])) <= year.semesters[i-1].units &&
                                isOnSemester(subjectListPriority.level3[j], i - 1) &&
                                isOnYearLevel(subjectListPriority.level3[j], year.yearLevel) &&
                                isPreRequisiteTaken(subjectListPriority.level3[j]) &&
                                !isPrerequisiteOnSameSemester(subjectListPriority.level3[j], year.semesters[i-1])) {
                                    //add subject to studyplan
                                    year.semesters[i-1].subjects.push(subjectListPriority.level3[j]);

                                    //if subject has corequisites in subjectListPriority
                                    if (subjectListPriority.level3[j].coRequisite.length > 0) {
                                        var corequisites = findCorequisites(subjectListPriority.level3[j]);
                                        year.semesters[i-1].subjects.push(...corequisites.subjects);
                                            
                                        //remove subject from subjectListPriority loop
                                        for (const cosubject of corequisites.subjects) {
                                            var index;
                                            for (k = 0; k < subjectListPriority.level3.length; k++) {
                                                if (subjectListPriority.level3[k]._id.toString() === cosubject._id.toString()) {
                                                    index = k;
                                                }
                                            }
                                            if (index > -1) {
                                                subjectListTaken.push(subjectListPriority.level3[index]);
                                                subjectListPriority.level3.splice(index, 1);
                                            }
                                        }
                                    }

                                    //remove subject from subjectListPriority
                                    subjectListTaken.push(subjectListPriority.level3[j]);
                                    subjectListPriority.level3.splice(j, 1);
                                    j--;
                                }
                            }
                            for (let j = 0; j < subjectListPriority.level4.length; j++) {
                                if (subjectListPriority.level4[j].units + countUnits(year.semesters[i - 1]) + countUnits(findCorequisites(subjectListPriority.level4[j])) <= year.semesters[i-1].units &&
                                isOnSemester(subjectListPriority.level4[j], i - 1) &&
                                isOnYearLevel(subjectListPriority.level4[j], year.yearLevel) &&
                                isPreRequisiteTaken(subjectListPriority.level4[j]) &&
                                !isPrerequisiteOnSameSemester(subjectListPriority.level4[j], year.semesters[i-1])) {
                                    //add subject to studyplan
                                    year.semesters[i-1].subjects.push(subjectListPriority.level4[j]);

                                    //if subject has corequisites in subjectListPriority
                                    if (subjectListPriority.level4[j].coRequisite.length > 0) {
                                        var corequisites = findCorequisites(subjectListPriority.level4[j]);
                                        year.semesters[i-1].subjects.push(...corequisites.subjects);
                                            
                                        //remove subject from subjectListPriority loop
                                        for (const cosubject of corequisites.subjects) {
                                            var index;
                                            for (k = 0; k < subjectListPriority.level4.length; k++) {
                                                if (subjectListPriority.level4[k]._id.toString() === cosubject._id.toString()) {
                                                    index = k;
                                                }
                                            }
                                            if (index > -1) {
                                                subjectListTaken.push(subjectListPriority.level4[index]);
                                                subjectListPriority.level4.splice(index, 1);
                                            }
                                        }
                                    }

                                    //remove subject from subjectListPriority
                                    subjectListTaken.push(subjectListPriority.level4[j]);
                                    subjectListPriority.level4.splice(j, 1);
                                    j--;
                                }
                            }
                        }
                        first = false;
                    } else {
                        for (const semester of year.semesters) {
                            for (let j = 0; j < subjectListPriority.level1.length; j++) {
                                if (subjectListPriority.level1[j].units + countUnits(semester) + countUnits(findCorequisites(subjectListPriority.level1[j])) <= semester.units &&
                                isOnSemester(subjectListPriority.level1[j], year.semesters.indexOf(semester)) &&
                                isOnYearLevel(subjectListPriority.level1[j], year.yearLevel) &&
                                isPreRequisiteTaken(subjectListPriority.level1[j]) &&
                                !isPrerequisiteOnSameSemester(subjectListPriority.level1[j], semester)) {
                                    //add subject to studyplan
                                    semester.subjects.push(subjectListPriority.level1[j]);

                                    //if subject has corequisites in subjectListPriority
                                    if (subjectListPriority.level1[j].coRequisite.length > 0) {
                                        var corequisites = findCorequisites(subjectListPriority.level1[j]);
                                        semester.subjects.push(...corequisites.subjects);
                                            
                                        //remove subject from subjectListPriority loop
                                        for (const cosubject of corequisites.subjects) {
                                            var index;
                                            for (k = 0; k < subjectListPriority.level1.length; k++) {
                                                if (subjectListPriority.level1[k]._id.toString() === cosubject._id.toString()) {
                                                    index = k;
                                                }
                                            }
                                            if (index > -1) {
                                                subjectListTaken.push(subjectListPriority.level1[index]);
                                                subjectListPriority.level1.splice(index, 1);
                                            }
                                        }
                                    }

                                    //remove subject from subjectListPriority
                                    subjectListTaken.push(subjectListPriority.level1[j]);
                                    subjectListPriority.level1.splice(j, 1);
                                    j--;
                                }
                            }
                            for (let j = 0; j < subjectListPriority.level2.length; j++) {
                                if (subjectListPriority.level2[j].units + countUnits(semester) + countUnits(findCorequisites(subjectListPriority.level2[j])) <= semester.units &&
                                isOnSemester(subjectListPriority.level2[j], year.semesters.indexOf(semester)) &&
                                isOnYearLevel(subjectListPriority.level2[j], year.yearLevel) &&
                                isPreRequisiteTaken(subjectListPriority.level2[j]) &&
                                !isPrerequisiteOnSameSemester(subjectListPriority.level2[j], semester)) {
                                    //add subject to studyplan
                                    semester.subjects.push(subjectListPriority.level2[j]);
                                        
                                    //if subject has corequisites in subjectListPriority
                                    if (subjectListPriority.level2[j].coRequisite.length > 0) {
                                        var corequisites = findCorequisites(subjectListPriority.level2[j]);
                                        semester.subjects.push(...corequisites.subjects);
                                            
                                        //remove subject from subjectListPriority loop
                                        for (const cosubject of corequisites.subjects) {
                                            var index;
                                            for (k = 0; k < subjectListPriority.level2.length; k++) {
                                                if (subjectListPriority.level2[k]._id.toString() === cosubject._id.toString()) {
                                                    index = k;
                                                }
                                            }
                                            if (index > -1) {
                                                subjectListTaken.push(subjectListPriority.level2[index]);
                                                subjectListPriority.level2.splice(index, 1);
                                            }
                                        }
                                    }

                                    //remove subject from subjectListPriority
                                    subjectListTaken.push(subjectListPriority.level2[j]);
                                    subjectListPriority.level2.splice(j, 1);
                                    j--;
                                }
                            }
                            for (let j = 0; j < subjectListPriority.level3.length; j++) {
                                if (subjectListPriority.level3[j].units + countUnits(semester) + countUnits(findCorequisites(subjectListPriority.level3[j])) <= semester.units &&
                                isOnSemester(subjectListPriority.level3[j], year.semesters.indexOf(semester)) &&
                                isOnYearLevel(subjectListPriority.level3[j], year.yearLevel) &&
                                isPreRequisiteTaken(subjectListPriority.level3[j]) &&
                                !isPrerequisiteOnSameSemester(subjectListPriority.level3[j], semester)) {
                                    //add subject to studyplan
                                    semester.subjects.push(subjectListPriority.level3[j]);

                                    //if subject has corequisites in subjectListPriority
                                    if (subjectListPriority.level3[j].coRequisite.length > 0) {
                                        var corequisites = findCorequisites(subjectListPriority.level3[j]);
                                        semester.subjects.push(...corequisites.subjects);
                                            
                                        //remove subject from subjectListPriority loop
                                        for (const cosubject of corequisites.subjects) {
                                            var index;
                                            for (k = 0; k < subjectListPriority.level3.length; k++) {
                                                if (subjectListPriority.level3[k]._id.toString() === cosubject._id.toString()) {
                                                    index = k;
                                                }
                                            }
                                            if (index > -1) {
                                                subjectListTaken.push(subjectListPriority.level3[index]);
                                                subjectListPriority.level3.splice(index, 1);
                                            }
                                        }
                                    }

                                    //remove subject from subjectListPriority
                                    subjectListTaken.push(subjectListPriority.level3[j]);
                                    subjectListPriority.level3.splice(j, 1);
                                    j--;
                                }
                            }
                            for (let j = 0; j < subjectListPriority.level4.length; j++) {
                                if (subjectListPriority.level4[j].units + countUnits(semester) + countUnits(findCorequisites(subjectListPriority.level4[j])) <= semester.units &&
                                isOnSemester(subjectListPriority.level4[j], year.semesters.indexOf(semester)) &&
                                isOnYearLevel(subjectListPriority.level4[j], year.yearLevel) &&
                                isPreRequisiteTaken(subjectListPriority.level4[j]) &&
                                !isPrerequisiteOnSameSemester(subjectListPriority.level4[j], semester)) {
                                    //add subject to studyplan
                                    semester.subjects.push(subjectListPriority.level4[j]);

                                    //if subject has corequisites in subjectListPriority
                                    if (subjectListPriority.level4[j].coRequisite.length > 0) {
                                        var corequisites = findCorequisites(subjectListPriority.level4[j]);
                                        semester.subjects.push(...corequisites.subjects);
                                            
                                        //remove subject from subjectListPriority loop
                                        for (const cosubject of corequisites.subjects) {
                                            var index;
                                            for (k = 0; k < subjectListPriority.level4.length; k++) {
                                                if (subjectListPriority.level4[k]._id.toString() === cosubject._id.toString()) {
                                                    index = k;
                                                }
                                            }
                                            if (index > -1) {
                                                subjectListTaken.push(subjectListPriority.level4[index]);
                                                subjectListPriority.level4.splice(index, 1);
                                            }
                                        }
                                    }

                                    //remove subject from subjectListPriority
                                    subjectListTaken.push(subjectListPriority.level4[j]);
                                    subjectListPriority.level4.splice(j, 1);
                                    j--;
                                }
                            }
                        }
                    }
                }

                //count all units per semester
                function countUnits(semester) {
                    var totalUnits = 0;
                    if (semester.subjects.length > 0) {
                        for (const subject of semester.subjects) {
                            totalUnits += subject.units;
                        }
                    }
                    return totalUnits;
                }
                
                //is on right yearLevel
                function isOnYearLevel(subject, yearLevel) {
                    var isOnYearLevel = false;
                    if (!subject.yearStanding) {
                        subject.yearStanding = 1;
                    }
                    if (subject.yearStanding < yearLevel) {
                        isOnYearLevel = true;
                    }
                    return isOnYearLevel;
                }

                //is on the right semester
                function isOnSemester(subject, semester) {
                    var isOnSemester = false;
                    if (subject.sem1 && semester == 0) {
                        isOnSemester = true;
                    } else if (subject.sem2 && semester == 1) {
                        isOnSemester = true;
                    } else if (subject.summer && semester == 2) {
                        isOnSemester = true;
                    }
                    return isOnSemester;
                }

                //find corequisites data
                function findCorequisites(subject) {
                    var corequisites = {
                        subjects: []
                    };
                    for (const subjectid of subject.coRequisite) {
                        //find subject in subjectsListPriority
                        var subjectData = subjectListPriority.level1.find(subject => subject._id.toString() === subjectid.toString())
                        if (subjectData) {
                            corequisites.subjects.push(subjectData);
                        }
                    }
                    for (const subjectid of subject.coRequisite) {
                        //find subject in subjectsListPriority
                        var subjectData = subjectListPriority.level2.find(subject => subject._id.toString() === subjectid.toString())
                        if (subjectData) {
                            corequisites.subjects.push(subjectData);
                        }
                    }
                    for (const subjectid of subject.coRequisite) {
                        //find subject in subjectsListPriority
                        var subjectData = subjectListPriority.level3.find(subject => subject._id.toString() === subjectid.toString())
                        if (subjectData) {
                            corequisites.subjects.push(subjectData);
                        }
                    }
                    for (const subjectid of subject.coRequisite) {
                        //find subject in subjectsListPriority
                        var subjectData = subjectListPriority.level4.find(subject => subject._id.toString() === subjectid.toString())
                        if (subjectData) {
                            corequisites.subjects.push(subjectData);
                        }
                    }
                    return corequisites;
                }

                // is preRequisite taken recursive
                function isPreRequisiteTaken(subject) {
                    if (subject.preRequisite.length <= 0) {
                        // If there are no prerequisites, return true
                        return true;
                    }
                
                    for (const preRequisite of subject.preRequisite) {
                        // find subject in subjectListTaken
                        var subjectData = subjectListTaken.find(subject => subject._id.toString() === preRequisite.toString())

                        if (!subjectData) {
                            // If a prerequisite is not taken, return false
                            return false;
                        }

                        // If a prerequisite is taken, and it has prerequisites, check if they are taken
                        if (subjectData.preRequisite.length > 0) {
                            if (!isPreRequisiteTaken(subjectData, true)) {
                                return false;
                            }
                        }
                    }
                
                    // If all prerequisites are taken, return true
                    return true;
                }
                
                // is subject being placed on the same semester as its prerequisite as well as the prerequisite of its prerequisite
                function isPrerequisiteOnSameSemester(subject, semester) {
                    if (subject.preRequisite.length <= 0) {
                        // If there are no prerequisites, return false
                        return false;
                    }
                    
                    var prerequisiteList = generatePrerequisiteList(subject);

                    for (const prerequisite of prerequisiteList) {
                        for (const subject of semester.subjects) {
                            if (subject._id.toString() === prerequisite.toString()) {
                                return true;
                            }
                        }
                    }

                    return false;
                }
                
                //generate the list of prerequisite and the prerequisite of the prerequisite
                function generatePrerequisiteList(subject) {
                    if (subject.preRequisite.length <= 0) {
                        // If there are no prerequisites, return false
                        return null;
                    }

                    var prerequisiteList = [];

                    for (const preRequisite of subject.preRequisite) {
                        // find subject in subjectLibrary
                        var subjectData = subjectLibrary.find(subject => subject._id.toString() === preRequisite.toString())

                        if (!subjectData) {
                            // no prerequisite
                            return;
                        }

                        //there is a prerequisite
                        prerequisiteList.push(subjectData._id);

                        // push prerequisite of prerequisite if there is
                        if (subjectData.preRequisite.length > 0) {
                            if(generatePrerequisiteList(subjectData)) {
                                prerequisiteList.push(...generatePrerequisiteList(subjectData));
                            }
                        }
                    }

                    return prerequisiteList;
                }

                // Save the new study plan
                await studyPlan.save();
            } else {
                // Study plan already exists, populate its curriculum
                //curriculum = await SpeckerCurriculums.findOne({ _id: studyPlan.curriculum }).populate('years.semesters.subjects');
            }

            // Render the study plan view with the updated data
            res.render('s-studyplan', { session: req.session, studyplan: studyPlan, curriculum: curriculum, subjects: subjects , checklist: studyPlan});
        } else if (req.session.user.accessType === 'faculty') {
            const students = await SpeckerLogins.find({accessType: "student"}).populate('studentDegree').populate('studentCollege');
            const departmentId = await SpeckerDegrees.findOne({ abbreviation: req.session.user.facultyDepartment }).select('_id');
            const studyplans = await SpeckerStudyPlans.find({ 'pending': true}).populate('student').populate('years.semesters.subjects.subject');
            const studyplansAll = await SpeckerStudyPlans.find({ 'approved': true}).populate('student').populate('years.semesters.subjects.subject');
            
    
            res.render('f-studyplan', {session: req.session, people: students, studyplans: studyplans, studyplansAll: studyplansAll});
          }
    } catch (err) {
        console.error(err);
        return res.sendStatus(500);
    }
});


//view studyplan
app.get('/dashboard/studyplan/view', async function(req, res) {
    if (!req.session.user || req.session.user.accessType !== 'student' && req.session.user.accessType !== "faculty") {
      return res.redirect('/');
    }
  
    try {
      if (req.session.user.accessType === 'student') {
        const studentId = req.session.user._id;
        const subjects = await SpeckerSubjects.find().populate('preRequisite').populate('coRequisite').populate('college');
  
        // Check if a study plan exists for the student
        let studyPlan = await SpeckerStudyPlans.findOne({ student: studentId }).populate('years.semesters.subjects').populate('approvedBy');
        let curriculum = await SpeckerCurriculums.findOne({ _id: studyPlan.curriculum }).populate('years.semesters.subjects');

        // Render the study plan view with the updated data
        res.render('s-studyplan-view', { session: req.session, studyplan: studyPlan, curriculum: curriculum, subjects: subjects });
      } else {
        const queryObject = url.parse(req.url, true).query;
        const data = queryObject.data;

        const student = await SpeckerLogins.findOne({ username: data }).populate('studentDegree').populate('studentCollege').populate('studentCurriculum');
        let studyplan = await SpeckerStudyPlans.findOne({ 'student': student._id }).populate('student').populate('years.semesters.subjects').populate('approvedBy');
        const curriculum = await SpeckerCurriculums.findOne({ _id: studyplan.student.studentCurriculum });
        const degree = await SpeckerDegrees.findOne({ _id: studyplan.student.studentDegree });
        const college = await SpeckerColleges.findOne({ _id: studyplan.student.studentCollege });
        studyplan.student.studentCurriculum = curriculum;
        studyplan.student.studentDegree = degree;
        studyplan.student.studentCollege = college;

        const subjects = await SpeckerSubjects.find().populate('preRequisite').populate('coRequisite').populate('college');

        res.render('f-studyplan-view', {session: req.session, studyplan: studyplan, student: student, subjects: subjects});
      }
    } catch (err) {
      console.error(err);
      return res.sendStatus(500);
    }
  });
  
//update studyplan
app.post('/dashboard/studyplan/update', async function(req, res) {
    if (!req.session.user || req.session.user.accessType !== 'student') {
        return res.redirect('/');
    }
  
    try {
        var { studyplan } = req.body;
    
        studyplan = JSON.parse(studyplan);

        const studentId = req.session.user._id;
        const studyPlan = await SpeckerStudyPlans.findOne({ student: studentId });

        //add the subject reference
        // Collect all subject codes
        let allSubjectCodes = [];

        for (let key in studyplan) {
        if (studyplan.hasOwnProperty(key)) {
            const semesters = studyplan[key].semesters;

            for (let semester of semesters) {
            allSubjectCodes.push(...semester.subjects);
            }
        }
        }

        // Remove duplicate subject codes, if any
        allSubjectCodes = [...new Set(allSubjectCodes)];

        // Query the database for all subjects at once
        const subjects = await SpeckerSubjects.find({ code: { $in: allSubjectCodes } }).select('code _id');

        // Map subjects to a dictionary for quick lookup
        const subjectMap = {};
        subjects.forEach(subject => {
        subjectMap[subject.code] = subject._id;
        });

        // Update the studyplan with subject references
        for (let key in studyplan) {
        if (studyplan.hasOwnProperty(key)) {
            const semesters = studyplan[key].semesters;

            for (let semester of semesters) {
            semester.subjects = semester.subjects.map(subjectCode => subjectMap[subjectCode]);
            }
        }
        }

        // Update the study plan
        studyPlan.years = [];
        for (let key in studyplan) {
            studyPlan.years.push(studyplan[key]);
        }

        //copy units from curriculum
        const curriculum = await SpeckerCurriculums.findOne({ _id: req.session.user.studentCurriculum }).populate('years.semesters.subjects');
        for (let i = 0; i < studyPlan.years.length; i++) {
            for (let j = 0; j < studyPlan.years[i].semesters.length; j++) {
                studyPlan.years[i].semesters[j].units = curriculum.years[i].semesters[j].units;
            }
        }

        studyPlan.pending = true;
        studyPlan.approved = false;
        studyPlan.rejected = false;

        await studyPlan.save();

    
        res.redirect('/dashboard/studyplan');
    } catch (err) {
        console.error(err);
        return res.sendStatus(500);
    }
});
  
//approve/reject studyplan
app.post("/dashboard/studyplan/view/update", async function(req, res) {
    if (!req.session.user || req.session.user.accessType !== "faculty") {
      return res.redirect("/");
    }
  
    try {
      const { studentUsername, status } = req.body;
  
      if (status === "approved" || status === "rejected") {
        const studentId = await SpeckerLogins.findOne({ username: studentUsername }).select('_id');
        const studyPlan = await SpeckerStudyPlans.findOne({ student: studentId });

        studyPlan.pending = false;
        if (status === "approved") {
            studyPlan.approved = true;
            studyPlan.approvalDate = date;
            studyPlan.approvedBy = req.session.user._id;
        }
        studyPlan.rejected = status === "rejected";

        await studyPlan.save();

        res.redirect(`/dashboard/studyplan/view?data=${studentUsername}`);
      } else {
        // Handle invalid status
        res.sendStatus(400);
      }
    } catch (err) {
        console.error(err);
        return res.sendStatus(500);
    }
});

//Help Center
app.get("/dashboard/account/helpcenter", async function(req, res){
    if (!req.session.user) {
        return res.redirect('/');
    }

    try {
        if(req.session.user.accessType === "admin") {
            res.render('f-helpcenter', {session: req.session});
        } else if (req.session.user.accessType === "faculty") {
            res.render('f-helpcenter', {session: req.session});
        } else if (req.session.user.accessType === "student") {
            res.render('a-helpcenter', {session: req.session});
        }
    } catch (err) {
        console.error(err);
        return res.sendStatus(500);
    }
});

//Calendar
//main menu
app.get("/dashboard/calendar", async function(req, res){
    if (!req.session.user || req.session.user.accessType !== "admin") {
        return res.redirect('/');
    }

    try {
            let calendars = await SpeckerCalendar.find();
            let calendar = [];

            //Convert all dates to string and push to calendar
            for (let i = 0; i < calendars.length; i++) {
                calendar.push({
                    yearStart: calendars[i].yearStart,
                    sem1Start: new Intl.DateTimeFormat('en-US', { month: 'long', day: 'numeric', year: 'numeric' }).format(new Date(calendars[i].sem1Start)),
                    sem1End: new Intl.DateTimeFormat('en-US', { month: 'long', day: 'numeric', year: 'numeric' }).format(new Date(calendars[i].sem1End)),
                    sem2Start: new Intl.DateTimeFormat('en-US', { month: 'long', day: 'numeric', year: 'numeric' }).format(new Date(calendars[i].sem2Start)),
                    sem2End: new Intl.DateTimeFormat('en-US', { month: 'long', day: 'numeric', year: 'numeric' }).format(new Date(calendars[i].sem2End)),
                    summerStart: new Intl.DateTimeFormat('en-US', { month: 'long', day: 'numeric', year: 'numeric' }).format(new Date(calendars[i].summerStart)),
                    summerEnd: new Intl.DateTimeFormat('en-US', { month: 'long', day: 'numeric', year: 'numeric' }).format(new Date(calendars[i].summerEnd))
                });
            }

            res.render('a-calendar', {session: req.session, calendar: calendar});
    } catch (err) {
        console.error(err);
        return res.sendStatus(500);
    }
});

//add
app.post("/dashboard/calendar/add", async function(req, res){
    if (!req.session.user || req.session.user.accessType !== "admin") {
        return res.redirect('/');
    }

    try {
        let { yearStart, sem1Start, sem1End, sem2Start, sem2End, summerStart, summerEnd } = req.body;

        const calendar = await SpeckerCalendar.findOne({ yearStart });
        if (calendar) {
            req.session.user.message = "This calendar is already added.";
            return res.redirect('/dashboard/calendar');
        }

        //convert to date
        sem1Start = new Date(sem1Start);
        sem1End = new Date(sem1End);
        sem2Start = new Date(sem2Start);
        sem2End = new Date(sem2End);
        summerStart = new Date(summerStart);
        summerEnd = new Date(summerEnd);

        const calendarData = {
            yearStart,
            sem1Start,
            sem1End,
            sem2Start,
            sem2End,
            summerStart,
            summerEnd
        };

        const newCalendar = await SpeckerCalendar.create(calendarData);

        res.redirect('/dashboard/calendar');
    } catch (err) {
        console.error(err);
        return res.sendStatus(500);
    }
});


//view
app.get("/dashboard/calendar/view", async function(req, res){
    if (!req.session.user || req.session.user.accessType !== "admin") {
        return res.redirect('/');
    }

    try {
        const queryObject = url.parse(req.url, true).query;
        const data = queryObject.data;

        let calendars = await SpeckerCalendar.find();
        let calendar = [{
            yearStart: "",
            sem1Start: "",
            sem1End: "",
            sem2Start: "",
            sem2End: "",
            summerStart: "",
            summerEnd: ""
        }];

        //Convert all dates to string and push to calendar
        for (let i = 0; i < calendars.length; i++) {
            calendar[i] = {
                yearStart: calendars[i].yearStart,
                sem1Start: new Intl.DateTimeFormat('en-US', { month: 'long', day: 'numeric', year: 'numeric' }).format(new Date(calendars[i].sem1Start)),
                sem1End: new Intl.DateTimeFormat('en-US', { month: 'long', day: 'numeric', year: 'numeric' }).format(new Date(calendars[i].sem1End)),
                sem2Start: new Intl.DateTimeFormat('en-US', { month: 'long', day: 'numeric', year: 'numeric' }).format(new Date(calendars[i].sem2Start)),
                sem2End: new Intl.DateTimeFormat('en-US', { month: 'long', day: 'numeric', year: 'numeric' }).format(new Date(calendars[i].sem2End)),
                summerStart: new Intl.DateTimeFormat('en-US', { month: 'long', day: 'numeric', year: 'numeric' }).format(new Date(calendars[i].summerStart)),
                summerEnd: new Intl.DateTimeFormat('en-US', { month: 'long', day: 'numeric', year: 'numeric' }).format(new Date(calendars[i].summerEnd))
            };
        }

        const calendarView = await SpeckerCalendar.findOne({ yearStart: data });
        let calendarViewing = {
            yearStart: "",
            sem1: "",
            sem2: "",
            summer: "",
            sem1Input: "",
            sem2Input: "",
            summerInput: ""
        };

        calendarViewing.yearStart = calendarView.yearStart;
        calendarViewing.sem1StartInput = calendarView.sem1Start.toISOString().split('T')[0];
        calendarViewing.sem1Start = new Intl.DateTimeFormat('en-US', { month: 'long', day: 'numeric', year: 'numeric' }).format(new Date(calendarView.sem1Start));
        calendarViewing.sem1EndInput = calendarView.sem1End.toISOString().split('T')[0];
        calendarViewing.sem1End = new Intl.DateTimeFormat('en-US', { month: 'long', day: 'numeric', year: 'numeric' }).format(new Date(calendarView.sem1End));
        calendarViewing.sem2StartInput = calendarView.sem2Start.toISOString().split('T')[0];
        calendarViewing.sem2Start = new Intl.DateTimeFormat('en-US', { month: 'long', day: 'numeric', year: 'numeric' }).format(new Date(calendarView.sem2Start));
        calendarViewing.sem2EndInput = calendarView.sem2End.toISOString().split('T')[0];
        calendarViewing.sem2End = new Intl.DateTimeFormat('en-US', { month: 'long', day: 'numeric', year: 'numeric' }).format(new Date(calendarView.sem2End));
        calendarViewing.summerStartInput = calendarView.summerStart.toISOString().split('T')[0];
        calendarViewing.summerStart = new Intl.DateTimeFormat('en-US', { month: 'long', day: 'numeric', year: 'numeric' }).format(new Date(calendarView.summerStart));
        calendarViewing.summerEndInput = calendarView.summerEnd.toISOString().split('T')[0];
        calendarViewing.summerEnd = new Intl.DateTimeFormat('en-US', { month: 'long', day: 'numeric', year: 'numeric' }).format(new Date(calendarView.summerEnd));

        res.render('a-calendar-view', {session: req.session, calendar: calendar, calendarView: calendarViewing});
    } catch (err) {
        console.error(err);
        return res.sendStatus(500);
    }
});

//edit
app.post("/dashboard/calendar/edit", async function(req, res){
    if (!req.session.user || req.session.user.accessType !== "admin") {
        return res.redirect('/');
    }

    try {
        let { oldYearStart, yearStart, sem1Start, sem1End, sem2Start, sem2End, summerStart, summerEnd  } = req.body;

        //if yearStart exists except oldYearStart
        const existingCalendar = await SpeckerCalendar.findOne({ yearStart: { $eq : yearStart, $ne: oldYearStart } });
        if (existingCalendar) {
            req.session.user.message = "This calendar is already added.";
            return res.redirect('/dashboard/calendar');
        }


        //convert to date
        sem1Start = new Date(sem1Start);
        sem1End = new Date(sem1End);
        sem2Start = new Date(sem2Start);
        sem2End = new Date(sem2End);
        summerStart = new Date(summerStart);
        summerEnd = new Date(summerEnd);

        await SpeckerCalendar.findOneAndUpdate({ yearStart : oldYearStart }, { yearStart, sem1Start, sem1End, sem2Start, sem2End, summerStart, summerEnd });

        res.redirect('/dashboard/calendar');
    } catch (err) {
        console.error(err);
        return res.sendStatus(500);
    }
});

//delete
app.post("/dashboard/calendar/delete", async function(req, res){
    if (!req.session.user || req.session.user.accessType !== "admin") {
        return res.redirect('/');
    }

    try {
        const { yearStart } = req.body;

        await SpeckerCalendar.findOneAndDelete({ yearStart });

        res.redirect('/dashboard/calendar');
    } catch (err) {
        console.error(err);
        return res.sendStatus(500);
    }
});

//Acount Settings
app.get("/dashboard/account/settings", async function(req, res){
    if (!req.session.user) {
        return res.redirect('/');
    }

    try {
        if(req.session.user.accessType === "admin") {
            res.render('a-settings', {session: req.session});
        } else if (req.session.user.accessType === "faculty") {
            res.render('f-settings', {session: req.session});
        } else if (req.session.user.accessType === "student") {
            res.render('s-settings', {session: req.session});
        }
    } catch (err) {
        console.error(err);
        return res.sendStatus(500);
    }
});

//change password
app.post("/dashboard/account/settings/changepassword", async function(req, res){
    if (!req.session.user) {
        return res.redirect('/');
    }

    try {
        const { currentPassword, newPassword, confirmPassword } = req.body;

        if (newPassword !== confirmPassword) {
            req.session.user.message = "Passwords do not match.";
            return res.redirect('/dashboard/account/settings');
        }

        const user = await SpeckerLogins.findOne({ _id: req.session.user._id });

        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            req.session.user.message = "Current password is incorrect.";
            return res.redirect('/dashboard/account/settings');
        }

        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(newPassword, salt);

        await user.save();

        res.redirect('/dashboard/account/settings');
    } catch (err) {
        console.error(err);
        return res.sendStatus(500);
    }
});

app.listen(process.env.PORT || 3000, function(){
    console.log("Server started");
});

