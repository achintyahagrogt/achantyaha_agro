const { getApps, initializeApp, cert } = require('firebase-admin/app');
const { getAuth } = require('firebase-admin/auth');
const { getUsers } = require('../db');

function initializeFirebaseAdmin() {
  if (getApps().length > 0) {
    return getApps()[0];
  }

  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY;

  console.log('[AUTH ENV CHECK]', {
    project: !!projectId,
    clientEmail: !!clientEmail,
    privateKey: !!privateKey
  });

  if (!projectId || !clientEmail || !privateKey) {
    throw new Error(
      'Firebase Admin credentials are missing. Set FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL and FIREBASE_PRIVATE_KEY.'
    );
  }

  return initializeApp({
    credential: cert({
      projectId,
      clientEmail,
      privateKey: privateKey.replace(/\\n/g, '\n')
    })
  });
}

async function authenticateToken(req, res, next) {
  try {
    initializeFirebaseAdmin();

    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        message: 'Authentication required'
      });
    }

    const token = authHeader.substring(7).trim();

    if (!token) {
      return res.status(401).json({
        message: 'Authentication required'
      });
    }

    const decodedToken = await getAuth().verifyIdToken(token);

    const users = getUsers();

    const firebaseEmail = (
      decodedToken.email || ''
    ).toLowerCase();

    let currentUser = users.find(
      user =>
        user.firebaseUid === decodedToken.uid ||
        (
          firebaseEmail &&
          typeof user.username === 'string' &&
          user.username.toLowerCase() === firebaseEmail
        )
    );

    const adminEmail = (
      process.env.FIREBASE_ADMIN_EMAIL || ''
    ).trim().toLowerCase();

    if (
      !currentUser &&
      firebaseEmail &&
      firebaseEmail === adminEmail
    ) {
      currentUser = {
        id: decodedToken.uid,
        firebaseUid: decodedToken.uid,
        username: firebaseEmail,
        email: firebaseEmail,
        name: decodedToken.name || firebaseEmail,
        role: 'admin',
        permissions: [
          'create',
          'read',
          'update',
          'delete',
          'manage_users'
        ]
      };
    }

    if (!currentUser) {
      return res.status(403).json({
        message:
          'Firebase account is authenticated but is not authorized to access the admin panel.'
      });
    }

    req.user = {
      id: currentUser.firebaseUid || currentUser.id,
      firebaseUid: decodedToken.uid,
      username: currentUser.username || firebaseEmail,
      email: firebaseEmail,
      name:
        currentUser.name ||
        decodedToken.name ||
        firebaseEmail,
      role: currentUser.role || 'editor',
      permissions: currentUser.permissions || []
    };

    next();
  } catch (error) {
    console.error(
      '[Firebase Auth Error]:',
      error.code || '',
      error.message
    );

    console.error(error.stack);

    if (
      error.code === 'auth/id-token-expired' ||
      error.code === 'auth/argument-error'
    ) {
      return res.status(403).json({
        message: 'Invalid or expired authentication token'
      });
    }

    return res.status(403).json({
      message: 'Authentication failed',
      code: error.code || 'unknown',
      error: error.message || 'Unknown Firebase error'
    });
  }
}

function requirePermission(permission) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        message: 'Authentication required'
      });
    }

    if (
      req.user.role === 'admin' ||
      (
        Array.isArray(req.user.permissions) &&
        req.user.permissions.includes(permission)
      )
    ) {
      return next();
    }

    return res.status(403).json({
      message:
        `Access denied. Requires '${permission}' permission.`
    });
  };
}

module.exports = {
  authenticateToken,
  requirePermission
};