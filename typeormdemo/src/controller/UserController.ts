import { Request, Response } from "express";
import { getRepository } from "typeorm";
import { validate } from "class-validator";
import { Resetpassword } from "../entity/ResetPassword"
import * as crypto from "crypto";
import config from "../config/config";
import * as nodemailer from 'nodemailer';
import * as Twilio from 'twilio'

let token;

// var options = {
            //     "method": "POST",
            //     "hostname": "control.msg91.com",
            //     "port": null,
            //     "path": "/api/sendotp.php?country=91&otp_length=6&sender=7248111415&message=%24message&mobile=+919045812477&authkey=299394Aj6R0a8Tan1x5da843e2",
            //     "headers": {}
            // };
            // var request = http.request(options, function (response) {
            //     var chunks = [];

            //     response.on("data", function (chunk) {
            //         chunks.push(chunk);
            //     });

            //     response.on("end", function () {
            //         var body = Buffer.concat(chunks);
            //         console.log(body.toString());
            //     });
            // });

            // request.end();



const twilioClient = Twilio(config.twilioSid, config.twilioToken)

import { User } from "../entity/User";
import { AlertContext } from "twilio/lib/rest/monitor/v1/alert";

class UserController {

  static listAll = async (req: Request, res: Response) => {
    //Get users from database
    const userRepository = getRepository(User);
    const users = await userRepository.find({
      select: ["username", "email", "phone", "verified"]
    });
    res.send(users);
  };

  static getOneById = async (req: Request, res: Response) => {
    //Get the ID from the url

    const id: number = Number(req.params.id);
    console.log("this is getoneById--->", id)
    //Get the user from database
    const userRepository = getRepository(User);
    try {
      const user = await userRepository.findOneOrFail(id, {
        select: ["id", "username", "role", "email", "phone"] //We dont want to send the password on response
      });
      res.status(200).send({
        username: user.username,
        email: user.email,
        phone: user.phone,
        verified: user.verified,
      });
    } catch (error) {
      res.status(404).send("User not found");
    }
  };

  static newUser = async (req: Request, res: Response) => {
    console.log("user---->", req.body)
    //Get parameters from the body
    let { username, password, email, phone } = req.body;
    let user = new User();
    user.username = username;
    user.password = password;
    user.email = email;
    user.phone = phone;

    const result = await twilioClient.verify.services.create({ friendlyName: 'adi' })
      .then(result => token = result.sid)
      .catch(err => {
        console.log(err)
      });
    // token = result.sid
    user.sid = token;

    const results = await twilioClient.verify.services(user.sid)
      .verifications
      .create({ to: phone, channel: 'sms' })
      .then(verification => console.log("status--->", verification.status))
      .catch(err => {
        console.log("error-->", err)
      })

    console.log("results------>", results)

    const errors = await validate(user);
    console.log("err---->", errors)
    if (errors.length > 0) {
      res.send(errors);
      return;
    }

    //Hash the password, to securely store on DB
    user.hashPassword();

    //Try to save. If fails, the username is already in use
    const userRepository = getRepository(User);
    try {
      await userRepository.save(user);
    } catch (e) {
      res.status(409).send("This is already exists");
      return;
    }

    //If all ok, send 201 response
    res.send("User has been successfully created!!");
  };

  static editUser = async (req: Request, res: Response) => {
    //Get the ID from the url
    const id = req.params.id;

    //Get values from the body
    const { username, email, phone } = req.body;

    //Try to find user on database
    const userRepository = getRepository(User);
    let user
    try {
      user = await userRepository.findOneOrFail(id);
    } catch (error) {
      //If not found, send a 404 response
      res.status(404).send("User not found");
      return;
    }

    //Validate the new values on model
    user.username = username;
    user.email = email;
    user.phone = phone;


    //Try to safe, if fails, that means username already in use
    try {
      await userRepository.save(user);
    } catch (e) {
      res.status(409).send("This user is  already in use");
      return;
    }
    //After all send a 204 (no content, but accepted) response
    res.status(200).send(user)
  };

