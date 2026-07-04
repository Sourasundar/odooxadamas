const prisma = require('../config/db');
const bcrypt = require('bcrypt');

// ── Helper: Generate Employee ID ─────────────────────────

const generateEmployeeId = async (displayName) => {
  const year = new Date().getFullYear();
  const parts = (displayName || 'New User').trim().split(/\s+/);
  const f2 = (parts[0] || 'XX').substring(0, 2).toUpperCase();
  const l2 = (parts.length > 1 ? parts[parts.length - 1] : 'XX').substring(0, 2).toUpperCase();
  const prefix = `OI${f2}${l2}${year}`;

  const lastUser = await prisma.user.findFirst({
    where: { employeeId: { startsWith: prefix } },
    orderBy: { employeeId: 'desc' },
    select: { employeeId: true }
  });

  let seq = 1;
  if (lastUser && lastUser.employeeId) {
    const lastSeq = parseInt(lastUser.employeeId.slice(-4), 10);
    if (!isNaN(lastSeq)) seq = lastSeq + 1;
  }

  return `${prefix}${seq.toString().padStart(4, '0')}`;
};

// ── Admin only: Create new employee ──────────────────────

const createEmployee = async (req, res) => {
  try {
    const { 
      email, displayName, department, phone, role, 
      jobPosition, gender, location, workingDaysPerWeek, breakTimeHrs 
    } = req.body;

    if (!email || !displayName) {
      return res.status(400).json({ error: 'Email and Name are required' });
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return res.status(400).json({ error: 'Email already exists' });
    }

    const employeeId = await generateEmployeeId(displayName);

    // Auto-generate a secure temporary password
    const generatedPassword = Math.random().toString(36).slice(-8) + 'Aa1@';
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(generatedPassword, salt);

    const user = await prisma.user.create({
      data: {
        employeeId,
        email,
        password: hashedPassword,
        role: role || 'Employee',
        mustChangePassword: true,
        displayName,
        department: department || null,
        phone: phone || null,
        jobPosition: jobPosition || null,
        gender: gender || null,
        location: location || null,
        workingDaysPerWeek: workingDaysPerWeek ? parseInt(workingDaysPerWeek) : 5,
        breakTimeHrs: breakTimeHrs ? parseFloat(breakTimeHrs) : 1.0,
        dateOfJoining: new Date()
      }
    });

    const { password: _, ...safeUser } = user;

    res.status(201).json({
      message: 'Employee created successfully',
      user: safeUser,
      generatedPassword
    });
  } catch (error) {
    console.error('Create employee error:', error);
    res.status(400).json({ error: error.message });
  }
};

// ── Get current user profile ─────────────────────────────

const getMyProfile = async (req, res) => {
  const { password: _, ...safeUser } = req.user;
  res.json(safeUser);
};

// ── Get all employees (Admin only) ───────────────────────

const getAllEmployees = async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      where: {
        email: { not: 'barshanmajumdar249@gmail.com' } // Hide permanent admin from employee cards
      },
      select: {
        id: true,
        employeeId: true,
        email: true,
        displayName: true,
        department: true,
        role: true,
        status: true,
        avatar: true,
        phone: true,
        jobPosition: true,
        dateOfJoining: true,
        createdAt: true
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(users);
  } catch (error) {
    console.error('Get all employees error:', error);
    res.status(500).json({ error: error.message });
  }
};

// ── Get single employee by ID (view-only for cards) ──────

const getEmployeeById = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.params.id },
      select: {
        id: true,
        employeeId: true,
        email: true,
        displayName: true,
        department: true,
        jobPosition: true,
        role: true,
        status: true,
        avatar: true,
        phone: true,
        about: true,
        skills: true,
        certifications: true,
        residingAddress: true,
        dateOfBirth: true,
        dateOfJoining: true,
        gender: true,
        nationality: true,
        maritalStatus: true,
        location: true,
        companyName: true,
        workingDaysPerWeek: true,
        breakTimeHrs: true,
        managerId: true,
        manager: {
          select: { id: true, displayName: true }
        },
        createdAt: true
      }
    });

    if (!user) {
      return res.status(404).json({ error: 'Employee not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('Get employee by id error:', error);
    res.status(500).json({ error: error.message });
  }
};

// ── Update own profile ───────────────────────────────────

const updateMyProfile = async (req, res) => {
  try {
    const allowedFields = [
      'displayName', 'phone', 'about', 'skills', 'certifications',
      'residingAddress', 'personalEmail', 'gender', 'nationality',
      'maritalStatus', 'location', 'dateOfBirth'
    ];

    const updateData = {};
    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updateData[field] = req.body[field];
      }
    }

    const updated = await prisma.user.update({
      where: { id: req.user.id },
      data: updateData
    });

    const { password: _, ...safeUser } = updated;
    res.json(safeUser);
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(400).json({ error: error.message });
  }
};

const getAdminEmails = async (req, res) => {
  try {
    const emails = await prisma.adminEmail.findMany();
    res.json(emails);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const addAdminEmail = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'Email is required' });
    
    const added = await prisma.adminEmail.create({ data: { email } });

    // If the user already exists in the system, upgrade them to Admin immediately
    await prisma.user.updateMany({
      where: { email },
      data: { role: 'Admin' }
    });

    res.json(added);
  } catch (error) {
    if (error.code === 'P2002') return res.status(400).json({ error: 'Email already in list' });
    res.status(500).json({ error: error.message });
  }
};

const removeAdminEmail = async (req, res) => {
  try {
    const { email } = req.params;
    if (email.toLowerCase() === 'barshanmajumdar249@gmail.com') {
      return res.status(400).json({ error: 'Cannot remove permanent admin' });
    }
    
    // Remove from the authorized list
    await prisma.adminEmail.delete({ where: { email } });
    
    // If they already signed up, downgrade them to an Employee immediately
    await prisma.user.updateMany({
      where: { email },
      data: { role: 'Employee' }
    });
    
    res.json({ message: 'Removed successfully and downgraded if user exists' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getInvitedEmails = async (req, res) => {
  try {
    const emails = await prisma.invitedEmployee.findMany();
    res.json(emails);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const inviteEmail = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'Email is required' });

    // Check if user already exists
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return res.status(400).json({ error: 'User is already fully registered' });
    }

    const added = await prisma.invitedEmployee.create({ data: { email } });
    res.json(added);
  } catch (error) {
    if (error.code === 'P2002') return res.status(400).json({ error: 'Email already invited' });
    res.status(500).json({ error: error.message });
  }
};

const removeInvitedEmail = async (req, res) => {
  try {
    const { email } = req.params;
    await prisma.invitedEmployee.delete({ where: { email } });
    res.json({ message: 'Removed successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  createEmployee,
  getMyProfile,
  getAllEmployees,
  getEmployeeById,
  updateMyProfile,
  getAdminEmails,
  addAdminEmail,
  removeAdminEmail,
  getInvitedEmails,
  inviteEmail,
  removeInvitedEmail
};
