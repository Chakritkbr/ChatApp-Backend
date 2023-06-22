import Usermodel from '../models/Usermodel.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import Messagemodel from '../models/Message.js';

const bcryptSalt = bcrypt.genSaltSync(10);
//test

export const testController = async (req, res) => {
  try {
    res.send({
      message: 'test ok',
    });
  } catch (error) {
    console.log(error);
  }
};

//get profile

export const getProfileController = async (req, res) => {
  const token = req.cookies?.token;
  if (token) {
    jwt.verify(token, process.env.JWT_SECRET, {}, (err, userData) => {
      if (err) throw err;
      res.json(userData);
    });
  } else {
    res.status(401).json('no token');
  }
};

//login

export const loginController = async (req, res) => {
  const { username, password } = req.body;
  const foundUser = await Usermodel.findOne({ username });
  if (foundUser) {
    const passOk = bcrypt.compareSync(password, foundUser.password);
    if (passOk) {
      jwt.sign(
        { userId: foundUser._id, username },
        process.env.JWT_SECRET,
        {},
        (err, token) => {
          res.cookie('token', token, { sameSite: 'none', secure: true }).json({
            id: foundUser._id,
          });
        }
      );
    }
  }
};

//register

export const registerController = async (req, res) => {
  const { username, password } = req.body;
  try {
    const hashedPassword = bcrypt.hashSync(password, bcryptSalt);
    const createdUser = await Usermodel.create({
      username: username,
      password: hashedPassword,
    });
    jwt.sign(
      { userId: createdUser._id, username },
      process.env.JWT_SECRET,
      {},
      (err, token) => {
        if (err) throw err;
        res
          .cookie('token', token, { sameSite: 'none', secure: true })
          .status(201)
          .json({
            id: createdUser._id,
          });
      }
    );
  } catch (err) {
    if (err) throw err;
    res.status(500).json('error');
  }
};

//get older messages
export const getOlderMessages = async (req, res) => {
  const getUserDataFormRequest = async (req) => {
    return new Promise((resolve, reject) => {
      const token = req.cookies?.token;
      if (token) {
        jwt.verify(token, process.env.JWT_SECRET, {}, (err, userData) => {
          if (err) throw err;
          resolve(userData);
        });
      } else {
        reject('no token');
      }
    });
  };
  const { userId } = req.params;
  const userData = await getUserDataFormRequest(req);
  const ourUserId = userData.userId;
  // console.log({ userId, ourUserId });
  const messages = await Messagemodel.find({
    sender: { $in: [userId, ourUserId] },
    recipient: { $in: [userId, ourUserId] },
  }).sort({ createdAt: 1 });
  res.json(messages);
};

export const getOnlinePeople = async (req, res) => {
  const users = await Usermodel.find({}, { _id: 1, username: 1 });
  res.json(users);
};

export const logoutController = async (req, res) => {
  res.cookie('token', '', { sameSite: 'none', secure: true }).json('ok');
};