  static deleteUser = async (req: Request, res: Response) => {
    //Get the ID from the url
    const id = req.params.id;

    const userRepository = getRepository(User);
    let user: User;
    try {
      user = await userRepository.findOneOrFail(id);
    } catch (error) {
      res.status(404).send("User not found");
      return;
    }
    userRepository.delete(id);
    //After all send a 204 (no content, but accepted) response
    res.send("user has been deleted!!");
  };

  static forgetPassword = async (req: Request, res: Response) => {
    const email = req.body.email;

    const userRepository = getRepository(User);
    let user;
    let passtoken;
    try {
      user = await userRepository.findOneOrFail({
        select: ["id", "username", "role", "email"], where: { email: email }
      });
    } catch (error) {
      res.status(404).send("No user found with this email!!");
      return;
    }
    const forgetRepository = getRepository(Resetpassword)
    const forgetpassword = await forgetRepository.findOne({ where: { userId: user.id } })
    if (forgetpassword) {
      forgetRepository.delete(forgetpassword.id);
    }
    else {
      try {
        passtoken = crypto.randomBytes(32).toString()
      }
      catch (err) {
        console.log(err)
        res.send("problem in creating new password token")
      }
      let resetpaswrd = new Resetpassword();
      resetpaswrd.userId = user.id;
      resetpaswrd.token = passtoken;

      var forgetlink = resetpaswrd.hashToken();

      const forgetRepository = getRepository(Resetpassword)
      try {
        await forgetRepository.save(resetpaswrd);
      } catch (e) {
        res.send("User token already in use");
        return;
      }
    }
    var transporter = nodemailer.createTransport({
      service: 'Gmail',
      auth: {
        user: 'atuulpaal@gmail.com',
        pass: '90458124'
      }
    });

    let mailOptions = {
      from: 'atuulpaal@gmail.com',
      to: user.email,
      subject: 'Reset your account password',
      html: '<h4><b>Reset Password</b></h4>' +
        '<p>To reset your password, complete this form:</p>' +
        '<a href=' + config.clientUrl + 'reset/' + user.id + '/' + forgetlink + '">' + config.clientUrl + 'reset/' + user.id + '/' + forgetlink + '</a>' +
        '<br><br>' +
        '<p>--Team</p>'
    }
    console.log("mailoptions--->", mailOptions)
    transporter.sendMail(mailOptions, (err, info) => {
      console.log("response info is here ------>", info)
      if (err) {
        res.status(403).send(err)
      }
      else {
        res.status(200).send("Email has been sent on register email id!!")
      }
    });
  }
  static verify = async (req: Request, res: Response) => {
    const OTP = req.body.otp;
    const id = req.params.id;
    const userRepository = getRepository(User);
    const user = await userRepository.findOne({ where: { id: id } })

    if (!user) {
      res.status(404).send("user is not registered!!")
    }
    else {
      let status;
      console.log("sid-verify---------->", user.sid)
      const data = await twilioClient.verify.services(user.sid)
        .verificationChecks
        .create({ to: user.phone, code: OTP })
        .then(verification_check => {
          console.log("status--->", verification_check.status)
          status = verification_check.status;
        })
        .catch(err => {
          console.log("error--->", err)
        });

      if (status == 'approved') {
        await twilioClient.messages.create({
          from: config.twilioNumber,
          to: user.phone,
          body: "Your registration has been completed!!"
        }).then((message) => console.log(message.sid));

        user.smsotp = OTP;
        user.verified = true;
        const errors = await validate(user);
        if (errors.length > 0) {
          res.status(400).send("Error in validates user");
          return;
        }
        await userRepository.save(user);
        res.status(200).send("User has successfully verified your mobile number!!")
      }
    }
  }
}
export default UserController;
