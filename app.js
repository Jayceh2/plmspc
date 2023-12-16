const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const url = require('url');
const bcrypt = require('bcrypt');
const { parse } = require('path');
const { create } = require('domain');
require('dotenv').config();

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
    includeInGWA: Boolean
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
                yearTaken: Number,
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
    }]
});
const SpeckerStudyPlans = mongoose.model('studyplans', studyPlanSchema);


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
    const userDetails = await SpeckerLogins.findOne({ username: req.body.username }).populate('facultyCollege').populate('facultyDepartment');

    if (userDetails && bcrypt.compareSync(req.body.password, userDetails.password)) {
        const { _id, accessType, firstName, middleInitial, lastName, facultyCollege, facultyDepartment, lightMode, studentDegree, studentCurriculum } = userDetails;
        
        const sessionUser = {
            _id,
            accessType,
            username: req.body.username,
            firstName,
            middleInitial,
            lastName,
            facultyCollege,
            facultyDepartment,
            studentDegree,
            studentCurriculum,
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
            //const checkliststudents = await SpeckerChecklistStudent.find({ "subjects": { "$elemMatch": { "approved": false, "rejected": false } } });
            //const subjects = await SpeckerSubjects.find();
            //const logins = await SpeckerLogins.find().select('username firstName middleInitial lastName studentType studentDegree');
            //const student = req.body.studentNumber;
    
            //res.render('f-dashboard', { session: req.session, checkliststudents, subjects, logins });
            res.render('f-dashboard', { session: req.session });
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
        console.log(employedFaculty);
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
        var { code, name, units, preRequisite, coRequisite, category, sem1, sem2, summer, includeInGWA} = req.body;
        var college = req.body.college.split(" ").shift();
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

        includeInGWA = includeInGWA === 'Yes' ? true : false;
        sem1 = sem1 === 'true' ? true : false;
        sem2 = sem2 === 'true' ? true : false;
        summer = summer === 'true' ? true : false;

        preRequisite = preRequisite.split(',').map(item => item.trim()).filter(item => item.length > 0).map(item => item.split('-')[0].trim());

        coRequisite = coRequisite.split(',').map(item => item.trim()).filter(item => item.length > 0).map(item => item.split('-')[0].trim());

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

        await SpeckerSubjects.create({_id, code, name, units, preRequisite, coRequisite, category, sem1, sem2, summer, includeInGWA, college });

        res.redirect('/dashboard/subjects');
    } catch (err) {
        console.error(err);
        return res.sendStatus(500);
    }
});

//edit subject
app.post('/dashboard/subjects/edit', async function(req, res) {
    if (!req.session.user || req.session.user.accessType !== 'admin') {
        return res.redirect('/');
    }

    try {
        const subjects = await SpeckerSubjects.find().populate('preRequisite').populate('coRequisite').populate('college');
        const colleges = await SpeckerColleges.find();
        var { oldCode, oldName, code, name, units, preRequisite, coRequisite, category, sem1, sem2, summer, includeInGWA } = req.body;
        var college = req.body.college.split(" ").shift();
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

        includeInGWA = includeInGWA === 'Yes' ? true : false;
        sem1 = sem1 === 'true' ? true : false;
        sem2 = sem2 === 'true' ? true : false;
        summer = summer === 'true' ? true : false;

        preRequisite = preRequisite.split(',').map(item => item.trim()).filter(item => item.length > 0).map(item => item.split('-')[0].trim());
        coRequisite = coRequisite.split(',').map(item => item.trim()).filter(item => item.length > 0).map(item => item.split('-')[0].trim());

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
        
        await SpeckerSubjects.findOneAndUpdate({ code: oldCode }, { code, name, units, preRequisite, coRequisite, category, sem1, sem2, summer, includeInGWA, college });

        res.redirect('/dashboard/subjects');
    } catch (err) {
        console.error(err);
        return res.sendStatus(500);
    }
});

