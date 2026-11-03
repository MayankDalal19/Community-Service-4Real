const express = require("express");

// Standard REST routes for a CRUD controller:
//   GET /  ·  POST /  ·  GET /:id  ·  PUT /:id  ·  DELETE /:id
module.exports = (c) => {
  const router = express.Router();
  router.route("/").get(c.list).post(c.create);
  router.route("/:id").get(c.getOne).put(c.update).delete(c.remove);
  return router;
};
