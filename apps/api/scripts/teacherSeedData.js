const teacherData = [
  {
    "name": "Dr. Meera Deshmukh",
    "gender": "female",
    "email": "meera.deshmukh@school.edu",
    "phone": "9876543210",
    "teacherCode": "PGT-PHY-4092",
    "designation": "PGT",
    "joiningDate": "2022-06-15",
    "assignedClassesRaw": [
      "11th",
      "12th"
    ],
    "streamRaw": "Science",
    "subjectsTaughtRaw": [
      "Physics"
    ],
    "trainingHours": "45 hours (CBSE Capacity Building)",
    "dob": "1970-01-01"
  },
  {
    "name": "Rahul Verma",
    "gender": "male",
    "email": "rahul.verma@school.edu",
    "phone": "8765432109",
    "teacherCode": "TGT-MAT-8831",
    "designation": "TGT",
    "joiningDate": "2023-04-01",
    "assignedClassesRaw": [
      "6th",
      "7th",
      "8th"
    ],
    "streamRaw": null,
    "subjectsTaughtRaw": [
      "Mathematics"
    ],
    "trainingHours": "30 hours (Pedagogical Leadership)",
    "dob": "1971-02-02"
  },
  {
    "name": "Sneha Kapoor",
    "gender": "female",
    "email": "sneha.kapoor@school.edu",
    "phone": "7654321098",
    "teacherCode": "PRT-FND-1105",
    "designation": "PRT",
    "joiningDate": "2024-05-10",
    "assignedClassesRaw": [
      "Sr. KG"
    ],
    "streamRaw": null,
    "subjectsTaughtRaw": [
      "English",
      "Hindi",
      "Mathematics",
      "Environmental Studies (EVS)"
    ],
    "trainingHours": "20 hours (NEP Foundational Literacy)",
    "dob": "1972-03-03"
  },
  {
    "name": "Vikram Singh",
    "gender": "male",
    "email": "vikram.singh@school.edu",
    "phone": "6543210987",
    "teacherCode": "PGT-ACC-3390",
    "designation": "PGT",
    "joiningDate": "2020-07-22",
    "assignedClassesRaw": [
      "11th",
      "12th"
    ],
    "streamRaw": "Commerce",
    "subjectsTaughtRaw": [
      "Accountancy"
    ],
    "trainingHours": "50 hours (Financial Literacy)",
    "dob": "1973-04-04"
  },
  {
    "name": "Dr. Anjali Sharma",
    "gender": "female",
    "email": "anjali.sharma@school.edu",
    "phone": "9988776655",
    "teacherCode": "PGT-CHE-5021",
    "designation": "PGT",
    "joiningDate": "2019-08-12",
    "assignedClassesRaw": [
      "11th",
      "12th"
    ],
    "streamRaw": "Science",
    "subjectsTaughtRaw": [
      "Chemistry"
    ],
    "trainingHours": "40 hours (CBSE Science Core)",
    "dob": "1974-05-05"
  },
  {
    "name": "Arun Patel",
    "gender": "male",
    "email": "arun.patel@school.edu",
    "phone": "8877665544",
    "teacherCode": "PGT-BIO-1123",
    "designation": "PGT",
    "joiningDate": "2021-03-10",
    "assignedClassesRaw": [
      "11th",
      "12th"
    ],
    "streamRaw": "Science",
    "subjectsTaughtRaw": [
      "Biology"
    ],
    "trainingHours": "35 hours (Experiential Learning)",
    "dob": "1975-06-06"
  },
  {
    "name": "Kavita Menon",
    "gender": "female",
    "email": "kavita.menon@school.edu",
    "phone": "7766554433",
    "teacherCode": "PGT-MAT-6745",
    "designation": "PGT",
    "joiningDate": "2018-11-25",
    "assignedClassesRaw": [
      "11th",
      "12th"
    ],
    "streamRaw": [
      "Science",
      "Commerce"
    ],
    "subjectsTaughtRaw": [
      "Mathematics",
      "Applied Mathematics"
    ],
    "trainingHours": "60 hours (Advanced Math Pedagogy)",
    "dob": "1976-07-07"
  },
  {
    "name": "David D'Souza",
    "gender": "male",
    "email": "david.dsouza@school.edu",
    "phone": "6655443322",
    "teacherCode": "PGT-ENG-9982",
    "designation": "PGT",
    "joiningDate": "2017-06-05",
    "assignedClassesRaw": [
      "11th",
      "12th"
    ],
    "streamRaw": "All",
    "subjectsTaughtRaw": [
      "English Core"
    ],
    "trainingHours": "50 hours (Communication Skills)",
    "dob": "1977-08-08"
  },
  {
    "name": "Neha Gupta",
    "gender": "female",
    "email": "neha.gupta@school.edu",
    "phone": "5544332211",
    "teacherCode": "PGT-BST-2341",
    "designation": "PGT",
    "joiningDate": "2022-09-01",
    "assignedClassesRaw": [
      "11th",
      "12th"
    ],
    "streamRaw": "Commerce",
    "subjectsTaughtRaw": [
      "Business Studies"
    ],
    "trainingHours": "25 hours (CBSE Commerce Workshops)",
    "dob": "1978-09-09"
  },
  {
    "name": "Rajesh Kumar",
    "gender": "male",
    "email": "rajesh.kumar@school.edu",
    "phone": "4433221100",
    "teacherCode": "PGT-ECO-7654",
    "designation": "PGT",
    "joiningDate": "2020-02-14",
    "assignedClassesRaw": [
      "11th",
      "12th"
    ],
    "streamRaw": [
      "Commerce",
      "Arts"
    ],
    "subjectsTaughtRaw": [
      "Economics"
    ],
    "trainingHours": "30 hours (Economic Planning)",
    "dob": "1979-10-10"
  },
  {
    "name": "Priya Rajan",
    "gender": "female",
    "email": "priya.rajan@school.edu",
    "phone": "3322110099",
    "teacherCode": "PGT-HIS-8890",
    "designation": "PGT",
    "joiningDate": "2021-07-20",
    "assignedClassesRaw": [
      "11th",
      "12th"
    ],
    "streamRaw": "Arts",
    "subjectsTaughtRaw": [
      "History"
    ],
    "trainingHours": "40 hours (Heritage Integration)",
    "dob": "1980-11-11"
  },
  {
    "name": "Sanjay Tiwari",
    "gender": "male",
    "email": "sanjay.tiwari@school.edu",
    "phone": "2211009988",
    "teacherCode": "PGT-POL-3345",
    "designation": "PGT",
    "joiningDate": "2019-12-10",
    "assignedClassesRaw": [
      "11th",
      "12th"
    ],
    "streamRaw": "Arts",
    "subjectsTaughtRaw": [
      "Political Science"
    ],
    "trainingHours": "35 hours (Civic Engagement)",
    "dob": "1981-12-12"
  },
  {
    "name": "Simran Kaur",
    "gender": "female",
    "email": "simran.kaur@school.edu",
    "phone": "1100998877",
    "teacherCode": "PGT-CSC-4456",
    "designation": "PGT",
    "joiningDate": "2023-01-15",
    "assignedClassesRaw": [
      "11th",
      "12th"
    ],
    "streamRaw": [
      "Science",
      "Commerce"
    ],
    "subjectsTaughtRaw": [
      "Computer Science",
      "Informatics Practices"
    ],
    "trainingHours": "50 hours (AI in Education)",
    "dob": "1982-01-13"
  },
  {
    "name": "Kuldeep Singh",
    "gender": "male",
    "email": "kuldeep.singh@school.edu",
    "phone": "9988112233",
    "teacherCode": "PET-SNR-7789",
    "designation": "PET",
    "joiningDate": "2016-04-05",
    "assignedClassesRaw": [
      "11th",
      "12th"
    ],
    "streamRaw": "All",
    "subjectsTaughtRaw": [
      "Physical Education"
    ],
    "trainingHours": "45 hours (Sports Health & Fitness)",
    "dob": "1983-02-14"
  },
  {
    "name": "Divya Joshi",
    "gender": "female",
    "email": "divya.joshi@school.edu",
    "phone": "8877223344",
    "teacherCode": "TGT-SCI-2234",
    "designation": "TGT",
    "joiningDate": "2022-05-11",
    "assignedClassesRaw": [
      "9th",
      "10th"
    ],
    "streamRaw": null,
    "subjectsTaughtRaw": [
      "Science"
    ],
    "trainingHours": "40 hours (Lab Safety & Skills)",
    "dob": "1984-03-15"
  },
  {
    "name": "Manoj Desai",
    "gender": "male",
    "email": "manoj.desai@school.edu",
    "phone": "7766334455",
    "teacherCode": "TGT-SST-5567",
    "designation": "TGT",
    "joiningDate": "2020-11-22",
    "assignedClassesRaw": [
      "9th",
      "10th"
    ],
    "streamRaw": null,
    "subjectsTaughtRaw": [
      "Social Science"
    ],
    "trainingHours": "30 hours (NEP SST Guidelines)",
    "dob": "1985-04-16"
  },
  {
    "name": "Ritu Agarwal",
    "gender": "female",
    "email": "ritu.agarwal@school.edu",
    "phone": "6655445566",
    "teacherCode": "TGT-ENG-8899",
    "designation": "TGT",
    "joiningDate": "2019-07-08",
    "assignedClassesRaw": [
      "8th",
      "9th",
      "10th"
    ],
    "streamRaw": null,
    "subjectsTaughtRaw": [
      "English Language & Literature",
      "English"
    ],
    "trainingHours": "35 hours (Reading Competency)",
    "dob": "1986-05-17"
  },
  {
    "name": "Amit Mishra",
    "gender": "male",
    "email": "amit.mishra@school.edu",
    "phone": "5544556677",
    "teacherCode": "TGT-HIN-1122",
    "designation": "TGT",
    "joiningDate": "2021-04-18",
    "assignedClassesRaw": [
      "7th",
      "8th",
      "9th",
      "10th"
    ],
    "streamRaw": null,
    "subjectsTaughtRaw": [
      "Hindi Course A",
      "Hindi"
    ],
    "trainingHours": "40 hours (Bhasha Sangam)",
    "dob": "1987-06-18"
  },
  {
    "name": "Lakshmi Iyer",
    "gender": "female",
    "email": "lakshmi.iyer@school.edu",
    "phone": "4433667788",
    "teacherCode": "TGT-SAN-3344",
    "designation": "TGT",
    "joiningDate": "2018-09-12",
    "assignedClassesRaw": [
      "6th",
      "7th",
      "8th"
    ],
    "streamRaw": null,
    "subjectsTaughtRaw": [
      "Sanskrit (3rd Language)"
    ],
    "trainingHours": "25 hours (Classical Languages)",
    "dob": "1988-07-19"
  },
  {
    "name": "Rohan Khatri",
    "gender": "male",
    "email": "rohan.khatri@school.edu",
    "phone": "3322778899",
    "teacherCode": "TGT-IT-5566",
    "designation": "TGT",
    "joiningDate": "2023-06-25",
    "assignedClassesRaw": [
      "9th",
      "10th"
    ],
    "streamRaw": null,
    "subjectsTaughtRaw": [
      "Information Technology"
    ],
    "trainingHours": "45 hours (Digital Infrastructure)",
    "dob": "1989-08-20"
  },
  {
    "name": "Pooja Reddy",
    "gender": "female",
    "email": "pooja.reddy@school.edu",
    "phone": "2211889900",
    "teacherCode": "TGT-MAT-7788",
    "designation": "TGT",
    "joiningDate": "2020-03-30",
    "assignedClassesRaw": [
      "9th",
      "10th"
    ],
    "streamRaw": null,
    "subjectsTaughtRaw": [
      "Mathematics Standard"
    ],
    "trainingHours": "50 hours (Competency-Based Education)",
    "dob": "1990-09-21"
  },
  {
    "name": "Kiran Shah",
    "gender": "male",
    "email": "kiran.shah@school.edu",
    "phone": "9988224466",
    "teacherCode": "TGT-SCI-9900",
    "designation": "TGT",
    "joiningDate": "2021-08-14",
    "assignedClassesRaw": [
      "6th",
      "7th",
      "8th"
    ],
    "streamRaw": null,
    "subjectsTaughtRaw": [
      "Science"
    ],
    "trainingHours": "30 hours (STEM Integration)",
    "dob": "1991-10-22"
  },
  {
    "name": "Suman Das",
    "gender": "female",
    "email": "suman.das@school.edu",
    "phone": "8877335577",
    "teacherCode": "TGT-SST-1133",
    "designation": "TGT",
    "joiningDate": "2019-10-21",
    "assignedClassesRaw": [
      "6th",
      "7th",
      "8th"
    ],
    "streamRaw": null,
    "subjectsTaughtRaw": [
      "Social Science"
    ],
    "trainingHours": "35 hours (Map Work & Projects)",
    "dob": "1992-11-23"
  },
  {
    "name": "Tarun Bhatia",
    "gender": "male",
    "email": "tarun.bhatia@school.edu",
    "phone": "7766446688",
    "teacherCode": "TGT-ENG-2244",
    "designation": "TGT",
    "joiningDate": "2022-12-05",
    "assignedClassesRaw": [
      "6th",
      "7th"
    ],
    "streamRaw": null,
    "subjectsTaughtRaw": [
      "English"
    ],
    "trainingHours": "25 hours (Spoken English Pedagogy)",
    "dob": "1993-12-24"
  },
  {
    "name": "Jyoti Chauhan",
    "gender": "female",
    "email": "jyoti.chauhan@school.edu",
    "phone": "6655557799",
    "teacherCode": "PRT-PRP-3355",
    "designation": "PRT",
    "joiningDate": "2023-02-18",
    "assignedClassesRaw": [
      "5th"
    ],
    "streamRaw": null,
    "subjectsTaughtRaw": [
      "English",
      "Environmental Studies (EVS)",
      "Mathematics"
    ],
    "trainingHours": "30 hours (Joyful Learning)",
    "dob": "1994-01-25"
  },
  {
    "name": "Manish Agarwal",
    "gender": "male",
    "email": "manish.agarwal@school.edu",
    "phone": "5544668800",
    "teacherCode": "PRT-PRP-4466",
    "designation": "PRT",
    "joiningDate": "2020-05-22",
    "assignedClassesRaw": [
      "4th"
    ],
    "streamRaw": null,
    "subjectsTaughtRaw": [
      "Mathematics",
      "Hindi",
      "Environmental Studies (EVS)"
    ],
    "trainingHours": "25 hours (Foundational Numeracy)",
    "dob": "1970-02-26"
  },
  {
    "name": "Rekha Nair",
    "gender": "female",
    "email": "rekha.nair@school.edu",
    "phone": "4433779911",
    "teacherCode": "PRT-PRP-5577",
    "designation": "PRT",
    "joiningDate": "2021-07-09",
    "assignedClassesRaw": [
      "3rd"
    ],
    "streamRaw": null,
    "subjectsTaughtRaw": [
      "English",
      "Environmental Studies (EVS)",
      "Art Education"
    ],
    "trainingHours": "40 hours (Art Integrated Learning)",
    "dob": "1971-03-27"
  },
  {
    "name": "Vishal Thakur",
    "gender": "male",
    "email": "vishal.thakur@school.edu",
    "phone": "3322880022",
    "teacherCode": "PRT-FND-6688",
    "designation": "PRT",
    "joiningDate": "2024-01-12",
    "assignedClassesRaw": [
      "2nd"
    ],
    "streamRaw": null,
    "subjectsTaughtRaw": [
      "English",
      "Hindi",
      "Mathematics",
      "Environmental Studies (EVS)"
    ],
    "trainingHours": "20 hours (Storytelling as Pedagogy)",
    "dob": "1972-04-28"
  },
  {
    "name": "Bhavna Patel",
    "gender": "female",
    "email": "bhavna.patel@school.edu",
    "phone": "2211991133",
    "teacherCode": "PRT-FND-7799",
    "designation": "PRT",
    "joiningDate": "2023-11-05",
    "assignedClassesRaw": [
      "1st"
    ],
    "streamRaw": null,
    "subjectsTaughtRaw": [
      "English",
      "Hindi",
      "Mathematics",
      "Environmental Studies (EVS)"
    ],
    "trainingHours": "25 hours (FLN Mission)",
    "dob": "1973-05-01"
  },
  {
    "name": "Harish Chander",
    "gender": "male",
    "email": "harish.chander@school.edu",
    "phone": "9988335511",
    "teacherCode": "PRT-FND-8800",
    "designation": "PRT",
    "joiningDate": "2022-04-16",
    "assignedClassesRaw": [
      "Jr. KG"
    ],
    "streamRaw": null,
    "subjectsTaughtRaw": [
      "Language 1 (Mother Tongue)",
      "Mathematics"
    ],
    "trainingHours": "30 hours (Early Childhood Care)",
    "dob": "1974-06-02"
  },
  {
    "name": "Shilpa Roy",
    "gender": "female",
    "email": "shilpa.roy@school.edu",
    "phone": "8877446622",
    "teacherCode": "PRT-FND-9911",
    "designation": "PRT",
    "joiningDate": "2021-09-23",
    "assignedClassesRaw": [
      "Nursery"
    ],
    "streamRaw": null,
    "subjectsTaughtRaw": [
      "Art & Craft"
    ],
    "trainingHours": "45 hours (Montessori Methods)",
    "dob": "1975-07-03"
  },
  {
    "name": "Suraj Sharma",
    "gender": "male",
    "email": "suraj.sharma@school.edu",
    "phone": "7766557733",
    "teacherCode": "PRT-FND-1022",
    "designation": "PRT",
    "joiningDate": "2020-06-11",
    "assignedClassesRaw": [
      "Sr. KG"
    ],
    "streamRaw": null,
    "subjectsTaughtRaw": [
      "English",
      "Mathematics",
      "Environmental Studies (EVS)"
    ],
    "trainingHours": "35 hours (Activity Based Learning)",
    "dob": "1976-08-04"
  },
  {
    "name": "Meenakshi Iyer",
    "gender": "female",
    "email": "meenakshi.iyer@school.edu",
    "phone": "6655668844",
    "teacherCode": "PRT-FND-2133",
    "designation": "PRT",
    "joiningDate": "2019-12-02",
    "assignedClassesRaw": [
      "1st"
    ],
    "streamRaw": null,
    "subjectsTaughtRaw": [
      "English",
      "Hindi",
      "Mathematics"
    ],
    "trainingHours": "50 hours (Phonics and Reading)",
    "dob": "1977-09-05"
  },
  {
    "name": "Pradeep Singh",
    "gender": "male",
    "email": "pradeep.singh@school.edu",
    "phone": "5544779955",
    "teacherCode": "PRT-FND-3244",
    "designation": "PRT",
    "joiningDate": "2023-08-19",
    "assignedClassesRaw": [
      "2nd"
    ],
    "streamRaw": null,
    "subjectsTaughtRaw": [
      "Mathematics",
      "Environmental Studies (EVS)",
      "Art & Craft"
    ],
    "trainingHours": "25 hours (Child Psychology)",
    "dob": "1978-10-06"
  },
  {
    "name": "Rashi Khanna",
    "gender": "female",
    "email": "rashi.khanna@school.edu",
    "phone": "4433880066",
    "teacherCode": "PRT-ART-4355",
    "designation": "PRT",
    "joiningDate": "2021-02-14",
    "assignedClassesRaw": [
      "Nursery",
      "Jr. KG",
      "Sr. KG",
      "1st",
      "2nd",
      "3rd",
      "4th",
      "5th"
    ],
    "streamRaw": null,
    "subjectsTaughtRaw": [
      "Art & Craft",
      "Art Education"
    ],
    "trainingHours": "30 hours (Creative Arts Integration)",
    "dob": "1979-11-07"
  },
  {
    "name": "Jatin Patel",
    "gender": "male",
    "email": "jatin.patel@school.edu",
    "phone": "3322991177",
    "teacherCode": "PET-MID-5466",
    "designation": "PET",
    "joiningDate": "2018-05-17",
    "assignedClassesRaw": [
      "6th",
      "7th",
      "8th",
      "9th",
      "10th"
    ],
    "streamRaw": null,
    "subjectsTaughtRaw": [
      "Physical Education"
    ],
    "trainingHours": "40 hours (Health and Wellness)",
    "dob": "1980-12-08"
  },
  {
    "name": "Nandini Sengupta",
    "gender": "female",
    "email": "nandini.sengupta@school.edu",
    "phone": "2211002288",
    "teacherCode": "TGT-ART-6577",
    "designation": "TGT",
    "joiningDate": "2022-10-28",
    "assignedClassesRaw": [
      "6th",
      "7th",
      "8th"
    ],
    "streamRaw": null,
    "subjectsTaughtRaw": [
      "Art Education"
    ],
    "trainingHours": "35 hours (Visual Arts)",
    "dob": "1981-01-09"
  },
  {
    "name": "Yashwant Rao",
    "gender": "male",
    "email": "yashwant.rao@school.edu",
    "phone": "9988446622",
    "teacherCode": "PRT-CSC-7688",
    "designation": "PRT",
    "joiningDate": "2024-03-05",
    "assignedClassesRaw": [
      "3rd",
      "4th",
      "5th"
    ],
    "streamRaw": null,
    "subjectsTaughtRaw": [
      "Computer Science"
    ],
    "trainingHours": "20 hours (Digital Literacy)",
    "dob": "1982-02-10"
  },
  {
    "name": "Garima Jain",
    "gender": "female",
    "email": "garima.jain@school.edu",
    "phone": "8877557733",
    "teacherCode": "TGT-AI-8799",
    "designation": "TGT",
    "joiningDate": "2023-07-12",
    "assignedClassesRaw": [
      "6th",
      "7th",
      "8th"
    ],
    "streamRaw": null,
    "subjectsTaughtRaw": [
      "Computer Science"
    ],
    "trainingHours": "45 hours (AI Integration in Classrooms)",
    "dob": "1983-03-11"
  },
  {
    "name": "Dr. Nitin Dubey",
    "gender": "male",
    "email": "nitin.dubey@school.edu",
    "phone": "7766668844",
    "teacherCode": "TGT-CUN-9800",
    "designation": "TGT (Wellness)",
    "joiningDate": "2017-09-09",
    "assignedClassesRaw": "ALL",
    "streamRaw": "All",
    "subjectsTaughtRaw": [],
    "trainingHours": "60 hours (Student Mental Health & Career Guidance)",
    "dob": "1984-04-12"
  }
];

module.exports = teacherData;