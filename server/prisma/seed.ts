import { PrismaClient, Role, EventStatus, WinnerPosition } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Users
  const adminPassword = await bcrypt.hash('Admin@SIET2026', 10);
  const coordPassword = await bcrypt.hash('Coord@SIET2026', 10);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@siet-esports.in' },
    update: {},
    create: {
      email: 'admin@siet-esports.in',
      password: adminPassword,
      name: 'SIET Admin',
      role: Role.ADMIN,
    },
  });

  const coordinator = await prisma.user.upsert({
    where: { email: 'coordinator@siet-esports.in' },
    update: {},
    create: {
      email: 'coordinator@siet-esports.in',
      password: coordPassword,
      name: 'Rahul Varma',
      role: Role.COORDINATOR,
    },
  });

  console.log('✅ Users created');

  // Tournaments
  const bgmi = await prisma.tournament.upsert({
    where: { id: 'tournament-bgmi-2026' },
    update: {},
    create: {
      id: 'tournament-bgmi-2026',
      name: 'BGMI Championship 2026',
      game: 'BGMI',
      description: 'Battlegrounds Mobile India — Squad (4 players). Fight for survival, dominate the battleground, and claim the crown.',
      venue: 'SIET Campus, Ibrahimpatnam',
      entryFee: 'Cash Payment Only',
      maxTeams: 32,
      teamSize: 4,
      status: EventStatus.REGISTRATION_OPEN,
      registrationOpen: true,
      displayOrder: 1,
    },
  });

  const freeFire = await prisma.tournament.upsert({
    where: { id: 'tournament-freefire-2026' },
    update: {},
    create: {
      id: 'tournament-freefire-2026',
      name: 'Free Fire MAX Championship 2026',
      game: 'Free Fire MAX',
      description: 'Garena Free Fire MAX — Squad (4 players). Survive, adapt, and emerge as the last squad standing.',
      venue: 'SIET Campus, Ibrahimpatnam',
      entryFee: 'Cash Payment Only',
      maxTeams: 32,
      teamSize: 4,
      status: EventStatus.REGISTRATION_OPEN,
      registrationOpen: true,
      displayOrder: 2,
    },
  });

  console.log('✅ Tournaments created');

  // Tournament Rules
  const rules = [
    'Only bonafide students of Siddhartha Institute of Engineering & Technology are eligible to participate.',
    'Each squad must consist of exactly 4 registered players; substitutes are not permitted after slot confirmation.',
    'Entry fee is accepted as cash payment only, collected and verified by an SIET Esports Club Coordinator.',
    'Use of hacks, emulators, panels, third-party tools or teaming will result in immediate disqualification.',
    'All players must join the official room 15 minutes before the scheduled match time.',
    'Match room ID and password are shared only with approved teams; sharing them externally is prohibited.',
    'Screen recording of the full match is mandatory and must be produced on request during disputes.',
    'Abusive language, harassment or unsportsmanlike conduct leads to a permanent ban from club events.',
    'The decision of the Faculty Coordinators and the organising committee is final and binding.',
  ];

  for (let i = 0; i < rules.length; i++) {
    await prisma.tournamentRule.upsert({
      where: { id: `rule-general-${i + 1}` },
      update: {},
      create: {
        id: `rule-general-${i + 1}`,
        ruleNumber: i + 1,
        content: rules[i],
      },
    });
  }

  console.log('✅ Tournament rules created');

  // Faculty Coordinators
  const faculty = [
    { name: 'Dr. A. Ramesh Kumar', designation: 'Faculty Coordinator', department: 'Computer Science & Engineering', displayOrder: 1 },
    { name: 'Mrs. K. Sravanthi', designation: 'Associate Faculty Coordinator', department: 'Information Technology', displayOrder: 2 },
    { name: 'Mr. P. Naveen Reddy', designation: 'Faculty Advisor', department: 'Electronics & Communication Engineering', displayOrder: 3 },
  ];

  for (const f of faculty) {
    await prisma.facultyCoordinator.upsert({
      where: { id: `faculty-${f.displayOrder}` },
      update: {},
      create: { id: `faculty-${f.displayOrder}`, ...f },
    });
  }

  console.log('✅ Faculty coordinators created');

  // Student Coordinators
  const students = [
    { name: 'Rahul Varma', department: 'CSE', year: 'IV Year', phone: '+91 90000 00001', displayOrder: 1 },
    { name: 'Sai Teja', department: 'IT', year: 'III Year', phone: '+91 90000 00002', displayOrder: 2 },
    { name: 'Harshith Reddy', department: 'ECE', year: 'III Year', phone: '+91 90000 00003', displayOrder: 3 },
    { name: 'Aniketh Rao', department: 'CSE (AI & ML)', year: 'II Year', phone: '+91 90000 00004', displayOrder: 4 },
  ];

  for (const s of students) {
    await prisma.studentCoordinator.upsert({
      where: { id: `student-${s.displayOrder}` },
      update: {},
      create: { id: `student-${s.displayOrder}`, ...s },
    });
  }

  console.log('✅ Student coordinators created');

  // Website Content
  const content = [
    { key: 'hero_title', value: 'SIET ESPORTS' },
    { key: 'hero_subtitle', value: 'Championship 2026' },
    { key: 'hero_tagline', value: 'Play Smart · Stay Calm · Become a Champion' },
    { key: 'hero_description', value: 'The official inter-department esports championship of SIET, organised by the SIET Esports Club. BGMI and Free Fire MAX squad battles, held on campus.' },
    { key: 'about_heading', value: 'About SIET' },
    { key: 'about_description', value: 'Siddhartha Institute of Engineering & Technology, part of the Siddhartha Group of Institutions established in 1994, is approved by AICTE and affiliated to JNTU Hyderabad. The campus is built around the values of humanity, discipline and education, and supports a vibrant student club culture alongside academics.' },
    { key: 'mission', value: 'To nurture technically competent, disciplined and socially responsible engineers, and to provide platforms such as the SIET Esports Club where students build teamwork, strategy and leadership beyond the classroom.' },
    { key: 'vision', value: 'To be a centre of excellence in engineering education that empowers students to compete, innovate and lead on regional and national stages.' },
    { key: 'contact_email', value: 'esports@siddhartha.co.in' },
    { key: 'contact_phone', value: '+91 90000 00001' },
    { key: 'contact_address', value: 'Siddhartha Institute of Engineering & Technology, Ibrahimpatnam, Hyderabad, Telangana' },
    { key: 'stats_teams', value: '200+' },
    { key: 'stats_participants', value: '800+' },
    { key: 'stats_events', value: '10+' },
    { key: 'stats_matches', value: '100+' },
  ];

  for (const c of content) {
    await prisma.websiteContent.upsert({
      where: { key: c.key },
      update: {},
      create: c,
    });
  }

  console.log('✅ Website content created');

  // Tournament stages for BGMI
  const bgmiStages = [
    { name: 'Registration & Slot Confirmation', order: 1, description: 'Teams register and confirm slots via cash payment.' },
    { name: 'League Stage', order: 2, description: 'All registered teams compete in round-robin matches.' },
    { name: 'Knockout Stage', order: 3, description: 'Top teams from league stage advance to knockouts.' },
    { name: 'Semi Finals', order: 4, description: 'Top 8 teams battle it out in semi-finals.' },
    { name: 'Grand Finals', order: 5, description: 'The ultimate showdown — Top 4 teams compete for the championship.' },
  ];

  for (const stage of bgmiStages) {
    await prisma.tournamentStage.upsert({
      where: { id: `bgmi-stage-${stage.order}` },
      update: {},
      create: { id: `bgmi-stage-${stage.order}`, tournamentId: bgmi.id, ...stage },
    });
  }

  // Announcement
  await prisma.announcement.upsert({
    where: { id: 'announcement-1' },
    update: {},
    create: {
      id: 'announcement-1',
      title: 'Registrations Now Open!',
      description: 'SIET Esports Championship 2026 registrations are now open. Register your squad for BGMI and Free Fire MAX. Limited slots available — register early to secure your spot!',
      status: 'PUBLISHED',
      publishDate: new Date(),
    },
  });

  console.log('✅ Announcements created');

  console.log('\n🎉 Database seeded successfully!\n');
  console.log('📋 Development Credentials:');
  console.log('   Admin:       admin@siet-esports.in     / Admin@SIET2026');
  console.log('   Coordinator: coordinator@siet-esports.in / Coord@SIET2026');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
