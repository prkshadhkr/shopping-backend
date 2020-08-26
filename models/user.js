const db = require("../db");
const bcrypt = require("bcrypt");
const partialUpdate = require("../helpers/partialUpdate");
const ExpressError = require("../helpers/expressError");
const { BCRYPT_WORK_FACTOR } = require("../config");


/** related function for users */

class User {

  /** authenticate user with username, password. Return user or throw error */
  static async authenticate(data) {
    //find the user first
    const result = await db.query(
      `SELECT username,
        password,
        first_name,
        last_name,
        email,
        password,
        is_admin
      FROM users
      WHERE username = $1`,
      [data.username]
    );

    const user = result.rows[0];
    if(!user){
      throw new Error(`No user found`);
    }
    //comare hashed password from user to hashed password from db
    const isValid = await bcrypt.compare(data.password, user.password);
    if(!isValid) {
      throw new ExpressError("Invalid password", 401);
    } 
    return user;
  }

  /** register user with  data, returns new user data */
  static async register(data) {
    const checkDuplicate = await db.query(
      `SELECT username
      FROM users
      WHERE username = $1`,
      [data.username]
    );

    if(checkDuplicate.rows[0]) {
      throw new ExpressError(
        `User already exist for username '${data.username}'`, 400
      );
    }

    const hashedPassword = await bcrypt.hash(data.password, BCRYPT_WORK_FACTOR);
    const result = await db.query(
      `INSERT INTO users
      (username, first_name, last_name, email, password, is_admin)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING username, first_name, last_name, email, password, is_admin`,
      [
        data.username,
        data.first_name,
        data.last_name,
        data.email,
        hashedPassword,
        data.is_admin || false
      ]
    );
    return result.rows[0];
  }

  /** find all users */
  static async findAll(){
    const result = await db.query(
      `SELECT 
        id,  
        username,
        first_name,
        last_name,
        email,
        is_admin
      FROM users
      ORDER BY username`
    );
    return result.rows;
  }

  /** given a username, return data about user */
  static async findOne(username){
    const result = await db.query(
      `SELECT username,
        id,
        first_name,
        last_name,
        email,
        is_admin
      FROM users
      WHERE username = $1`,
      [username]
    );

    const user = result.rows[0];
    if(!user){
      throw new ExpressError(`There is no user of username '${username}'`, 404);
    }
    return user;
  }

  /** update user with data */
  static async update(username, data){
    if(data.password){
      data.password = await bcrypt.hash(data.password, BCRYPT_WORK_FACTOR);
    }
    
    let { query, values } = partialUpdate("users", data, "username", username);
    const result = await db.query(query, values);
    const user = result.rows[0];

    if(!user) {
      throw new ExpressError(`There is no user of username '${username}'`, 404);
    }

    delete user.password;
    delete user.is_admin;

    return result.rows[0];
  }

  /** delete given user from database, return undefined */
  static async remove(username){
    let result = await db.query(
      `DELETE FROM users
      WHERE username = $1
      RETURNING username`,
      [username]
    );
    if(result.rows.length === 0){
      throw new ExpressError(`There is no user of username '${username}'`, 404);
    }
  }
}


module.exports = User;