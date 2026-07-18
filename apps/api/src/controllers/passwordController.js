const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
const User = require('../models/User');
const PasswordRequest = require('../models/PasswordRequest');
const { createLog } = require('./logController');

// Configure Nodemailer (For local dev, use Mailtrap or Ethereal, or pass actual SMTP in ENV)
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.ethereal.email',
  port: process.env.SMTP_PORT || 587,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: 'Email is required' });

    const user = await User.findOne({ email, isActive: true });
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (user.role === 'teacher') {
      // Flow 1: Teacher Request
      // Check if a pending request already exists
      const existingRequest = await PasswordRequest.findOne({ requestedBy: user._id, status: 'pending' });
      if (existingRequest) {
         return res.status(400).json({ message: 'A password reset request is already pending with the Principal.' });
      }

      const request = new PasswordRequest({
        schoolId: user.schoolId,
        requestedBy: user._id,
        status: 'pending'
      });
      await request.save();

      return res.status(200).json({ 
        message: 'Password reset request sent to the Principal. Please wait for approval.' 
      });

    } else if (user.role === 'student') {
      // Flow 2: Student Reset via Email Link
      const resetToken = crypto.randomBytes(32).toString('hex');
      const resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
      const resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 minutes

      user.resetPasswordToken = resetPasswordToken;
      user.resetPasswordExpire = resetPasswordExpire;
      await user.save();

      // Create reset URL (Front-end URL)
      // Assuming frontend runs on localhost:5173 or the real domain
      const frontendURL = process.env.FRONTEND_URL || 'http://localhost:5173';
      const resetUrl = `${frontendURL}/reset-password/${resetToken}`;

      const message = `You requested a password reset. Please click on the link below to reset your password:\n\n${resetUrl}\n\nIf you did not request this, please ignore this email.`;

      try {
        await transporter.sendMail({
          from: `"School SaaS" <${process.env.SMTP_FROM || 'noreply@schoolsaas.com'}>`,
          to: user.email,
          subject: 'Password Reset Token',
          text: message
        });

        // For local development, log the URL so it's clickable in the terminal
        console.log(`[DEVELOPMENT] Password Reset URL for ${user.email}: ${resetUrl}`);

        res.status(200).json({ message: 'Password reset link sent to your email.' });
      } catch (err) {
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;
        await user.save();
        console.error('Email send failed:', err);
        return res.status(500).json({ message: 'Email could not be sent. Check SMTP configuration.' });
      }

    } else {
      return res.status(400).json({ message: 'Password reset not supported for this role yet.' });
    }

  } catch (error) {
    console.error('Error in forgotPassword:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

exports.resetStudentPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    const resetPasswordToken = crypto.createHash('sha256').update(token).digest('hex');

    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired token' });
    }

    const salt = await bcrypt.genSalt(10);
    user.passwordHash = await bcrypt.hash(password, salt);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    await createLog(user.schoolId, 'Password Reset', `Student ${user.name} reset their password.`, 'success');

    res.status(200).json({ message: 'Password reset successful' });
  } catch (error) {
    console.error('Error in resetStudentPassword:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

exports.getTeacherRequests = async (req, res) => {
  try {
    const schoolId = req.schoolId;
    const requests = await PasswordRequest.find({ schoolId, status: 'pending' })
      .populate('requestedBy', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json(requests);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

exports.approveTeacherRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    const { newPassword } = req.body;
    const schoolId = req.schoolId;

    if (!newPassword) return res.status(400).json({ message: 'New password is required' });

    const request = await PasswordRequest.findOne({ _id: requestId, schoolId, status: 'pending' }).populate('requestedBy');
    
    if (!request) return res.status(404).json({ message: 'Request not found or already processed' });

    // Update teacher's password
    const user = request.requestedBy;
    const salt = await bcrypt.genSalt(10);
    user.passwordHash = await bcrypt.hash(newPassword, salt);
    await user.save();

    // Mark request as resolved
    request.status = 'approved';
    request.resolvedBy = req.user._id;
    request.resolvedAt = new Date();
    await request.save();

    await createLog(schoolId, 'Password Reset', `Principal reset password for Teacher ${user.name}`, 'success');

    res.status(200).json({ message: 'Teacher password reset successfully.' });
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};
