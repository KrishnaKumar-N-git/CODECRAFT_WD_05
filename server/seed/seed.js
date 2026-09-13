require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const User = require('../models/User');
const Post = require('../models/Post');
const Comment = require('../models/Comment');
const Like = require('../models/Like');
const Follow = require('../models/Follow');
const Notification = require('../models/Notification');
const Community = require('../models/Community');
const CommunityMember = require('../models/CommunityMember');
const Project = require('../models/Project');
const Event = require('../models/Event');
const Report = require('../models/Report');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/campusconnect';

const seedDatabase = async () => {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI, { dbName: 'campusconnect' });
    console.log('Connected! Clearing existing collections...');

    await Promise.all([
      User.deleteMany({}),
      Post.deleteMany({}),
      Comment.deleteMany({}),
      Like.deleteMany({}),
      Follow.deleteMany({}),
      Notification.deleteMany({}),
      Community.deleteMany({}),
      CommunityMember.deleteMany({}),
      Project.deleteMany({}),
      Event.deleteMany({}),
      Report.deleteMany({}),
    ]);

    console.log('Seeding exact infographic and campus student data...');

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('Password@123', salt);
    const adminHashedPassword = await bcrypt.hash('Admin@123', salt);

    // 1. Users matching infographic
    const rawUsers = [
      {
        username: 'krishnakumar',
        email: 'krishna@college.edu',
        password: hashedPassword,
        fullName: 'Krishna Kumar',
        avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400&h=400&fit=crop',
        bio: 'Passionate about technology | Learn | Build | Grow',
        department: 'Computer Science Engineering',
        college: 'National Institute of Technology',
        year: '4th',
        skills: ['React', 'Node.js', 'MongoDB', 'Python', 'Docker'],
        role: 'student',
        followersCount: 316,
        followingCount: 280,
        postsCount: 42,
        isVerified: true,
      },
      {
        username: 'priya_s',
        email: 'priya@college.edu',
        password: hashedPassword,
        fullName: 'Priya S',
        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop',
        bio: 'IT enthusiast & mobile UI designer. Love campus photography and tech fests!',
        department: 'IT Department',
        college: 'National Institute of Technology',
        year: '3rd',
        skills: ['Figma', 'React', 'JavaScript', 'CSS3'],
        role: 'student',
        followersCount: 210,
        followingCount: 180,
        postsCount: 18,
        isVerified: true,
      },
      {
        username: 'arun_kumar',
        email: 'arun@college.edu',
        password: hashedPassword,
        fullName: 'Arun Kumar',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop',
        bio: 'CSE 4th year student. Final year project setup in progress. Full Stack & Cloud practitioner.',
        department: 'CSE Department',
        college: 'National Institute of Technology',
        year: '4th',
        skills: ['MERN', 'AWS', 'Kubernetes', 'Express.js'],
        role: 'student',
        followersCount: 290,
        followingCount: 240,
        postsCount: 25,
        isVerified: true,
      },
      {
        username: 'rahul_r',
        email: 'rahul@college.edu',
        password: hashedPassword,
        fullName: 'Rahul R',
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop',
        bio: 'ECE tech geek. Embedded systems, Arduino, and IoT sensors research.',
        department: 'ECE Department',
        college: 'National Institute of Technology',
        year: '3rd',
        skills: ['Embedded C', 'IoT', 'Python', 'MATLAB'],
        role: 'student',
        followersCount: 155,
        followingCount: 130,
        postsCount: 14,
        isVerified: true,
      },
      {
        username: 'sneha_m',
        email: 'sneha@college.edu',
        password: hashedPassword,
        fullName: 'Sneha M',
        avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=400&fit=crop',
        bio: 'Mechanical department lead. Robotics team coordinator & 3D CAD enthusiast.',
        department: 'Mechanical Department',
        college: 'National Institute of Technology',
        year: '3rd',
        skills: ['SolidWorks', 'Robotics', 'Python', 'Automation'],
        role: 'student',
        followersCount: 175,
        followingCount: 160,
        postsCount: 16,
        isVerified: true,
      },
      {
        username: 'vikram',
        email: 'vikram@college.edu',
        password: hashedPassword,
        fullName: 'Vikram',
        avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&h=400&fit=crop',
        bio: 'Civil Department student. Sustainable infrastructure & smart campus planning.',
        department: 'Civil Department',
        college: 'National Institute of Technology',
        year: '2nd',
        skills: ['AutoCAD', 'Structural Design', 'Surveying'],
        role: 'student',
        followersCount: 120,
        followingCount: 110,
        postsCount: 9,
        isVerified: true,
      },
      {
        username: 'admin',
        email: 'admin@campusconnect.edu',
        password: adminHashedPassword,
        fullName: 'Campus Admin',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=400&fit=crop',
        bio: 'Official Campus Administrator for student verification, community management and reports.',
        department: 'Administration',
        college: 'National Institute of Technology',
        year: 'Alumni',
        skills: ['Campus Management', 'Moderation', 'Security'],
        role: 'admin',
        followersCount: 1245,
        followingCount: 50,
        postsCount: 5,
        isVerified: true,
      }
    ];

    const users = await User.insertMany(rawUsers);
    console.log(`Created ${users.length} users.`);

    const krishna = users[0];
    const priya = users[1];
    const arun = users[2];
    const rahul = users[3];
    const sneha = users[4];
    const vikram = users[5];
    const admin = users[6];

    // 2. Communities matching infographic Card 9
    const rawCommunities = [
      {
        name: 'Computer Science',
        slug: 'computer-science',
        description: 'Hub for algorithms, system design, software engineering, and peer problem-solving.',
        category: 'technology',
        avatar: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=200&h=200&fit=crop',
        creator: krishna._id,
        membersCount: 1200,
        postsCount: 142,
      },
      {
        name: 'Placement Prep',
        slug: 'placement-prep',
        description: 'Mock interviews, resume feedback, DSA practice questions, and company drive referrals.',
        category: 'academic',
        avatar: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=200&h=200&fit=crop',
        creator: arun._id,
        membersCount: 850,
        postsCount: 98,
      },
      {
        name: 'Coding Club',
        slug: 'coding-club',
        description: 'Competitive programming contests, hackathons, and weekly algorithm challenges.',
        category: 'technology',
        avatar: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=200&h=200&fit=crop',
        creator: priya._id,
        membersCount: 620,
        postsCount: 76,
      },
      {
        name: 'Design & Creativity',
        slug: 'design-creativity',
        description: 'UI/UX design systems, Figma workflows, graphic design, and student creative portfolios.',
        category: 'arts',
        avatar: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=200&h=200&fit=crop',
        creator: sneha._id,
        membersCount: 430,
        postsCount: 52,
      },
      {
        name: 'Robotics & Automation',
        slug: 'robotics-automation',
        description: 'Microcontroller programming, ROS rovers, drone design, and autonomous robotics.',
        category: 'technology',
        avatar: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=200&h=200&fit=crop',
        creator: rahul._id,
        membersCount: 390,
        postsCount: 44,
      },
    ];

    const communities = await Community.insertMany(rawCommunities);
    console.log(`Created ${communities.length} communities.`);

    // 3. Projects matching infographic Card 10
    const rawProjects = [
      {
        title: 'Library Management System',
        description: 'A full-stack web application to manage books, users, borrow requests, fines and transactions.',
        technologies: ['React', 'Node.js', 'MongoDB'],
        category: 'web',
        githubUrl: 'https://github.com/krishnakumar/library-management',
        demoUrl: 'https://library-system-demo.vercel.app',
        image: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=800&h=500&fit=crop',
        author: krishna._id,
        likesCount: 96,
        commentsCount: 18,
      },
      {
        title: 'SynchroCode — Collaborative Real-Time Code IDE',
        description: 'A browser-based collaborative code editor powered by WebSockets and CRDT sync with live cursor tracking.',
        technologies: ['React', 'Node.js', 'Socket.io', 'Monaco'],
        category: 'web',
        githubUrl: 'https://github.com/arun/synchrocode',
        demoUrl: 'https://synchrocode.vercel.app',
        image: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=800&h=500&fit=crop',
        author: arun._id,
        likesCount: 124,
        commentsCount: 22,
      },
      {
        title: 'Campus Food Delivery & Dorm Tracker',
        description: 'Real-time ordering app connecting college hostel students with night cafeteria kitchens.',
        technologies: ['React Native', 'Node.js', 'MongoDB'],
        category: 'mobile',
        githubUrl: 'https://github.com/priya/campuseats',
        demoUrl: 'https://campuseats.vercel.app',
        image: 'https://images.unsplash.com/photo-1526367790999-0150786686a2?w=800&h=500&fit=crop',
        author: priya._id,
        likesCount: 88,
        commentsCount: 14,
      },
      {
        title: 'MedVision — AI Thoracic Pathology Classifier',
        description: 'Convolutional neural network for automated chest X-ray disease detection deployed with FastAPI.',
        technologies: ['PyTorch', 'Python', 'FastAPI', 'React'],
        category: 'ai-ml',
        githubUrl: 'https://github.com/krishnakumar/medvision-ai',
        demoUrl: 'https://medvision.hf.space',
        image: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&h=500&fit=crop',
        author: krishna._id,
        likesCount: 142,
        commentsCount: 31,
      }
    ];

    const projects = await Project.insertMany(rawProjects);
    console.log(`Created ${projects.length} projects.`);

    // 4. Events matching infographic Card 11
    const rawEvents = [
      {
        title: 'Tech Fest 2025',
        description: 'A celebration of innovation and technology featuring hackathons, paper presentations, battle bots, and industry speaker panels.',
        date: new Date('2025-03-15T09:00:00Z'),
        time: '09:00 AM - 06:00 PM',
        location: 'College Auditorium & Central Tech Plaza',
        organizer: arun._id,
        image: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=800&h=500&fit=crop',
        attendees: [krishna._id, priya._id, rahul._id, sneha._id, vikram._id],
        attendeesCount: 348,
        status: 'upcoming',
      },
      {
        title: 'HackCampus 2026 — 36-Hour Hackathon',
        description: 'Compete in teams of 2-4 to build transformative AI, Web3, and sustainability solutions. Cash prizes of ₹1,50,000!',
        date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        time: '10:00 AM - 10:00 PM (36h)',
        location: 'CSE Innovation Lab',
        organizer: krishna._id,
        image: 'https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=800&h=500&fit=crop',
        attendees: [priya._id, arun._id, rahul._id, sneha._id],
        attendeesCount: 215,
        status: 'upcoming',
      },
      {
        title: 'Placement Workshop: System Design & DSA',
        description: 'Comprehensive walkthrough of distributed caching, rate limiters, database indexing, and behavioral rounds with Google alumni.',
        date: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000),
        time: '04:00 PM - 07:00 PM',
        location: 'Seminar Hall 2',
        organizer: krishna._id,
        image: 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=800&h=500&fit=crop',
        attendees: [arun._id, priya._id, vikram._id],
        attendeesCount: 160,
        status: 'upcoming',
      }
    ];

    const events = await Event.insertMany(rawEvents);
    console.log(`Created ${events.length} events.`);

    // 5. Posts matching infographic Card 3 & Card 6
    const rawPosts = [
      {
        author: arun._id,
        content: "Completed my final year project setup! 🚀 Excited for what's next!",
        media: [{ url: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=1200&h=700&fit=crop', type: 'image' }],
        community: communities[0]._id,
        tags: [krishna._id],
        likesCount: 56,
        commentsCount: 12,
      },
      {
        author: priya._id,
        content: "Beautiful day at our campus 💙 Tagging my friends @krishnakumar @arun",
        media: [{ url: 'https://images.unsplash.com/photo-1562774053-701939374585?w=1200&h=700&fit=crop', type: 'image' }],
        community: null,
        tags: [krishna._id, arun._id],
        likesCount: 128,
        commentsCount: 24,
      },
      {
        author: krishna._id,
        content: "Sharing moments from our college fest! 🎆 The hackathon presentations blew everyone away. Amazing energy and creative projects across all departments.",
        media: [{ url: 'https://images.unsplash.com/photo-1511578314322-379afb476865?w=1200&h=700&fit=crop', type: 'image' }],
        community: communities[2]._id,
        tags: [arun._id, priya._id, rahul._id],
        likesCount: 84,
        commentsCount: 16,
      },
      {
        author: rahul._id,
        content: "Just tested the ESP32 IoT sensor telemetry for our lab energy monitoring system. Response times over MQTT are under 40ms! ⚡",
        media: [{ url: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=1200&h=700&fit=crop', type: 'image' }],
        community: communities[4]._id,
        tags: [krishna._id],
        likesCount: 45,
        commentsCount: 8,
      },
      {
        author: sneha._id,
        content: "Robotics workshop registrations for micromouse maze solving are live on the Events tab. Bring your CAD designs tomorrow!",
        media: [],
        community: communities[4]._id,
        tags: [rahul._id],
        likesCount: 38,
        commentsCount: 5,
      }
    ];

    const posts = await Post.insertMany(rawPosts);
    console.log(`Created ${posts.length} posts.`);

    // 6. Comments matching Card 6
    const rawComments = [
      {
        post: posts[1]._id,
        author: krishna._id,
        content: 'Great shot! 👏',
        likesCount: 8,
      },
      {
        post: posts[1]._id,
        author: arun._id,
        content: 'Amazing campus! 💙',
        likesCount: 5,
      },
      {
        post: posts[0]._id,
        author: krishna._id,
        content: 'Awesome progress Arun! Let me know if you need help with the Docker containerization.',
        likesCount: 4,
      },
      {
        post: posts[2]._id,
        author: priya._id,
        content: 'The fest was truly unforgettable! Looking forward to the next edition.',
        likesCount: 6,
      }
    ];
    await Comment.insertMany(rawComments);

    // 7. Follow relationships matching Card 7
    const follows = [
      { follower: krishna._id, following: arun._id },
      { follower: arun._id, following: krishna._id },
      { follower: priya._id, following: krishna._id },
      { follower: rahul._id, following: krishna._id },
      { follower: sneha._id, following: krishna._id },
      { follower: vikram._id, following: krishna._id },
    ];
    await Follow.insertMany(follows);

    // 8. Notifications matching Card 8
    const sampleNotifications = [
      {
        recipient: krishna._id,
        sender: priya._id,
        type: 'follow',
        message: 'Priya S started following you',
        isRead: false,
      },
      {
        recipient: krishna._id,
        sender: arun._id,
        type: 'like_post',
        referenceModel: 'Post',
        referenceId: posts[2]._id,
        message: 'Arun Kumar liked your post',
        isRead: false,
      },
      {
        recipient: krishna._id,
        sender: rahul._id,
        type: 'comment',
        referenceModel: 'Post',
        referenceId: posts[2]._id,
        message: 'Rahul R commented on your post "Great project!"',
        isRead: false,
      },
      {
        recipient: krishna._id,
        sender: sneha._id,
        type: 'tag',
        referenceModel: 'Post',
        referenceId: posts[1]._id,
        message: 'Sneha M tagged you in a post',
        isRead: true,
      },
      {
        recipient: krishna._id,
        sender: arun._id,
        type: 'event_update',
        referenceModel: 'Event',
        referenceId: events[0]._id,
        message: 'Tech Club posted a new event "Tech Fest 2025"',
        isRead: true,
      },
    ];
    await Notification.insertMany(sampleNotifications);

    // 9. Reports matching Card 13
    const sampleReports = [
      {
        reporter: arun._id,
        targetType: 'Post',
        targetId: posts[0]._id,
        reason: 'spam',
        description: 'Inappropriate commercial advertising post.',
        status: 'pending',
      },
      {
        reporter: priya._id,
        targetType: 'Comment',
        targetId: posts[1]._id,
        reason: 'harassment',
        description: 'Offensive language in public comments.',
        status: 'pending',
      },
      {
        reporter: rahul._id,
        targetType: 'User',
        targetId: vikram._id,
        reason: 'other',
        description: 'Fake profile impersonation suspicion.',
        status: 'pending',
      }
    ];
    await Report.insertMany(sampleReports);

    console.log('✅ Database seeded with exact infographic data!');
    console.log('Login: krishna@college.edu / Password@123');
    console.log('Admin: admin@campusconnect.edu / Admin@123');
    process.exit(0);
  } catch (err) {
    console.error('❌ Seeding failed:', err);
    process.exit(1);
  }
};

seedDatabase();
