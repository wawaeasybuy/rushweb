'use strict';

import User from './user.model';
import Userinfo from '../userinfo/userinfo.model';
import passport from 'passport';
import config from '../../config/environment';
import jwt from 'jsonwebtoken';
import _ from 'lodash';

function validationError(res, statusCode) {
  statusCode = statusCode || 422;
  return function(err) {
    res.status(statusCode).json(err);
  }
}

function handleError(res, statusCode) {
  statusCode = statusCode || 500;
  return function(err) {
    res.status(statusCode).send(err);
  };
}

function respondWith(res, statusCode) {
  statusCode = statusCode || 200;
  return function() {
    res.status(statusCode).end();
  };
}

/**
 * Get list of users
 * restriction: 'admin'
 */
export function index(req, res) {
  User.findAsync({}, '-salt -password')
    .then(users => {
      res.status(200).json(users);
    })
    .catch(handleError(res));
}

/**
 * Creates a new user
 */
export function create(req, res, next) {
  var newUser = new User(req.body);
  newUser.provider = 'local';
  newUser.role = 'user';
  newUser.saveAsync()
    .spread(function(user) {
      var token = jwt.sign({ _id: user._id }, config.secrets.session, {
        expiresIn: 60 * 60 * 5
      });
      res.json({ token });
    })
    .catch(validationError(res));
}

/**
 * Get a single user
 */
// export function show(req, res, next) {
//   var userId = req.params.id;

//   User.findByIdAsync(userId)
//     .then(user => {
//       if (!user) {
//         return res.status(404).end();
//       }
//       res.json(user.profile);
//     })
//     .catch(err => next(err));
// }

exports.show = function (req, res) {
  var userId = req.params.id;

  User.findById(userId, function (err, user) {
    if (err) {
      return handleError(res, 500);
    }
    if (!user) {
      return res.json(404, {error: {msg: 'user is not found'}});
    }
    res.json(200, user);

  });
};

/**
 * Deletes a user
 * restriction: 'admin'
 */
export function destroy(req, res) {
  User.findByIdAndRemoveAsync(req.params.id)
    .then(function() {
      res.status(204).end();
    })
    .catch(handleError(res));
}

/**
 * Change a users password
 */
export function changePassword(req, res, next) {
  var userId = req.user._id;
  var oldPass = String(req.body.oldPassword);
  var newPass = String(req.body.newPassword);

  User.findByIdAsync(userId)
    .then(user => {
      if (user.authenticate(oldPass)) {
        user.password = newPass;
        return user.saveAsync()
          .then(() => {
            res.status(204).end();
          })
          .catch(validationError(res));
      } else {
        return res.status(403).end();
      }
    });
}

/**
 * Get my info
 */
export function me(req, res, next) {
  var userId = req.user._id;
  var userInfoId = req.user._userInfo;

  User.findOneAsync({ _id: userId }, '-salt -password')
    .then(user => { // don't ever give out the password or salt
      if (!user) {
        return res.status(401).end();
      }
      Userinfo.findById(userInfoId, function (err, userInfo) {
        if (!userInfo) {
          return res.json(404, {error: {msg: 'userInfo is not found'}});
        }
        res.json(200, {
          user: user,
          userInfo: userInfo
        });
      });
    })
    .catch(err => next(err));
}

/**
 * Authentication callback
 */
export function authCallback(req, res, next) {
  res.redirect('/');
}


exports.submitIdentity = function (req, res) {
  var idCard = req.body.idCard;
  var credentialsPhoto = req.body.credentialsPhoto;

  var userId = req.user._id;

  if (!idCard) {
    return res.json(400, {error: {msg: 'idCard is required'}});
  }
  // if (!credentialsPhoto) {
  //   return res.json(400, {error: {msg: 'credentialsPhoto is required'}});
  // }
  User.findById(userId, function (err, user) {
    if (err) {
      return handleError(res, 500);
    }
    if (!user) {
      return res.json(404, {error: {msg: 'user is not found'}});
    }
    var updateUser = _.assign(user, req.body);
    _.assign(updateUser, {isPass: 1});
    updateUser.save(function (err, result) {
      if (err) {
        return handleError(res, 500);
      }
      res.json(200, result);
    });
  });
};


exports.checkIdentity = function (req, res) {
  var userId = req.params.id;
  var isPass = req.body.isPass;

  if (!isPass) {
    return res.json(400, {error: {msg: 'isPass is required'}});
  }

  User.findById(userId, function (err, user) {
    if (err) {
      return handleError(res, 500);
    }
    if (!user) {
      return res.json(404, {error: {msg: 'user is required'}});
    }
    var updateUser = _.assign(user, {isPass: isPass});
    updateUser.save(function (err, result) {
      if (err) {
        return handleError(res, 500);
      }
      res.json(200, result);
    });
  });
};
