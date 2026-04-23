const express = require('express');
const mongoose = require('mongoose');
const app = express();

app.use(express.json());

// a) Create a Database called 'student'
mongoose.connect('mongodb://127.0.0.1:27017/Student')
    .then(() => console.log("Connected to MongoDB student database"))
    .catch(err => console.error("Connection error", err));

// b) Create a collection called 'studentmarks' via Schema
const studentSchema = new mongoose.Schema({
    Name: String,
    Roll_No: Number,
    WAD_Marks: Number,
    CC_Marks: Number,
    DSBDA_Marks: Number,
    CNS_Marks: Number,
    AI_marks: Number
});

const Student = mongoose.model('studentmarks', studentSchema);

// c) Insert array of documents
app.get('/add-students', async (req, res) => {
    const students = [
        { Name: "ABC", Roll_No: 111, WAD_Marks: 25, CC_Marks: 25, DSBDA_Marks: 25, CNS_Marks: 25, AI_marks: 25 },
        { Name: "John", Roll_No: 112, WAD_Marks: 30, CC_Marks: 28, DSBDA_Marks: 22, CNS_Marks: 15, AI_marks: 20 },
        { Name: "Jane", Roll_No: 113, WAD_Marks: 45, CC_Marks: 42, DSBDA_Marks: 40, CNS_Marks: 48, AI_marks: 41 },
        { Name: "Kevin", Roll_No: 114, WAD_Marks: 10, CC_Marks: 12, DSBDA_Marks: 25, CNS_Marks: 18, AI_marks: 15 }
    ];
    await Student.insertMany(students);
    res.send("Documents inserted successfully!");
});

// d) Display total count and List all documents
app.get('/display-all', async (req, res) => {
    const students = await Student.find();
    const count = await Student.countDocuments();
    res.json({ count, students });
});

// e) List names of students who got > 20 in DSBDA
app.get('/dsbda-above-20', async (req, res) => {
    const students = await Student.find({ DSBDA_Marks: { $gt: 20 } }, { Name: 1, _id: 0 });
    res.json(students);
});

// f) Update marks of specified student by 10 (e.g., Roll 111)
app.get('/update-marks/:roll', async (req, res) => {
    await Student.updateOne(
        { Roll_No: req.params.roll },
        { $inc: { WAD_Marks: 10, CC_Marks: 10, DSBDA_Marks: 10, CNS_Marks: 10, AI_marks: 10 } }
    );
    res.send(`Marks updated for Roll No: ${req.params.roll}`);
});

// g) More than 25 marks in all subjects
app.get('/above-25-all', async (req, res) => {
    const students = await Student.find({
        WAD_Marks: { $gt: 25 },
        CC_Marks: { $gt: 25 },
        DSBDA_Marks: { $gt: 25 },
        CNS_Marks: { $gt: 25 },
        AI_marks: { $gt: 25 }
    }, { Name: 1, _id: 0 });
    res.json(students);
});

// h) Less than 40 in both WAD and CC (Using WAD/CC as placeholders for Maths/Science as per fields)
app.get('/below-40-specific', async (req, res) => {
    const students = await Student.find({
        WAD_Marks: { $lt: 40 },
        CC_Marks: { $lt: 40 }
    }, { Name: 1, _id: 0 });
    res.json(students);
});

// i) Remove specified student
app.get('/remove/:name', async (req, res) => {
    await Student.deleteOne({ Name: req.params.name });
    res.send(`Student ${req.params.name} removed.`);
});

// j) Display Students data in tabular format
app.get('/table', async (req, res) => {
    const students = await Student.find();
    let html = `
    <table border="1" style="border-collapse: collapse; text-align: center;">
        <tr>
            <th>Name</th><th>Roll No</th><th>WAD</th><th>DSBDA</th><th>CNS</th><th>CC</th><th>AI</th>
        </tr>`;
    students.forEach(s => {
        html += `<tr>
            <td>${s.Name}</td><td>${s.Roll_No}</td><td>${s.WAD_Marks}</td>
            <td>${s.DSBDA_Marks}</td><td>${s.CNS_Marks}</td><td>${s.CC_Marks}</td><td>${s.AI_marks}</td>
        </tr>`;
    });
    html += `</table>`;
    res.send(html);
});

app.listen(3000, () => console.log("Server running on http://localhost:3000"));