//delete subject
app.post('/dashboard/subjects/delete', async function(req, res) {
    if (!req.session.user || req.session.user.accessType !== 'admin') {
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
    if (!req.session.user || req.session.user.accessType !== "admin") {
        return res.redirect('/');
    }

    const queryObject = url.parse(req.url, true).query;
    const data = queryObject.data;

    try {
        const faculty = await SpeckerLogins.find({accessType: "faculty"}).populate('facultyCollege').populate('facultyDepartment');
        const colleges = await SpeckerColleges.find();
        const degrees = await SpeckerDegrees.find().populate('college');
        res.render('a-accounts-view', {session: req.session, people: faculty, colleges: colleges, degrees: degrees, data: data});
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
app.post("/dashboard/accounts/edit", async function(req, res){
    if (!req.session.user || req.session.user.accessType !== "admin") {
        return res.redirect('/');
    }

    const queryObject = url.parse(req.url, true).query;
    const data = queryObject.data;

    try {
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
    } catch (err) {
        console.error(err);
        return res.sendStatus(500);
    }
});

//change password
app.post("/dashboard/accounts/changepassword", async function(req, res){
    if (!req.session.user || req.session.user.accessType !== "admin") {
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

//delete faculty
app.post("/dashboard/accounts/delete", async function(req, res){
    if (!req.session.user || req.session.user.accessType !== "admin") {
        return res.redirect('/');
    }

    try {
        const { username } = req.body;
        
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
    if (!req.session.user || req.session.user.accessType !== "admin") {
        return res.redirect('/');
    }

    try {
        const colleges = await SpeckerColleges.find();
        const degrees = await SpeckerDegrees.find().populate('college');
        const subjects = await SpeckerSubjects.find().populate('preRequisite').populate('coRequisite').populate('college');
        const curriculums = await SpeckerCurriculums.find().populate('degree').populate('years.semesters.subjects');
        res.render('a-curriculum', {session: req.session, colleges: colleges, degrees: degrees, subjects: subjects, curriculums: curriculums});
    } catch (err) {
        console.error(err);
        return res.sendStatus(500);
    }
});

//add curriculum
//get
app.get("/dashboard/curriculum/add", async function(req, res){
    if (!req.session.user || req.session.user.accessType !== "admin") {
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
    if (!req.session.user || req.session.user.accessType !== "admin") {
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
    if (!req.session.user || req.session.user.accessType !== "admin") {
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

//edit curriculum
app.get("/dashboard/curriculum/edit", async function(req, res){
    if (!req.session.user || req.session.user.accessType !== "admin") {
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

        res.render('a-curriculum-edit', {session: req.session, curriculum: curriculum, colleges: colleges, degrees: degrees, subjects: subjects, curriculums: curriculums});
    } catch (err) {
        console.error(err);
        return res.sendStatus(500);
    }
});

//delete curriculum


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

            res.render('s-checklist', {session: req.session, checklist: checklist});
        } else if (req.session.user.accessType == "faculty") {
            const students = await SpeckerLogins.find({accessType: "student"}).populate('studentDegree').populate('studentCollege');
            const departmentId = await SpeckerDegrees.findOne({ abbreviation: req.session.user.facultyDepartment }).select('_id');
            const checklists = await SpeckerChecklists.find({ 'years.semesters.subjects.pending': true}).populate('student').populate('years.semesters.subjects.subject');
            
            res.render('f-checklist', {session: req.session, people: students, checklists: checklists});
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
        const { subjectCode, grade, yearTaken, semesterTaken, schoolAttended } = req.body;

        const checklist = await SpeckerChecklists.findOne({ student: req.session.user._id });

        const subjectReference = await SpeckerSubjects.findOne({ code: subjectCode }).select('_id');

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
    if (!req.session.user || req.session.user.accessType !== "faculty") {
        return res.redirect('/');
    }

    const queryObject = url.parse(req.url, true).query;
    const data = queryObject.data;

    try {
        const student = await SpeckerLogins.findOne({ username: data }).select('_id');
        const checklist = await SpeckerChecklists.findOne({ 'student': student }).populate('student').populate('years.semesters.subjects.subject');

        res.render('f-checklist-view', {session: req.session, checklist: checklist});
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
  
      if (status === "approved" || status === "rejected") {
        const checklist = await SpeckerChecklists.findOne({ student: studentId });
  
        for (const year of checklist.years) {
          for (const semester of year.semesters) {
            const subject = semester.subjects.find(
              (s) => s.subject.toString() === subjectId
            );
            if (subject) {
              subject.pending = false;
              subject.approved = status === "approved";
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
app.get('/dashboard/studyplan', async function(req, res) {
    if (!req.session.user || (req.session.user.accessType !== 'student' && req.session.user.accessType !== 'faculty')) {
      return res.redirect('/');
    }
  
    try {
      if (req.session.user.accessType === 'student') {
        const studentId = req.session.user._id;
  
        // Check if a study plan exists for the student
        let studyPlan = await SpeckerStudyPlans.findOne({ student: studentId }).populate('years.semesters.subjects');
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
  
          // Save the new study plan
          await studyPlan.save();
        } else {
          // Study plan already exists, populate its curriculum
          curriculum = await SpeckerCurriculums.findOne({ _id: studyPlan.curriculum }).populate('years.semesters.subjects');
        }
  
        // Render the study plan view with the updated data
        res.render('s-studyplan', { session: req.session, studyplan: studyPlan, curriculum: curriculum });
      }
    } catch (err) {
      console.error(err);
      return res.sendStatus(500);
    }
  });
  
  
  
  


/* default
app.get('/dashboard/', function(req, res) {
    if (req.session.user) {
        res.render('', {session: req.session} )
    } else {
      res.redirect('/');
    }
});
*/






/*
//Accounts Adding
//main menu
app.get("/dashboard/accounts", async function(req, res){
    if (req.session.user) {
        if (req.session.user.accessType === "faculty") {
            const students = await SpeckerLogins.find({access_type: "student"});
            res.render('f-accounts', {session: req.session, people: students});
        } else if (req.session.user.accessType === "admin") {
            const faculty = await SpeckerLogins.find({access_type: "faculty"});
            res.render('a-accounts', {session: req.session, people: faculty});
        } else {
            res.redirect('/dashboard');
        }
    } else {
        res.redirect('/');
    }
});


app.get("/dashboard/accounts/add", function(req, res){
    if (req.session.user) {
        if (req.session.user.accessType === "faculty") {
                var account = {
                    username: "",
                    password: ""
                }
                res.render('f-accounts-add', {session: req.session, username: account.username, password: account.password})
        } else {
            res.redirect('/dashboard');
        }
    } else {
        res.redirect('/');
    }
});

app.post("/dashboard/accounts/add", function(req, res){
    if (req.session.user) {
        if (req.session.user.accessType === "faculty") {
            var account = {
                username: req.body.number,
                password: req.body.password,
                access_type: "student",
                department: "N/A",
                entry_year: req.body.entry_year,
                degree: req.body.degree,
                first_name: req.body.first_name,
                surname: req.body.surname,
                middle_initial: req.body.middle_initial,
                curriculum: req.body.curriculum,
                student_type: req.body.student_type
            }
            
            SpeckerLogins.collection.insertOne(
                {
                    username: account.username,
                    password: account.password,
                    access_type: account.access_type,
                    department: account.department,
                    entry_year: account.entry_year,
                    degree: account.entry_year,
                    first_name: account.first_name,
                    surname: account.surname,
                    middle_initial: account.middle_initial,
                    curriculum: account.curriculum,
                    student_type: account.student_type
                }
            )
        } else {
            res.redirect('/dashboard');
        }
    } else {
        res.redirect('/');
    }
});

app.get("/dashboard/college", function(req, res){
    if (req.session.user) {
        if (req.session.user.accessType === "admin") {
            res.render('a-college', {session: req.session} )
        } else {
            res.redirect('/dashboard');
        }
    } else {
        res.redirect('/');
    }
});

app.get("/dashboard/subjects", function(req, res){
    if (req.session.user) {
        if (req.session.user.accessType === "faculty") {
            SpeckerSubjects.find()
            .then((subjects) => {
                res.render('f-subjects', {session: req.session, subjects: subjects})
            })
            .catch((err) => {
                console.log(err);
            })
        } else {
            res.redirect('/dashboard');
        }
    } else {
        res.redirect('/');
    }
});

app.post("/dashboard/subjects/add", function(req, res){
    if (req.session.user) {
        if (req.session.user.accessType === "faculty") {
            var subject = {
                code: req.body.code,
                name: req.body.name,
                units: req.body.units,
                pre_requisite: req.body.co_requisite,
                co_requisite: req.body.co_requisite,
                semester1: req.body.semester1,
                semester2: req.body.semester2,
                semester3: req.body.semester3,
            };
        
            SpeckerSubjects.collection.insertOne(
                {
                    code: subject.code,
                    name: subject.name,
                    units: subject.units,
                    pre_requisite: subject.pre_requisite,
                    co_requisite: subject.co_requisite,
                    semester1: subject.semester1,
                    semester2: subject.semester2,
                    semester3: subject.semester3
                }
            )
        
            res.redirect('/dashboard/subjects');
        } else {
            res.redirect('/dashboard');
        }
    } else {
        res.redirect('/');
    }
});

app.get("/dashboard/checklist", async function(req, res){
    if (req.session.user) {
        if (req.session.user.accessType === "faculty") {
            const checkliststudents = await SpeckerChecklistStudent.find({"subjects": { "$elemMatch": { "approved": false, "rejected": false } } });
            const subjects = await SpeckerSubjects.find();
            const logins = await SpeckerLogins.find().select('username first_name middle_initial surname student_type degree');

            res.render('f-checklist', {session: req.session, checkliststudents: checkliststudents, subjects: subjects, logins: logins});
        } else {
            res.redirect('/dashboard');
        }
    } else {
        res.redirect('/');
    }
});

app.post("/dashboard/checklist/view", async function(req, res){
    if (req.session.user) {
        if (req.session.user.accessType === "faculty") {
            const checkliststudents = await SpeckerChecklistStudent.find({"subjects": { "$elemMatch": { "approved": false, "rejected": false } } });
            const subjects = await SpeckerSubjects.find();
            const logins = await SpeckerLogins.find().select('username first_name middle_initial surname student_type degree');
            const student = req.body.studentNumber;

            res.render('f-checklist-view', {session: req.session, checkliststudents: checkliststudents, subjects: subjects, logins: logins, student: student});
        } else {
            res.redirect('/dashboard');
        }
    } else {
        res.redirect('/');
    }
});

app.post('/dashboard/checklist/view/update', async function(req, res) {
    const { studentNumber, subjectCode, status } = req.body;
  
    try {
        if (status === 'approve_all') {
            await SpeckerChecklistStudent.updateOne(
            { number: studentNumber },
            { $set: { 'subjects.$[elem].approved': true } },
            { arrayFilters: [{ 'elem.approved': false, 'elem.rejected': false }] }
            );
        } else if (status === 'reject_all') {
            await SpeckerChecklistStudent.updateOne(
            { number: studentNumber },
            { $set: { 'subjects.$[elem].rejected': true } },
            { arrayFilters: [{ 'elem.approved': false, 'elem.rejected': false }] }
            );
        } else {
            const updatedStudent = await SpeckerChecklistStudent.findOneAndUpdate(
            { number: studentNumber, 'subjects.code': subjectCode },
            { $set: { 'subjects.$.approved': status === 'approved', 'subjects.$.rejected': status === 'rejected' } },
            { new: true }
            );
    
            if (!updatedStudent) {
                return res.status(404).json({ error: 'Student not found' });
            }
        }
    
        const checkliststudents = await SpeckerChecklistStudent.find({"subjects": { "$elemMatch": { "approved": false, "rejected": false } } });
            const subjects = await SpeckerSubjects.find();
            const logins = await SpeckerLogins.find().select('username first_name middle_initial surname student_type degree');
            const student = req.body.studentNumber;
    
            const studentView = checkliststudents.find(obj => obj.number === student);
            if (!studentView || (studentView.subjects && !studentView.subjects.some(subject => !subject.approved && !subject.rejected))) {
                return res.redirect('/dashboard/checklist');
            }
        
            res.render('f-checklist-view', { session: req.session, checkliststudents, subjects, logins, student });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Server error' });
    }
  });
*/
  
  

app.listen(process.env.PORT || 3000, function(){
    console.log("Server started");
});